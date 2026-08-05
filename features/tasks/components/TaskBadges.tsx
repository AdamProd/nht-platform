import Badge from "@/shared/ui/Badge";
import type { TaskPriority, TaskStatus } from "@/features/tasks/types";
import {
  getDeadlineInfo,
  type DeadlineInfo,
} from "@/features/tasks/lib/format";

export function TaskStatusBadge({
  status,
  label,
}: {
  status: TaskStatus;
  label: string;
}) {
  const tone =
    status === "completed"
      ? "success"
      : status === "archived"
        ? "neutral"
        : status === "blocked"
          ? "danger"
          : status === "waiting"
            ? "warning"
            : status === "review"
              ? "warning"
              : status === "in_progress"
                ? "info"
                : "accent";

  return <Badge tone={tone}>{label}</Badge>;
}

export function TaskPriorityBadge({
  priority,
  label,
}: {
  priority: TaskPriority;
  label: string;
}) {
  const tone =
    priority === "urgent"
      ? "danger"
      : priority === "high"
        ? "warning"
        : priority === "medium"
          ? "info"
          : "success";

  const emoji =
    priority === "urgent"
      ? "🔴"
      : priority === "high"
        ? "🟠"
        : priority === "medium"
          ? "🟡"
          : "🟢";

  return (
    <Badge tone={tone}>
      <span className="mr-1" aria-hidden>
        {emoji}
      </span>
      {label}
    </Badge>
  );
}

export type TaskDeadlineLabels = {
  none: string;
  overdue: string;
  today: string;
  tomorrow: string;
  inDays: (days: number) => string;
};

export function TaskDeadlineBadge({
  dueDate,
  status,
  labels,
}: {
  dueDate: string | null | undefined;
  status: string;
  labels: TaskDeadlineLabels;
}) {
  const info = getDeadlineInfo(dueDate, status);
  if (info.key === "none" && info.tone === "none") {
    return (
      <span className="text-xs text-[var(--nht-text-tertiary)]">{labels.none}</span>
    );
  }

  const text = deadlineLabel(info, labels);
  const className =
    info.tone === "overdue"
      ? "text-red-300"
      : info.tone === "today"
        ? "text-amber-300"
        : info.tone === "tomorrow" || info.tone === "soon"
          ? "text-sky-300"
          : "text-[var(--nht-text-secondary)]";

  return <span className={`text-xs font-medium ${className}`}>{text}</span>;
}

function deadlineLabel(
  info: DeadlineInfo,
  labels: TaskDeadlineLabels,
): string {
  switch (info.key) {
    case "overdue":
      return labels.overdue;
    case "today":
      return labels.today;
    case "tomorrow":
      return labels.tomorrow;
    case "inDays":
      return labels.inDays(info.days ?? 0);
    default:
      return labels.none;
  }
}
