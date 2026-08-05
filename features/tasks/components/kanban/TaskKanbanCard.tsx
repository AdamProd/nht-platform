"use client";

import {
  memo,
  useState,
  useTransition,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import {
  Archive,
  Check,
  MessageCircle,
  Paperclip,
  Pencil,
  UserRound,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  archiveTask,
  assignTask,
  completeTask,
  updateTask,
} from "@/features/tasks/actions/tasks";
import {
  TaskDeadlineBadge,
  TaskPriorityBadge,
  TaskStatusBadge,
} from "@/features/tasks/components/TaskBadges";
import { isTaskOverdue } from "@/features/tasks/lib/format";
import type {
  KanbanStatus,
  TaskKanbanItem,
  TaskPriority,
  TaskStatus,
} from "@/features/tasks/types";

type Option = { id: string; label: string };

export type KanbanCardLabels = {
  creator: string;
  manager: string;
  due: string;
  priority: string;
  unassigned: string;
  none: string;
  edit: string;
  assign: string;
  complete: string;
  archive: string;
  save: string;
  cancel: string;
  comments: string;
  files: string;
  subtasks: string;
  overdue: string;
  errorFallback: string;
};

type Props = {
  task: TaskKanbanItem;
  locale: string;
  canUpdate: boolean;
  assignees: Option[];
  labels: KanbanCardLabels;
  statusLabels: Record<TaskStatus, string>;
  priorityLabels: Record<TaskPriority, string>;
  disabled?: boolean;
};

const PRIORITY_BAR: Record<TaskPriority, string> = {
  low: "bg-emerald-400",
  medium: "bg-amber-300",
  high: "bg-orange-400",
  urgent: "bg-red-400",
};

function TaskKanbanCard({
  task,
  locale,
  canUpdate,
  assignees,
  labels,
  statusLabels,
  priorityLabels,
  disabled,
}: Props) {
  const t = useTranslations("admin.tasks");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [error, setError] = useState<string | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task", status: task.status as KanbanStatus },
    disabled: disabled || !canUpdate || editing,
  });

  const overdue = isTaskOverdue(task.due_date, task.status);
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  };

  function run(action: () => Promise<{ success: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error ?? labels.errorFallback);
        return;
      }
      setEditing(false);
      setAssignOpen(false);
      router.refresh();
    });
  }

  return (
    <motion.article
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={`group relative overflow-hidden rounded-[var(--nht-radius-lg)] border bg-white/[0.03] backdrop-blur transition hover:border-white/15 hover:bg-white/[0.05] ${
        overdue ? "border-red-500/40" : "border-white/[0.06]"
      } ${isDragging ? "z-20 shadow-xl shadow-black/40 ring-1 ring-[var(--nht-accent)]/40" : ""}`}
    >
      <div className={`h-1 w-full ${PRIORITY_BAR[task.priority]}`} />

      <div
        className="cursor-grab space-y-3 p-3 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <div className="flex items-start justify-between gap-2">
          {editing ? (
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onPointerDown={(event) => event.stopPropagation()}
              className="nht-input text-sm font-medium text-white"
              autoFocus
            />
          ) : (
            <Link
              href={`/admin/tasks/${task.id}`}
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              className="line-clamp-2 text-sm font-medium text-white transition hover:text-[var(--nht-accent)]"
            >
              {task.title}
            </Link>
          )}
          <TaskStatusBadge
            status={task.status}
            label={statusLabels[task.status]}
          />
        </div>

        <dl className="grid gap-1.5 text-[11px] text-[var(--nht-text-tertiary)]">
          <div className="flex justify-between gap-2">
            <dt>{labels.creator}</dt>
            <dd className="truncate text-right text-[var(--nht-text-secondary)]">
              {task.creator?.display_name ||
                task.creator?.email ||
                labels.none}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>{labels.manager}</dt>
            <dd className="truncate text-right text-[var(--nht-text-secondary)]">
              {task.assignee?.full_name ?? labels.unassigned}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt>{labels.due}</dt>
            <dd className="text-right">
              {overdue ? (
                <span className="font-medium text-red-300">
                  🔴 {labels.overdue}
                </span>
              ) : (
                <TaskDeadlineBadge
                  dueDate={task.due_date}
                  status={task.status}
                  labels={{
                    none: t("deadline.none"),
                    overdue: t("deadline.overdue"),
                    today: t("deadline.today"),
                    tomorrow: t("deadline.tomorrow"),
                    inDays: (days) => t("deadline.inDays", { days }),
                  }}
                />
              )}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt>{labels.priority}</dt>
            <dd>
              <TaskPriorityBadge
                priority={task.priority}
                label={priorityLabels[task.priority]}
              />
            </dd>
          </div>
        </dl>

        <div className="flex items-center gap-3 text-[11px] text-[var(--nht-text-tertiary)]">
          <span className="inline-flex items-center gap-1" title={labels.comments}>
            <MessageCircle className="h-3 w-3" aria-hidden />
            {task.commentsCount}
          </span>
          <span className="inline-flex items-center gap-1" title={labels.files}>
            <Paperclip className="h-3 w-3" aria-hidden />
            {task.attachmentsCount}
          </span>
          <span className="inline-flex items-center gap-1" title={labels.subtasks}>
            ☑ {task.subtasksDone}/{task.subtasksTotal}
          </span>
        </div>
      </div>

      {canUpdate ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-1 flex justify-end gap-1 px-2 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <QuickBtn
            label={labels.edit}
            onClick={() => {
              setAssignOpen(false);
              setEditing((value) => !value);
              setTitle(task.title);
            }}
          >
            <Pencil className="h-3 w-3" />
          </QuickBtn>
          <QuickBtn
            label={labels.assign}
            onClick={() => {
              setEditing(false);
              setAssignOpen((value) => !value);
            }}
          >
            <UserRound className="h-3 w-3" />
          </QuickBtn>
          <QuickBtn
            label={labels.complete}
            disabled={isPending || task.status === "completed"}
            onClick={() => run(() => completeTask({ id: task.id }))}
          >
            <Check className="h-3 w-3" />
          </QuickBtn>
          <QuickBtn
            label={labels.archive}
            disabled={isPending}
            onClick={() => run(() => archiveTask({ id: task.id }))}
          >
            <Archive className="h-3 w-3" />
          </QuickBtn>
        </div>
      ) : null}

      {editing ? (
        <div
          className="flex gap-2 border-t border-white/[0.06] px-3 py-2"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            disabled={isPending || !title.trim()}
            className="rounded-full bg-[var(--nht-accent)] px-2.5 py-1 text-[11px] text-white disabled:opacity-60"
            onClick={() =>
              run(() => updateTask({ id: task.id, title: title.trim() }))
            }
          >
            {labels.save}
          </button>
          <button
            type="button"
            className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white"
            onClick={() => {
              setEditing(false);
              setTitle(task.title);
            }}
          >
            {labels.cancel}
          </button>
        </div>
      ) : null}

      {assignOpen ? (
        <div
          className="border-t border-white/[0.06] px-3 py-2"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <select
            className="nht-input text-xs"
            defaultValue={task.assigned_to ?? ""}
            disabled={isPending}
            onChange={(event) => {
              const next = event.target.value;
              run(() =>
                assignTask({
                  id: task.id,
                  assigned_to: next || null,
                }),
              );
            }}
          >
            <option value="">{labels.unassigned}</option>
            {assignees.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {error ? (
        <p className="px-3 pb-2 text-[11px] text-red-300">{error}</p>
      ) : null}

      <span className="sr-only">{locale}</span>
    </motion.article>
  );
}

function QuickBtn({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="rounded-full border border-white/10 bg-[var(--nht-black-elevated)]/90 p-1.5 text-white shadow-sm transition hover:border-[var(--nht-accent)]/40 hover:text-[var(--nht-accent)] disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export default memo(TaskKanbanCard);
