-- NHT Phase 8: Creator Cabinet schema, RLS, storage, impersonation

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_creator_role()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.get_user_role() = 'creator', false);
$$;

-- ---------------------------------------------------------------------------
-- Profiles: impersonation target for owner/admin
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS impersonating_creator_id UUID
    REFERENCES public.creators (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS profiles_impersonating_creator_id_idx
  ON public.profiles (impersonating_creator_id)
  WHERE impersonating_creator_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Creators: link to auth user + biography
-- ---------------------------------------------------------------------------

ALTER TABLE public.creators
  ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE REFERENCES public.profiles (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS biography TEXT;

CREATE INDEX IF NOT EXISTS creators_user_id_idx
  ON public.creators (user_id)
  WHERE user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.acting_creator_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT c.id
      FROM public.creators AS c
      WHERE c.user_id = auth.uid()
      LIMIT 1
    ),
    (
      SELECT p.impersonating_creator_id
      FROM public.profiles AS p
      WHERE p.id = auth.uid()
        AND public.is_admin_or_above()
        AND p.impersonating_creator_id IS NOT NULL
      LIMIT 1
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_creator(target_creator_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    public.is_owner()
    OR public.is_admin_or_above()
    OR (
      public.is_staff()
      AND EXISTS (
        SELECT 1
        FROM public.creators AS c
        WHERE c.id = target_creator_id
          AND c.manager_id = auth.uid()
      )
    )
    OR public.acting_creator_id() = target_creator_id,
    false
  );
$$;

-- Creators: allow self (or impersonated) read/update of own row
DROP POLICY IF EXISTS "creators_select_self_or_impersonated" ON public.creators;
CREATE POLICY "creators_select_self_or_impersonated"
  ON public.creators
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR id = public.acting_creator_id()
  );

DROP POLICY IF EXISTS "creators_update_self_or_impersonated" ON public.creators;
CREATE POLICY "creators_update_self_or_impersonated"
  ON public.creators
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR id = public.acting_creator_id()
  )
  WITH CHECK (
    user_id = auth.uid()
    OR id = public.acting_creator_id()
  );

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE public.platform_link_status AS ENUM (
    'linked', 'pending', 'disconnected', 'issue'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.cabinet_task_status AS ENUM (
    'open', 'in_progress', 'completed', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.cabinet_task_priority AS ENUM (
    'low', 'normal', 'high', 'urgent'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.payout_status AS ENUM (
    'pending', 'processing', 'completed', 'failed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.payout_method AS ENUM (
    'bank', 'paypal', 'crypto', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.creator_document_type AS ENUM (
    'passport', 'agreement', 'tax', 'bank'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.support_ticket_status AS ENUM (
    'open', 'waiting', 'answered', 'closed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Platform accounts
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.creator_platform_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  creator_id UUID NOT NULL REFERENCES public.creators (id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (
    platform IN (
      'onlyfans', 'fansly', 'instagram', 'tiktok', 'twitter', 'chaturbate'
    )
  ),
  username TEXT,
  profile_url TEXT,
  status public.platform_link_status NOT NULL DEFAULT 'pending',
  manager_notes TEXT,
  UNIQUE (creator_id, platform)
);

CREATE TRIGGER creator_platform_accounts_set_updated_at
  BEFORE UPDATE ON public.creator_platform_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.creator_platform_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "creator_platform_accounts_select"
  ON public.creator_platform_accounts FOR SELECT TO authenticated
  USING (public.can_access_creator(creator_id));

CREATE POLICY "creator_platform_accounts_insert"
  ON public.creator_platform_accounts FOR INSERT TO authenticated
  WITH CHECK (public.can_access_creator(creator_id));

CREATE POLICY "creator_platform_accounts_update"
  ON public.creator_platform_accounts FOR UPDATE TO authenticated
  USING (public.can_access_creator(creator_id))
  WITH CHECK (public.can_access_creator(creator_id));

CREATE POLICY "creator_platform_accounts_delete"
  ON public.creator_platform_accounts FOR DELETE TO authenticated
  USING (
    public.is_admin_or_above()
    OR public.acting_creator_id() = creator_id
  );

-- ---------------------------------------------------------------------------
-- Tasks
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.creator_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  creator_id UUID NOT NULL REFERENCES public.creators (id) ON DELETE CASCADE,
  manager_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  details TEXT,
  priority public.cabinet_task_priority NOT NULL DEFAULT 'normal',
  status public.cabinet_task_status NOT NULL DEFAULT 'open',
  deadline TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS creator_tasks_creator_id_idx
  ON public.creator_tasks (creator_id, status);

CREATE TRIGGER creator_tasks_set_updated_at
  BEFORE UPDATE ON public.creator_tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.creator_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "creator_tasks_select"
  ON public.creator_tasks FOR SELECT TO authenticated
  USING (public.can_access_creator(creator_id));

CREATE POLICY "creator_tasks_update_actor"
  ON public.creator_tasks FOR UPDATE TO authenticated
  USING (public.can_access_creator(creator_id))
  WITH CHECK (public.can_access_creator(creator_id));

CREATE POLICY "creator_tasks_insert_staff"
  ON public.creator_tasks FOR INSERT TO authenticated
  WITH CHECK (public.is_staff() AND public.can_access_creator(creator_id));

CREATE POLICY "creator_tasks_delete_staff"
  ON public.creator_tasks FOR DELETE TO authenticated
  USING (public.is_admin_or_above());

-- ---------------------------------------------------------------------------
-- Payouts
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.creator_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  creator_id UUID NOT NULL REFERENCES public.creators (id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status public.payout_status NOT NULL DEFAULT 'pending',
  method public.payout_method NOT NULL DEFAULT 'bank',
  paid_at TIMESTAMPTZ,
  receipt_number TEXT
);

CREATE INDEX IF NOT EXISTS creator_payouts_creator_id_idx
  ON public.creator_payouts (creator_id, created_at DESC);

CREATE TRIGGER creator_payouts_set_updated_at
  BEFORE UPDATE ON public.creator_payouts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.creator_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "creator_payouts_select"
  ON public.creator_payouts FOR SELECT TO authenticated
  USING (public.can_access_creator(creator_id));

CREATE POLICY "creator_payouts_write_staff"
  ON public.creator_payouts FOR ALL TO authenticated
  USING (public.is_staff() AND public.can_access_creator(creator_id))
  WITH CHECK (public.is_staff() AND public.can_access_creator(creator_id));

-- ---------------------------------------------------------------------------
-- Documents
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.creator_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  creator_id UUID NOT NULL REFERENCES public.creators (id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  doc_type public.creator_document_type NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  bucket TEXT NOT NULL DEFAULT 'creator-documents',
  path TEXT NOT NULL,
  UNIQUE (creator_id, path)
);

CREATE INDEX IF NOT EXISTS creator_documents_creator_id_idx
  ON public.creator_documents (creator_id, created_at DESC);

ALTER TABLE public.creator_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "creator_documents_select"
  ON public.creator_documents FOR SELECT TO authenticated
  USING (public.can_access_creator(creator_id));

CREATE POLICY "creator_documents_insert"
  ON public.creator_documents FOR INSERT TO authenticated
  WITH CHECK (public.can_access_creator(creator_id));

CREATE POLICY "creator_documents_delete"
  ON public.creator_documents FOR DELETE TO authenticated
  USING (
    public.is_admin_or_above()
    OR public.acting_creator_id() = creator_id
  );

-- ---------------------------------------------------------------------------
-- Support tickets
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.creator_support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  creator_id UUID NOT NULL REFERENCES public.creators (id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  status public.support_ticket_status NOT NULL DEFAULT 'open',
  unread_for_creator INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS creator_support_tickets_creator_id_idx
  ON public.creator_support_tickets (creator_id, updated_at DESC);

CREATE TRIGGER creator_support_tickets_set_updated_at
  BEFORE UPDATE ON public.creator_support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.creator_support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "creator_support_tickets_select"
  ON public.creator_support_tickets FOR SELECT TO authenticated
  USING (public.can_access_creator(creator_id));

CREATE POLICY "creator_support_tickets_insert"
  ON public.creator_support_tickets FOR INSERT TO authenticated
  WITH CHECK (public.acting_creator_id() = creator_id OR public.is_staff());

CREATE POLICY "creator_support_tickets_update"
  ON public.creator_support_tickets FOR UPDATE TO authenticated
  USING (public.can_access_creator(creator_id))
  WITH CHECK (public.can_access_creator(creator_id));

CREATE TABLE IF NOT EXISTS public.creator_support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ticket_id UUID NOT NULL REFERENCES public.creator_support_tickets (id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  is_staff BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS creator_support_messages_ticket_id_idx
  ON public.creator_support_messages (ticket_id, created_at);

ALTER TABLE public.creator_support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "creator_support_messages_select"
  ON public.creator_support_messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.creator_support_tickets AS t
      WHERE t.id = ticket_id AND public.can_access_creator(t.creator_id)
    )
  );

CREATE POLICY "creator_support_messages_insert"
  ON public.creator_support_messages FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.creator_support_tickets AS t
      WHERE t.id = ticket_id AND public.can_access_creator(t.creator_id)
    )
  );

-- ---------------------------------------------------------------------------
-- Settings
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.creator_settings (
  creator_id UUID PRIMARY KEY REFERENCES public.creators (id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  locale TEXT,
  notify_telegram BOOLEAN NOT NULL DEFAULT true,
  notify_email BOOLEAN NOT NULL DEFAULT true
);

CREATE TRIGGER creator_settings_set_updated_at
  BEFORE UPDATE ON public.creator_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.creator_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "creator_settings_select"
  ON public.creator_settings FOR SELECT TO authenticated
  USING (public.can_access_creator(creator_id));

CREATE POLICY "creator_settings_upsert"
  ON public.creator_settings FOR ALL TO authenticated
  USING (public.acting_creator_id() = creator_id OR public.is_admin_or_above())
  WITH CHECK (public.acting_creator_id() = creator_id OR public.is_admin_or_above());

-- ---------------------------------------------------------------------------
-- Daily stats + activity
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.creator_stats_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.creators (id) ON DELETE CASCADE,
  day DATE NOT NULL,
  revenue NUMERIC(14, 2) NOT NULL DEFAULT 0,
  growth NUMERIC(10, 2) NOT NULL DEFAULT 0,
  subscribers INTEGER NOT NULL DEFAULT 0,
  messages INTEGER NOT NULL DEFAULT 0,
  content INTEGER NOT NULL DEFAULT 0,
  UNIQUE (creator_id, day)
);

CREATE INDEX IF NOT EXISTS creator_stats_daily_creator_day_idx
  ON public.creator_stats_daily (creator_id, day DESC);

ALTER TABLE public.creator_stats_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "creator_stats_daily_select"
  ON public.creator_stats_daily FOR SELECT TO authenticated
  USING (public.can_access_creator(creator_id));

CREATE POLICY "creator_stats_daily_write_staff"
  ON public.creator_stats_daily FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE TABLE IF NOT EXISTS public.creator_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  creator_id UUID NOT NULL REFERENCES public.creators (id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  body TEXT
);

CREATE INDEX IF NOT EXISTS creator_activity_creator_id_idx
  ON public.creator_activity (creator_id, created_at DESC);

ALTER TABLE public.creator_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "creator_activity_select"
  ON public.creator_activity FOR SELECT TO authenticated
  USING (public.can_access_creator(creator_id));

CREATE POLICY "creator_activity_insert"
  ON public.creator_activity FOR INSERT TO authenticated
  WITH CHECK (public.can_access_creator(creator_id));

-- ---------------------------------------------------------------------------
-- Storage bucket
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'creator-documents',
  'creator-documents',
  false,
  52428800,
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "creator_documents_storage_select" ON storage.objects;
CREATE POLICY "creator_documents_storage_select"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'creator-documents'
    AND public.can_access_creator((storage.foldername(name))[1]::uuid)
  );

DROP POLICY IF EXISTS "creator_documents_storage_insert" ON storage.objects;
CREATE POLICY "creator_documents_storage_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'creator-documents'
    AND public.can_access_creator((storage.foldername(name))[1]::uuid)
  );

DROP POLICY IF EXISTS "creator_documents_storage_delete" ON storage.objects;
CREATE POLICY "creator_documents_storage_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'creator-documents'
    AND (
      public.is_admin_or_above()
      OR public.acting_creator_id() = (storage.foldername(name))[1]::uuid
    )
  );
