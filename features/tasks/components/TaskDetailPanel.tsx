"use client";

import {
  useMemo,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  addTaskComment,
  addTaskSubtask,
  archiveTask,
  assignTask,
  changeTaskDueDate,
  changeTaskStatus,
  deleteTask,
  deleteTaskAttachment,
  deleteTaskComment,
  deleteTaskSubtask,
  duplicateTask,
  updateTask,
  updateTaskComment,
  updateTaskSubtask,
  uploadTaskAttachment,
} from "@/features/tasks/actions/tasks";
import {
  TaskDeadlineBadge,
  TaskPriorityBadge,
  TaskStatusBadge,
  type TaskDeadlineLabels,
} from "@/features/tasks/components/TaskBadges";
import {
  formatTaskDateTime,
  isTaskOverdue,
} from "@/features/tasks/lib/format";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import EmptyState from "@/shared/ui/EmptyState";
import UserAvatar from "@/shared/ui/UserAvatar";
import {
  CheckSquare,
  Download,
  History,
  MessageCircle,
  Paperclip,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskDetail,
  type TaskPriority,
  type TaskStatus,
  type TaskType,
} from "@/features/tasks/types";

type Option = { id: string; label: string };

type Labels = {
  back: string;
  description: string;
  history: string;
  comments: string;
  activity: string;
  attachments: string;
  subtasks: string;
  creator: string;
  assignee: string;
  department: string;
  due: string;
  type: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  unassigned: string;
  none: string;
  assign: string;
  complete: string;
  review: string;
  archive: string;
  delete: string;
  save: string;
  saving: string;
  edit: string;
  duplicate: string;
  quickActions: string;
  changeStatus: string;
  changeAssignee: string;
  changeDue: string;
  addComment: string;
  commentPlaceholder: string;
  emptyComments: string;
  emptyActivity: string;
  emptyAttachments: string;
  emptyAttachmentsDesc: string;
  emptySubtasks: string;
  addSubtask: string;
  subtaskPlaceholder: string;
  upload: string;
  download: string;
  remove: string;
  editComment: string;
  deleteComment: string;
  sendHint: string;
  deadline: Omit<TaskDeadlineLabels, "inDays">;
  timeline: Record<string, string>;
  errorFallback: string;
  confirmDeleteTitle: string;
  confirmDeleteDesc: string;
  confirm: string;
  cancel: string;
};

type Props = {
  task: TaskDetail;
  locale: string;
  currentUserId: string;
  isOwnerActor: boolean;
  assignees: Option[];
  canUpdate: boolean;
  canDelete: boolean;
  canCreate: boolean;
  labels: Labels;
  statusLabels: Record<TaskStatus, string>;
  priorityLabels: Record<TaskPriority, string>;
  typeLabels: Record<TaskType, string>;
  departmentLabels: Record<string, string>;
};

