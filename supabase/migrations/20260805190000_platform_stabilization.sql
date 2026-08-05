-- NHT Phase 11.1: Platform Stabilization
-- Idempotent sync for roles, staff profile columns, events, finance RLS.

-- ---------------------------------------------------------------------------
-- 1) Staff enums + profile columns (safe if Phase 10 already applied)
-- Enum role values are added in 20260805180000_staff_management.sql
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.staff_status AS ENUM (
    'invited', 'active', 'vacation', 'suspended', 'disabled', 'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.staff_department AS ENUM (
    'management', 'sales', 'support', 'marketing', 'content',
    'finance', 'hr', 'operations', 'custom'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS department public.staff_department,
  ADD COLUMN IF NOT EXISTS department_custom TEXT,
  ADD COLUMN IF NOT EXISTS status public.staff_status,
  ADD COLUMN IF NOT EXISTS timezone TEXT,
  ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS biography TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);
CREATE INDEX IF NOT EXISTS profiles_role_status_idx ON public.profiles (role, status);
CREATE INDEX IF NOT EXISTS profiles_department_idx ON public.profiles (department);

UPDATE public.profiles
SET status = 'active'
WHERE role::text IN (
  'owner', 'admin', 'manager', 'support', 'moderator',
  'content_manager', 'finance', 'viewer'
)
AND status IS NULL;

