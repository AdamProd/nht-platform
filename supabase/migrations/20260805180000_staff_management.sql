-- NHT Phase 10: Staff Management

-- Expand roles
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'support';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'moderator';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'content_manager';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'finance';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'viewer';

CREATE TYPE public.staff_status AS ENUM (
  'invited',
  'active',
  'vacation',
  'suspended',
  'disabled',
  'archived'
);

CREATE TYPE public.staff_department AS ENUM (
  'management',
  'sales',
  'support',
  'marketing',
  'content',
  'finance',
  'hr',
  'operations',
  'custom'
);

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

-- Staff = all employee roles (not creator/guest)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    public.get_user_role() IN (
      'owner',
      'admin',
      'manager',
      'support',
      'moderator',
      'content_manager',
      'finance',
      'viewer'
    ),
    false
  );
$$;

-- Backfill staff status for existing employee profiles
UPDATE public.profiles
SET status = 'active'
WHERE role IN (
  'owner',
  'admin',
  'manager',
  'support',
  'moderator',
  'content_manager',
  'finance',
  'viewer'
)
AND status IS NULL;
