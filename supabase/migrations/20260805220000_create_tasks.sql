-- NHT Phase 13: CRM Tasks (`public.tasks`)
-- Creates task enums, table, comments, indexes, RLS, and grants.

DO $$ BEGIN
  CREATE TYPE public.task_status AS ENUM (
    'todo',
    'in_progress',
    'review',
    'completed',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.task_priority AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.task_type AS ENUM (
    'creator',
    'finance',
    'support',
    'application',
    'staff',
    'custom'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status public.task_status NOT NULL DEFAULT 'todo',
  priority public.task_priority NOT NULL DEFAULT 'medium',
  type public.task_type NOT NULL DEFAULT 'custom',
  creator_id UUID REFERENCES public.creators (id) ON DELETE SET NULL,
  application_id UUID REFERENCES public.applications (id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tasks_assigned_to_idx ON public.tasks (assigned_to);
CREATE INDEX IF NOT EXISTS tasks_creator_id_idx ON public.tasks (creator_id);
CREATE INDEX IF NOT EXISTS tasks_application_id_idx ON public.tasks (application_id);
CREATE INDEX IF NOT EXISTS tasks_created_by_idx ON public.tasks (created_by);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON public.tasks (status);
CREATE INDEX IF NOT EXISTS tasks_priority_idx ON public.tasks (priority);
CREATE INDEX IF NOT EXISTS tasks_type_idx ON public.tasks (type);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON public.tasks (due_date);
CREATE INDEX IF NOT EXISTS tasks_archived_at_idx ON public.tasks (archived_at);
CREATE INDEX IF NOT EXISTS tasks_created_at_idx ON public.tasks (created_at DESC);

DROP TRIGGER IF EXISTS tasks_set_updated_at ON public.tasks;
CREATE TRIGGER tasks_set_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks (id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS task_comments_task_id_idx
  ON public.task_comments (task_id, created_at DESC);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tasks_select_staff" ON public.tasks;
CREATE POLICY "tasks_select_staff"
  ON public.tasks
  FOR SELECT
  TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS "tasks_insert_staff" ON public.tasks;
CREATE POLICY "tasks_insert_staff"
  ON public.tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "tasks_update_staff" ON public.tasks;
CREATE POLICY "tasks_update_staff"
  ON public.tasks
  FOR UPDATE
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "tasks_delete_admin" ON public.tasks;
CREATE POLICY "tasks_delete_admin"
  ON public.tasks
  FOR DELETE
  TO authenticated
  USING (public.is_admin_or_above());

DROP POLICY IF EXISTS "task_comments_select_staff" ON public.task_comments;
CREATE POLICY "task_comments_select_staff"
  ON public.task_comments
  FOR SELECT
  TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS "task_comments_insert_staff" ON public.task_comments;
CREATE POLICY "task_comments_insert_staff"
  ON public.task_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "task_comments_delete_admin" ON public.task_comments;
CREATE POLICY "task_comments_delete_admin"
  ON public.task_comments
  FOR DELETE
  TO authenticated
  USING (public.is_admin_or_above() OR author_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.task_comments TO authenticated;
GRANT ALL ON TABLE public.tasks TO service_role;
GRANT ALL ON TABLE public.task_comments TO service_role;
