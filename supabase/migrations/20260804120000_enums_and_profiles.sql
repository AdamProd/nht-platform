-- NHT Phase 2: enums, shared helpers, profiles

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE public.user_role AS ENUM (
  'owner',
  'admin',
  'manager',
  'creator',
  'guest'
);

CREATE TYPE public.application_type AS ENUM (
  'creator',
  'agency',
  'partnership',
  'general'
);

CREATE TYPE public.application_status AS ENUM (
  'new',
  'reviewing',
  'contacted',
  'meeting',
  'active',
  'rejected',
  'archived'
);

CREATE TYPE public.application_priority AS ENUM (
  'low',
  'normal',
  'high',
  'urgent'
);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'guest',
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE INDEX profiles_role_idx ON public.profiles (role);