export default function TaskDetailPanel({
  task,
  locale,
  currentUserId,
  isOwnerActor,
  assignees,
  canUpdate,
  canDelete,
  canCreate,
  labels,
  statusLabels,
  priorityLabels,
  typeLabels,
  departmentLabels,
}: Props) {
  const t = useTranslations("admin.tasks");
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [assigneeId, setAssigneeId] = useState(task.assigned_to ?? "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [dueDate, setDueDate] = useState(task.due_date?.slice(0, 10) ?? "");
  const [comment, setComment] = useState("");
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentBody, setEditingCommentBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const overdue = isTaskOverdue(task.due_date, task.status);
  const doneCount = task.subtasks.filter((item) => item.is_done).length;

  const department =
    task.assignee?.department &&
    (departmentLabels[task.assignee.department] ?? task.assignee.department);

  function run(
    action: () => Promise<{ success: boolean; error?: string; id?: string }>,
    next?: (result: { success: true; id?: string }) => void,
  ) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error ?? labels.errorFallback);
        return;
      }
      next?.(result as { success: true; id?: string });
      router.refresh();
    });
  }

  function onCommentKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!comment.trim() || isPending || !canUpdate) return;
      run(
        () => addTaskComment({ task_id: task.id, body: comment }),
        () => setComment(""),
      );
    }
  }

  const activityItems = useMemo(
    () =>
      task.activity.map((item) => ({
        ...item,
        label: labels.timeline[item.event_type] ?? item.description,
      })),
    [task.activity, labels.timeline],
  );

  return (
    <div className="space-y-6">
      <Link
        href="/admin/tasks"
        className="text-xs text-[var(--nht-text-tertiary)] transition hover:text-[var(--nht-accent)]"
      >
        {labels.back}
      </Link>

      <section
        className={`rounded-[var(--nht-radius-xl)] border bg-white/[0.02] p-5 backdrop-blur ${
          overdue
            ? "border-red-500/30"
            : "border-white/[0.06]"
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-3">
            {editing && canUpdate ? (
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="nht-input text-lg font-semibold text-white"
              />
            ) : (
              <h1 className="text-2xl font-semibold text-white">{task.title}</h1>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <TaskStatusBadge status={task.status} label={statusLabels[task.status]} />
              <TaskPriorityBadge
                priority={task.priority}
                label={priorityLabels[task.priority]}
              />
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-[var(--nht-text-tertiary)]">
                {typeLabels[task.type]}
              </span>
              <TaskDeadlineBadge
                dueDate={task.due_date}
                status={task.status}
                labels={{
                  ...labels.deadline,
                  inDays: (days) => t("deadline.inDays", { days }),
                }}
              />
            </div>
            <p className="text-sm text-[var(--nht-text-secondary)]">
              {task.assignee?.full_name ?? labels.unassigned}
              {department ? ` · ${department}` : null}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {canUpdate ? (
              <>
                <ActionButton
                  label={editing ? labels.save : labels.edit}
                  primary={editing}
                  disabled={isPending}
                  onClick={() => {
                    if (!editing) {
                      setEditing(true);
                      return;
                    }
                    run(
                      () =>
                        updateTask({
                          id: task.id,
                          title,
                          description,
                          priority,
                        }),
                      () => setEditing(false),
                    );
                  }}
                />
                <ActionButton
                  label={labels.archive}
                  disabled={isPending || task.status === "archived"}
                  onClick={() => run(() => archiveTask({ id: task.id }))}
                />
              </>
            ) : null}
            {canDelete ? (
              <ActionButton
                label={labels.delete}
                danger
                disabled={isPending}
                onClick={() => setDeleteOpen(true)}
              />
            ) : null}
          </div>
        </div>

        {error ? <p className="mt-3 text-xs text-red-300">{error}</p> : null}
      </section>

      {canUpdate || canCreate ? (
        <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--nht-text-tertiary)]">
            {labels.quickActions}
          </h2>
          <div className="grid gap-3 lg:grid-cols-4">
            <label className="space-y-1.5">
              <span className="text-[11px] text-[var(--nht-text-tertiary)]">
                {labels.changeStatus}
              </span>
              <select
                value={status}
                disabled={!canUpdate || isPending}
                onChange={(event) => {
                  const next = event.target.value as TaskStatus;
                  setStatus(next);
                  run(() => changeTaskStatus({ id: task.id, status: next }));
                }}
                className="nht-input"
              >
                {TASK_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {statusLabels[value]}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-[11px] text-[var(--nht-text-tertiary)]">
                {labels.changeAssignee}
              </span>
              <select
                value={assigneeId}
                disabled={!canUpdate || isPending}
                onChange={(event) => {
                  const next = event.target.value;
                  setAssigneeId(next);
                  run(() =>
                    assignTask({
                      id: task.id,
                      assigned_to: next || null,
                    }),
                  );
                }}
                className="nht-input"
              >
                <option value="">{labels.unassigned}</option>
                {assignees.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-[11px] text-[var(--nht-text-tertiary)]">
                {labels.changeDue}
              </span>
              <input
                type="date"
                value={dueDate}
                disabled={!canUpdate || isPending}
                onChange={(event) => {
                  const next = event.target.value;
                  setDueDate(next);
                  run(() =>
                    changeTaskDueDate({
                      id: task.id,
                      due_date: next ? `${next}T12:00:00.000Z` : null,
                    }),
                  );
                }}
                className="nht-input"
              />
            </label>

            <div className="flex items-end gap-2">
              {canCreate ? (
                <ActionButton
                  label={labels.duplicate}
                  disabled={isPending}
                  onClick={() =>
                    run(
                      () => duplicateTask({ id: task.id }),
                      (result) => {
                        if (result.id) router.push(`/admin/tasks/${result.id}`);
                      },
                    )
                  }
                />
              ) : null}
              {canUpdate ? (
                <ActionButton
                  label={labels.archive}
                  disabled={isPending || task.status === "archived"}
                  onClick={() => run(() => archiveTask({ id: task.id }))}
                />
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="space-y-4 rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-white">{labels.description}</h2>
            {canUpdate && editing ? (
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value as TaskPriority)}
                className="nht-input w-auto"
              >
                {TASK_PRIORITIES.map((value) => (
                  <option key={value} value={value}>
                    {priorityLabels[value]}
                  </option>
                ))}
              </select>
            ) : null}
          </div>

          {editing && canUpdate ? (
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={6}
              className="nht-input"
            />
          ) : (
            <p className="whitespace-pre-wrap text-sm text-[var(--nht-text-secondary)]">
              {task.description || labels.none}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Meta
              label={labels.creator}
              value={
                task.creator ? (
                  <Link
                    href={`/admin/creators/${task.creator.id}`}
                    className="text-[var(--nht-accent)] hover:underline"
                  >
                    {task.creator.display_name || task.creator.email || "—"}
                  </Link>
                ) : (
                  labels.none
                )
              }
            />
            <Meta
              label={labels.assignee}
              value={task.assignee?.full_name ?? labels.unassigned}
            />
            <Meta label={labels.department} value={department || labels.none} />
            <Meta
              label={labels.due}
              value={
                <span className={overdue ? "text-red-300" : undefined}>
                  {formatTaskDateTime(task.due_date, locale)}
                </span>
              }
            />
            <Meta
              label={labels.createdAt}
              value={formatTaskDateTime(task.created_at, locale)}
            />
            <Meta
              label={labels.updatedAt}
              value={formatTaskDateTime(task.updated_at, locale)}
            />
          </div>
        </section>

        <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-medium text-white">
              <CheckSquare className="h-4 w-4 text-[var(--nht-accent)]" />
              {labels.subtasks}
            </h2>
            <span className="text-xs text-[var(--nht-text-tertiary)]">
              {t("detail.progress", {
                done: doneCount,
                total: task.subtasks.length,
              })}
            </span>
          </div>

          {task.subtasks.length === 0 ? (
            <p className="text-sm text-[var(--nht-text-tertiary)]">
              {labels.emptySubtasks}
            </p>
          ) : (
            <ul className="space-y-2">
              {task.subtasks.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-[var(--nht-radius-lg)] border border-white/[0.04] px-3 py-2 transition hover:border-white/[0.08]"
                >
                  <input
                    type="checkbox"
                    checked={item.is_done}
                    disabled={!canUpdate || isPending}
                    onChange={(event) =>
                      run(() =>
                        updateTaskSubtask({
                          id: item.id,
                          is_done: event.target.checked,
                        }),
                      )
                    }
                    className="h-4 w-4 accent-[var(--nht-accent)]"
                  />
                  <span
                    className={`flex-1 text-sm ${
                      item.is_done
                        ? "text-[var(--nht-text-tertiary)] line-through"
                        : "text-white"
                    }`}
                  >
                    {item.title}
                  </span>
                  {canUpdate ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => run(() => deleteTaskSubtask({ id: item.id }))}
                      className="text-[var(--nht-text-tertiary)] transition hover:text-red-300"
                      aria-label={labels.remove}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          {canUpdate ? (
            <form
              className="mt-4 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (!subtaskTitle.trim()) return;
                run(
                  () =>
                    addTaskSubtask({
                      task_id: task.id,
                      title: subtaskTitle,
                    }),
                  () => setSubtaskTitle(""),
                );
              }}
            >
              <input
                value={subtaskTitle}
                onChange={(event) => setSubtaskTitle(event.target.value)}
                placeholder={labels.subtaskPlaceholder}
                className="nht-input"
              />
              <button
                type="submit"
                disabled={isPending || !subtaskTitle.trim()}
                className="inline-flex items-center gap-1 rounded-full bg-[var(--nht-accent)] px-3 py-2 text-xs text-white disabled:opacity-60"
              >
                <Plus className="h-3.5 w-3.5" />
                {labels.addSubtask}
              </button>
            </form>
          ) : null}
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-medium text-white">
            <MessageCircle className="h-4 w-4 text-[var(--nht-accent)]" />
            {labels.comments}
          </h2>

          {task.comments.length === 0 ? (
            <p className="text-sm text-[var(--nht-text-tertiary)]">
              {labels.emptyComments}
            </p>
          ) : (
            <ul className="space-y-3">
              {task.comments.map((item) => {
                const canEditComment =
                  isOwnerActor || item.author_id === currentUserId;
                const name = item.author?.full_name ?? labels.none;
                return (
                  <li
                    key={item.id}
                    className="rounded-[var(--nht-radius-lg)] border border-white/[0.04] px-3 py-3"
                  >
                    <div className="flex items-start gap-3">
                      <UserAvatar name={name} src={item.author?.avatar_url} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs text-white">{name}</p>
                          <p className="text-[11px] text-[var(--nht-text-tertiary)]">
                            {formatTaskDateTime(item.created_at, locale)}
                          </p>
                        </div>
                        {editingCommentId === item.id ? (
                          <div className="mt-2 space-y-2">
                            <textarea
                              value={editingCommentBody}
                              onChange={(event) =>
                                setEditingCommentBody(event.target.value)
                              }
                              rows={3}
                              className="nht-input"
                            />
                            <div className="flex gap-2">
                              <ActionButton
                                label={labels.save}
                                primary
                                disabled={isPending}
                                onClick={() =>
                                  run(
                                    () =>
                                      updateTaskComment({
                                        id: item.id,
                                        body: editingCommentBody,
                                      }),
                                    () => setEditingCommentId(null),
                                  )
                                }
                              />
                              <ActionButton
                                label={labels.cancel}
                                onClick={() => setEditingCommentId(null)}
                              />
                            </div>
                          </div>
                        ) : (
                          <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--nht-text-secondary)]">
                            {item.body}
                          </p>
                        )}
                        {canEditComment && editingCommentId !== item.id ? (
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 text-[11px] text-[var(--nht-text-tertiary)] hover:text-[var(--nht-accent)]"
                              onClick={() => {
                                setEditingCommentId(item.id);
                                setEditingCommentBody(item.body);
                              }}
                            >
                              <Pencil className="h-3 w-3" />
                              {labels.editComment}
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 text-[11px] text-[var(--nht-text-tertiary)] hover:text-red-300"
                              onClick={() =>
                                run(() => deleteTaskComment({ id: item.id }))
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                              {labels.deleteComment}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {canUpdate ? (
            <div className="mt-4 space-y-2">
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                onKeyDown={onCommentKeyDown}
                placeholder={labels.commentPlaceholder}
                rows={3}
                className="nht-input"
              />
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] text-[var(--nht-text-tertiary)]">
                  {labels.sendHint}
                </p>
                <button
                  type="button"
                  disabled={isPending || !comment.trim()}
                  onClick={() =>
                    run(
                      () => addTaskComment({ task_id: task.id, body: comment }),
                      () => setComment(""),
                    )
                  }
                  className="rounded-full bg-[var(--nht-accent)] px-3 py-1.5 text-xs text-white disabled:opacity-60"
                >
                  {labels.addComment}
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-medium text-white">
            <History className="h-4 w-4 text-[var(--nht-accent)]" />
            {labels.history} / {labels.activity}
          </h2>
          {activityItems.length === 0 ? (
            <p className="text-sm text-[var(--nht-text-tertiary)]">
              {labels.emptyActivity}
            </p>
          ) : (
            <ol className="space-y-3">
              {activityItems.map((item, index) => (
                <li key={item.id} className="relative flex gap-3">
                  {index < activityItems.length - 1 ? (
                    <span
                      aria-hidden
                      className="absolute left-[11px] top-6 bottom-[-12px] w-px bg-[var(--nht-accent)]/30"
                    />
                  ) : null}
                  <span className="relative z-[1] mt-1 h-6 w-6 shrink-0 rounded-full border border-[var(--nht-accent)]/30 bg-[var(--nht-accent-muted)]" />
                  <div className="min-w-0 flex-1 rounded-[var(--nht-radius-lg)] border border-white/[0.04] px-3 py-3">
                    <p className="text-sm text-white">{item.label}</p>
                    <p className="mt-1 text-[11px] text-[var(--nht-text-tertiary)]">
                      {item.actor?.full_name ?? labels.none} ·{" "}
                      {formatTaskDateTime(item.created_at, locale)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-medium text-white">
            <Paperclip className="h-4 w-4 text-[var(--nht-accent)]" />
            {labels.attachments}
          </h2>
          {canUpdate ? (
            <>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.doc,.xlsx,.xls,.png,.jpg,.jpeg,.zip"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.set("file", file);
                  run(() => uploadTaskAttachment(task.id, formData), () => {
                    if (fileRef.current) fileRef.current.value = "";
                  });
                }}
              />
              <button
                type="button"
                disabled={isPending}
                onClick={() => fileRef.current?.click()}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white transition hover:border-[var(--nht-accent)]/40 hover:text-[var(--nht-accent)]"
              >
                {labels.upload}
              </button>
            </>
          ) : null}
        </div>

        {task.attachments.length === 0 ? (
          <EmptyState
            icon={Paperclip}
            title={labels.emptyAttachments}
            description={labels.emptyAttachmentsDesc}
          />
        ) : (
          <ul className="space-y-2">
            {task.attachments.map((file) => (
              <li
                key={file.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--nht-radius-lg)] border border-white/[0.04] px-3 py-3 transition hover:border-white/[0.08]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{file.file_name}</p>
                  <p className="text-[11px] text-[var(--nht-text-tertiary)]">
                    {file.uploader?.full_name ?? labels.none} ·{" "}
                    {formatTaskDateTime(file.created_at, locale)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {file.signedUrl ? (
                    <a
                      href={file.signedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white hover:text-[var(--nht-accent)]"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {labels.download}
                    </a>
                  ) : null}
                  {canUpdate &&
                  (isOwnerActor || file.uploaded_by === currentUserId) ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        run(() => deleteTaskAttachment({ id: file.id }))
                      }
                      className="inline-flex items-center gap-1 rounded-full border border-red-500/30 px-3 py-1.5 text-xs text-red-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {labels.remove}
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={deleteOpen}
        title={labels.confirmDeleteTitle}
        description={labels.confirmDeleteDesc}
        confirmLabel={labels.confirm}
        cancelLabel={labels.cancel}
        tone="danger"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false);
          run(() => deleteTask({ id: task.id }), () =>
            router.push("/admin/tasks"),
          );
        }}
      />
    </div>
  );
}

function Meta({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] uppercase tracking-wide text-[var(--nht-text-tertiary)]">
        {label}
      </p>
      <div className="text-sm text-white">{value}</div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  primary,
  danger,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs transition disabled:opacity-60 ${
        primary
          ? "bg-[var(--nht-accent)] text-white hover:opacity-90"
          : danger
            ? "border border-red-500/40 text-red-300 hover:bg-red-500/10"
            : "border border-white/10 text-white hover:border-white/20 hover:bg-white/[0.03]"
      }`}
    >
      {label}
    </button>
  );
}
