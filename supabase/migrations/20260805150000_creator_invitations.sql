-- NHT Phase 8.1: Creator invitation status, profile completion, audit log

ALTER TYPE public.creator_status ADD VALUE IF NOT EXISTS 'invited';

ALTER TABLE public.creators
  ADD COLUMN IF NOT EXISTS profile_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.creator_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  creator_id UUID REFERENCES public.creators (id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS creator_audit_logs_creator_id_idx
  ON public.creator_audit_logs (creator_id, created_at DESC);

CREATE INDEX IF NOT EXISTS creator_audit_logs_actor_id_idx
  ON public.creator_audit_logs (actor_id, created_at DESC);

ALTER TABLE public.creator_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "creator_audit_logs_select_staff" ON public.creator_audit_logs;
CREATE POLICY "creator_audit_logs_select_staff"
  ON public.creator_audit_logs FOR SELECT TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS "creator_audit_logs_insert_staff" ON public.creator_audit_logs;
CREATE POLICY "creator_audit_logs_insert_staff"
  ON public.creator_audit_logs FOR INSERT TO authenticated
  WITH CHECK (public.is_staff());

-- Prefer role from auth metadata when a user is invited/created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta_role TEXT;
  resolved_role public.user_role;
BEGIN
  meta_role := NEW.raw_user_meta_data ->> 'role';
  IF meta_role IN ('owner', 'admin', 'manager', 'creator', 'guest') THEN
    resolved_role := meta_role::public.user_role;
  ELSE
    resolved_role := 'guest';
  END IF;

  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url',
    resolved_role
  );
  RETURN NEW;
END;
$$;