-- ---------------------------------------------------------------------------
-- 2) is_staff() includes expanded roles (text compare = enum-safe)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    public.get_user_role()::text IN (
      'owner', 'admin', 'manager', 'support', 'moderator',
      'content_manager', 'finance', 'viewer'
    ),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_finance_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    public.get_user_role()::text IN ('owner', 'admin', 'finance'),
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- 3) Platform events / notifications / activity (if missing)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  type TEXT NOT NULL,
  module TEXT NOT NULL,
  actor_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  actor_role public.user_role,
  target_id UUID,
  entity_type TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  visibility TEXT NOT NULL DEFAULT 'staff'
    CHECK (visibility IN ('owner', 'staff', 'manager_scoped')),
  related_creator_id UUID REFERENCES public.creators (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS platform_events_created_at_idx
  ON public.platform_events (created_at DESC);
CREATE INDEX IF NOT EXISTS platform_events_module_idx
  ON public.platform_events (module);
CREATE INDEX IF NOT EXISTS platform_events_type_idx
  ON public.platform_events (type);
CREATE INDEX IF NOT EXISTS platform_events_related_creator_idx
  ON public.platform_events (related_creator_id);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  recipient_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  module TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_id UUID REFERENCES public.platform_events (id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS notifications_recipient_created_idx
  ON public.notifications (recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_recipient_unread_idx
  ON public.notifications (recipient_id)
  WHERE read_at IS NULL AND archived_at IS NULL;

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_id UUID REFERENCES public.platform_events (id) ON DELETE SET NULL,
  actor_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  actor_role public.user_role,
  module TEXT NOT NULL,
  event_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  description TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  visibility TEXT NOT NULL DEFAULT 'staff'
    CHECK (visibility IN ('owner', 'staff', 'manager_scoped')),
  related_creator_id UUID REFERENCES public.creators (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx
  ON public.activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS activity_logs_module_idx
  ON public.activity_logs (module);
CREATE INDEX IF NOT EXISTS activity_logs_related_creator_idx
  ON public.activity_logs (related_creator_id);

ALTER TABLE public.platform_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "platform_events_insert_staff"
    ON public.platform_events FOR INSERT TO authenticated
    WITH CHECK (public.is_staff());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "platform_events_select_scoped"
    ON public.platform_events FOR SELECT TO authenticated
    USING (
      public.is_owner()
      OR (public.is_admin_or_above() AND visibility <> 'owner')
      OR (
        public.is_staff()
        AND visibility = 'manager_scoped'
        AND (
          related_creator_id IS NULL
          OR EXISTS (
            SELECT 1 FROM public.creators AS c
            WHERE c.id = related_creator_id AND c.manager_id = auth.uid()
          )
        )
      )
      OR (
        public.is_staff()
        AND visibility = 'staff'
        AND public.is_admin_or_above()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "notifications_select_own"
    ON public.notifications FOR SELECT TO authenticated
    USING (recipient_id = auth.uid() OR public.is_owner());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "notifications_insert_staff"
    ON public.notifications FOR INSERT TO authenticated
    WITH CHECK (public.is_staff() OR recipient_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "notifications_update_own"
    ON public.notifications FOR UPDATE TO authenticated
    USING (recipient_id = auth.uid() OR public.is_owner())
    WITH CHECK (recipient_id = auth.uid() OR public.is_owner());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "notifications_delete_own"
    ON public.notifications FOR DELETE TO authenticated
    USING (recipient_id = auth.uid() OR public.is_owner());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "activity_logs_select_scoped"
    ON public.activity_logs FOR SELECT TO authenticated
    USING (
      public.is_owner()
      OR (public.is_admin_or_above() AND visibility <> 'owner')
      OR (
        public.get_user_role() = 'manager'
        AND visibility = 'manager_scoped'
        AND (
          related_creator_id IS NULL
          OR EXISTS (
            SELECT 1 FROM public.creators AS c
            WHERE c.id = related_creator_id AND c.manager_id = auth.uid()
          )
        )
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "activity_logs_insert_staff"
    ON public.activity_logs FOR INSERT TO authenticated
    WITH CHECK (public.is_staff());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 4) Finance RLS: give finance role unscoped access matching app permissions
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'finance_transactions'
  ) THEN
    DROP POLICY IF EXISTS "finance_transactions_select_staff" ON public.finance_transactions;
    DROP POLICY IF EXISTS "finance_transactions_insert_staff" ON public.finance_transactions;
    DROP POLICY IF EXISTS "finance_transactions_update_staff" ON public.finance_transactions;
    DROP POLICY IF EXISTS "finance_transactions_delete_owner" ON public.finance_transactions;
    DROP POLICY IF EXISTS "finance_transactions_select_staff_scoped" ON public.finance_transactions;
    DROP POLICY IF EXISTS "finance_transactions_insert_staff_scoped" ON public.finance_transactions;
    DROP POLICY IF EXISTS "finance_transactions_update_staff_scoped" ON public.finance_transactions;
    DROP POLICY IF EXISTS "finance_transactions_delete_owner_only" ON public.finance_transactions;

    CREATE POLICY "finance_transactions_select_staff"
      ON public.finance_transactions FOR SELECT TO authenticated
      USING (
        public.is_finance_staff()
        OR (
          public.is_staff()
          AND (
            manager_id = auth.uid()
            OR EXISTS (
              SELECT 1 FROM public.creators AS c
              WHERE c.id = creator_id AND c.manager_id = auth.uid()
            )
          )
        )
      );

    CREATE POLICY "finance_transactions_insert_staff"
      ON public.finance_transactions FOR INSERT TO authenticated
      WITH CHECK (public.is_finance_staff() OR public.is_staff());

    CREATE POLICY "finance_transactions_update_staff"
      ON public.finance_transactions FOR UPDATE TO authenticated
      USING (
        public.is_finance_staff()
        OR (
          public.is_staff()
          AND (
            manager_id = auth.uid()
            OR EXISTS (
              SELECT 1 FROM public.creators AS c
              WHERE c.id = creator_id AND c.manager_id = auth.uid()
            )
          )
        )
      )
      WITH CHECK (
        public.is_finance_staff()
        OR (
          public.is_staff()
          AND (
            manager_id = auth.uid()
            OR EXISTS (
              SELECT 1 FROM public.creators AS c
              WHERE c.id = creator_id AND c.manager_id = auth.uid()
            )
          )
        )
      );

    CREATE POLICY "finance_transactions_delete_owner"
      ON public.finance_transactions FOR DELETE TO authenticated
      USING (public.is_owner() OR public.get_user_role() = 'admin');
  END IF;
END $$;
