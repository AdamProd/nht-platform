-- NHT Commit 6/12: Creator CRM

CREATE TYPE public.creator_status AS ENUM (
  'new',
  'active',
  'paused',
  'vacation',
  'inactive',
  'banned'
);

CREATE TABLE public.creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  application_id UUID REFERENCES public.applications (id) ON DELETE SET NULL,
  manager_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  telegram TEXT,
  country TEXT,
  languages TEXT[] NOT NULL DEFAULT '{}',
  platforms TEXT[] NOT NULL DEFAULT '{}',
  status public.creator_status NOT NULL DEFAULT 'new',
  notes TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TRIGGER creators_set_updated_at
  BEFORE UPDATE ON public.creators
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX creators_email_idx ON public.creators (email);
CREATE INDEX creators_manager_id_idx ON public.creators (manager_id);
CREATE INDEX creators_status_idx ON public.creators (status);
CREATE INDEX creators_country_idx ON public.creators (country);
CREATE INDEX creators_platforms_idx ON public.creators USING GIN (platforms);
CREATE INDEX creators_created_at_idx ON public.creators (created_at DESC);
CREATE INDEX creators_full_name_idx ON public.creators (full_name);

ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;

-- Owner / admin: full access. Managers: only assigned creators.
CREATE POLICY "creators_select_staff_scoped"
  ON public.creators
  FOR SELECT
  TO authenticated
  USING (
    public.is_owner()
    OR public.is_admin_or_above()
    OR (
      public.is_staff()
      AND manager_id = auth.uid()
    )
  );

CREATE POLICY "creators_insert_staff_scoped"
  ON public.creators
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_owner()
    OR public.is_admin_or_above()
    OR (
      public.is_staff()
      AND manager_id = auth.uid()
    )
  );

CREATE POLICY "creators_update_staff_scoped"
  ON public.creators
  FOR UPDATE
  TO authenticated
  USING (
    public.is_owner()
    OR public.is_admin_or_above()
    OR (
      public.is_staff()
      AND manager_id = auth.uid()
    )
  )
  WITH CHECK (
    public.is_owner()
    OR public.is_admin_or_above()
    OR (
      public.is_staff()
      AND manager_id = auth.uid()
    )
  );

CREATE POLICY "creators_delete_admin"
  ON public.creators
  FOR DELETE
  TO authenticated
  USING (public.is_owner() OR public.is_admin_or_above());
