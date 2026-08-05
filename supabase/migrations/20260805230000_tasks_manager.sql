-- NHT Tasks Manager: statuses, subtasks, attachments, comment edits, storage

-- ---------------------------------------------------------------------------
-- Status enum upgrade: todo→new, cancelled→archived + waiting/blocked
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE public.task_status_v2 AS ENUM (
    'new',
    'in_progress',
    'waiting',
    'blocked',
    'review',
    'completed',
    'archived'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'tasks'
      AND column_name = 'status'
      AND udt_name = 'task_status'
  ) AND EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'task_status_v2'
  ) THEN
    ALTER TABLE public.tasks ALTER COLUMN status DROP DEFAULT;

    ALTER TABLE public.tasks
      ALTER COLUMN status TYPE public.task_status_v2
      USING (
        CASE status::text
          WHEN 'todo' THEN 'new'::public.task_status_v2
          WHEN 'cancelled' THEN 'archived'::public.task_status_v2
          WHEN 'new' THEN 'new'::public.task_status_v2
          WHEN 'in_progress' THEN 'in_progress'::public.task_status_v2
          WHEN 'waiting' THEN 'waiting'::public.task_status_v2
          WHEN 'blocked' THEN 'blocked'::public.task_status_v2
          WHEN 'review' THEN 'review'::public.task_status_v2
          WHEN 'completed' THEN 'completed'::public.task_status_v2
          WHEN 'archived' THEN 'archived'::public.task_status_v2
          ELSE 'new'::public.task_status_v2
        END
      );

    DROP TYPE public.task_status;
    ALTER TYPE public.task_status_v2 RENAME TO task_status;

    ALTER TABLE public.tasks
      ALTER COLUMN status SET DEFAULT 'new'::public.task_status;
  END IF;
END $$;

-- If tasks table was created with task_status_v2 already renamed, ensure default
ALTER TABLE public.tasks
  ALTER COLUMN status SET DEFAULT 'new'::public.task_status;

-- ---------------------------------------------------------------------------
-- Comments: edit support
-- ---------------------------------------------------------------------------

ALTER TABLE public.task_comments
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS task_comments_set_updated_at ON public.task_comments;
CREATE TRIGGER task_comments_set_updated_at
  BEFORE UPDATE ON public.task_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP POLICY IF EXISTS "task_comments_update_author_or_admin" ON public.task_comments;
CREATE POLICY "task_comments_update_author_or_admin"
  ON public.task_comments
  FOR UPDATE
  TO authenticated
  USING (public.is_admin_or_above() OR author_id = auth.uid())
  WITH CHECK (public.is_admin_or_above() OR author_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Subtasks (checklist)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.task_subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_done BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS task_subtasks_task_id_idx
  ON public.task_subtasks (task_id, position ASC);

DROP TRIGGER IF EXISTS task_subtasks_set_updated_at ON public.task_subtasks;
CREATE TRIGGER task_subtasks_set_updated_at
  BEFORE UPDATE ON public.task_subtasks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.task_subtasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "task_subtasks_select_staff" ON public.task_subtasks;
CREATE POLICY "task_subtasks_select_staff"
  ON public.task_subtasks FOR SELECT TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS "task_subtasks_insert_staff" ON public.task_subtasks;
CREATE POLICY "task_subtasks_insert_staff"
  ON public.task_subtasks FOR INSERT TO authenticated
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "task_subtasks_update_staff" ON public.task_subtasks;
CREATE POLICY "task_subtasks_update_staff"
  ON public.task_subtasks FOR UPDATE TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "task_subtasks_delete_staff" ON public.task_subtasks;
CREATE POLICY "task_subtasks_delete_staff"
  ON public.task_subtasks FOR DELETE TO authenticated
  USING (public.is_staff());

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.task_subtasks TO authenticated;
GRANT ALL ON TABLE public.task_subtasks TO service_role;

-- ---------------------------------------------------------------------------
-- Attachments
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks (id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  bucket TEXT NOT NULL DEFAULT 'task-files',
  path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (task_id, path)
);

CREATE INDEX IF NOT EXISTS task_attachments_task_id_idx
  ON public.task_attachments (task_id, created_at DESC);

ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "task_attachments_select_staff" ON public.task_attachments;
CREATE POLICY "task_attachments_select_staff"
  ON public.task_attachments FOR SELECT TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS "task_attachments_insert_staff" ON public.task_attachments;
CREATE POLICY "task_attachments_insert_staff"
  ON public.task_attachments FOR INSERT TO authenticated
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "task_attachments_delete_staff" ON public.task_attachments;
CREATE POLICY "task_attachments_delete_staff"
  ON public.task_attachments FOR DELETE TO authenticated
  USING (
    public.is_admin_or_above()
    OR uploaded_by = auth.uid()
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.task_attachments TO authenticated;
GRANT ALL ON TABLE public.task_attachments TO service_role;

-- ---------------------------------------------------------------------------
-- Storage bucket: task-files
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'task-files',
  'task-files',
  false,
  52428800,
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'image/png',
    'image/jpeg',
    'application/zip',
    'application/x-zip-compressed'
  ]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "task_files_select_staff" ON storage.objects;
CREATE POLICY "task_files_select_staff"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'task-files' AND public.is_staff());

DROP POLICY IF EXISTS "task_files_insert_staff" ON storage.objects;
CREATE POLICY "task_files_insert_staff"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'task-files' AND public.is_staff());

DROP POLICY IF EXISTS "task_files_update_staff" ON storage.objects;
CREATE POLICY "task_files_update_staff"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'task-files' AND public.is_staff())
  WITH CHECK (bucket_id = 'task-files' AND public.is_staff());

DROP POLICY IF EXISTS "task_files_delete_staff" ON storage.objects;
CREATE POLICY "task_files_delete_staff"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'task-files' AND public.is_staff());

-- ---------------------------------------------------------------------------
-- Task delete: owner only (app-level + RLS)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "tasks_delete_admin" ON public.tasks;
DROP POLICY IF EXISTS "tasks_delete_owner" ON public.tasks;
CREATE POLICY "tasks_delete_owner"
  ON public.tasks
  FOR DELETE
  TO authenticated
  USING (public.is_owner());
