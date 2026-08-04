-- NHT Phase 2: applications CRM pipeline + file metadata

CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.application_type NOT NULL DEFAULT 'general',
  status public.application_status NOT NULL DEFAULT 'new',
  priority public.application_priority NOT NULL DEFAULT 'normal',
  assigned_manager UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  platform TEXT,
  message TEXT,
  locale TEXT NOT NULL DEFAULT 'en',
  notes TEXT,
  last_contact_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER applications_set_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX applications_status_idx ON public.applications (status);
CREATE INDEX applications_type_idx ON public.applications (type);
CREATE INDEX applications_priority_idx ON public.applications (priority);
CREATE INDEX applications_assigned_manager_idx ON public.applications (assigned_manager);
CREATE INDEX applications_created_at_idx ON public.applications (created_at DESC);
CREATE INDEX applications_email_idx ON public.applications (email);

CREATE TABLE public.application_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications (id) ON DELETE CASCADE,
  bucket TEXT NOT NULL DEFAULT 'applications',
  path TEXT NOT NULL,
  category TEXT NOT NULL CHECK (
    category IN ('screenshots', 'identity', 'contracts', 'other')
  ),
  file_name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT CHECK (size_bytes IS NULL OR size_bytes >= 0),
  uploaded_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (bucket, path)
);

CREATE INDEX application_files_application_id_idx
  ON public.application_files (application_id);

CREATE INDEX application_files_category_idx
  ON public.application_files (category);
