-- Kanban board: per-column sort order for tasks

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS tasks_status_sort_order_idx
  ON public.tasks (status, sort_order ASC, created_at DESC);

-- Seed sort_order within each status by created_at (newest first → lower index)
WITH ranked AS (
  SELECT
    id,
    (ROW_NUMBER() OVER (
      PARTITION BY status
      ORDER BY created_at DESC, id ASC
    ) - 1)::integer AS next_order
  FROM public.tasks
)
UPDATE public.tasks AS t
SET sort_order = ranked.next_order
FROM ranked
WHERE t.id = ranked.id;
