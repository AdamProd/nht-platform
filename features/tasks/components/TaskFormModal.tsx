"use client";

import { useEffect, useState, useTransition } from "react";
import { X } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { createTask } from "@/features/tasks/actions/tasks";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_TYPES,
  type TaskPriority,
  type TaskStatus,
  type TaskType,
} from "@/features/tasks/types";

type Option = { id: string; label: string };

type Props = {
  creators: Option[];
  assignees: Option[];
  canCreate: boolean;
  defaultCreatorId?: string;
  labels: {
    open: string;
    title: string;
    submit: string;
    submitting: string;
    cancel: string;
    saved: string;
    error: string;
    fields: {
      title: string;
      description: string;
      type: string;
      priority: string;
      status: string;
      creator: string;
      assignTo: string;
      dueDate: string;
      none: string;
    };
  };
  statusLabels: Record<TaskStatus, string>;
  priorityLabels: Record<TaskPriority, string>;
  typeLabels: Record<TaskType, string>;
};

export default function TaskFormModal({
  creators,
  assignees,
  canCreate,
  defaultCreatorId,
  labels,
  statusLabels,
  priorityLabels,
  typeLabels,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(Boolean(defaultCreatorId));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    function onOpenCreate() {
      setOpen(true);
      setError(null);
    }
    window.addEventListener("nht:tasks-open-create", onOpenCreate);
    return () => {
      window.removeEventListener("nht:tasks-open-create", onOpenCreate);
    };
  }, []);

  if (!canCreate) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-[var(--nht-accent)] px-4 py-2 text-xs font-medium text-white transition hover:opacity-90"
      >
        {labels.open}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:p-8">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-form-title"
            className="w-full max-w-2xl rounded-[var(--nht-radius-xl)] border border-white/[0.08] bg-[var(--nht-black-elevated)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <h2 id="task-form-title" className="text-sm font-medium text-white">
                {labels.title}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-[var(--nht-text-tertiary)] hover:text-white"
                aria-label={labels.cancel}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              className="space-y-4 px-5 py-5"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                setError(null);
                startTransition(async () => {
                  const result = await createTask({
                    title: form.get("title"),
                    description: form.get("description"),
                    type: form.get("type"),
                    priority: form.get("priority"),
                    status: form.get("status"),
                    creator_id: form.get("creator_id"),
                    assigned_to: form.get("assigned_to"),
                    due_date: form.get("due_date")
                      ? `${form.get("due_date")}T12:00:00.000Z`
                      : "",
                  });
                  if (!result.success) {
                    setError(result.error || labels.error);
                    return;
                  }
                  setOpen(false);
                  router.refresh();
                  if (result.id) router.push(`/admin/tasks/${result.id}`);
                });
              }}
            >
              <label className="block space-y-1.5">
                <span className="text-xs text-[var(--nht-text-tertiary)]">
                  {labels.fields.title} *
                </span>
                <input name="title" required className="nht-input" />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs text-[var(--nht-text-tertiary)]">
                  {labels.fields.description}
                </span>
                <textarea name="description" rows={3} className="nht-input" />
              </label>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block space-y-1.5">
                  <span className="text-xs text-[var(--nht-text-tertiary)]">
                    {labels.fields.type}
                  </span>
                  <select name="type" defaultValue="creator" className="nht-input">
                    {TASK_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {typeLabels[type]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs text-[var(--nht-text-tertiary)]">
                    {labels.fields.priority}
                  </span>
                  <select name="priority" defaultValue="medium" className="nht-input">
                    {TASK_PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>
                        {priorityLabels[priority]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs text-[var(--nht-text-tertiary)]">
                    {labels.fields.status}
                  </span>
                  <select name="status" defaultValue="new" className="nht-input">
                    {TASK_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-xs text-[var(--nht-text-tertiary)]">
                    {labels.fields.creator}
                  </span>
                  <select
                    name="creator_id"
                    defaultValue={defaultCreatorId ?? ""}
                    className="nht-input"
                  >
                    <option value="">{labels.fields.none}</option>
                    {creators.map((creator) => (
                      <option key={creator.id} value={creator.id}>
                        {creator.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs text-[var(--nht-text-tertiary)]">
                    {labels.fields.assignTo}
                  </span>
                  <select name="assigned_to" defaultValue="" className="nht-input">
                    <option value="">{labels.fields.none}</option>
                    {assignees.map((assignee) => (
                      <option key={assignee.id} value={assignee.id}>
                        {assignee.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block space-y-1.5">
                <span className="text-xs text-[var(--nht-text-tertiary)]">
                  {labels.fields.dueDate}
                </span>
                <input type="date" name="due_date" className="nht-input" />
              </label>

              {error ? (
                <p className="text-xs text-red-300">{error}</p>
              ) : null}

              <div className="flex justify-end gap-2 border-t border-white/[0.06] pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs text-white"
                >
                  {labels.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-full bg-[var(--nht-accent)] px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
                >
                  {isPending ? labels.submitting : labels.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
