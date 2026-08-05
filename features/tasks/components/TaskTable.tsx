import { Link } from "@/i18n/navigation";
import { ListTodo } from "lucide-react";
import EmptyState from "@/shared/ui/EmptyState";
import {
  TaskDeadlineBadge,
  TaskPriorityBadge,
  TaskStatusBadge,
  type TaskDeadlineLabels,
} from "@/features/tasks/components/TaskBadges";
import { formatTaskDate, isTaskOverdue } from "@/features/tasks/lib/format";
import type {
  TaskListItem,
  TaskPriority,
  TaskStatus,
  TaskType,
} from "@/features/tasks/types";

type Props = {
  items: TaskListItem[];
  locale: string;
  labels: {
    title: string;
    creator: string;
    assigned: string;
    priority: string;
    status: string;
    due: string;
    actions: string;
    view: string;
    empty: string;
    emptyTitle?: string;
    emptyDescription?: string;
    unassigned: string;
    none: string;
  };
  deadlineLabels: TaskDeadlineLabels;
  statusLabels: Record<TaskStatus, string>;
  priorityLabels: Record<TaskPriority, string>;
  typeLabels: Record<TaskType, string>;
};

export default function TaskTable({
  items,
  locale,
  labels,
  deadlineLabels,
  statusLabels,
  priorityLabels,
}: Props) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={ListTodo}
        title={labels.emptyTitle ?? labels.empty}
        description={labels.emptyDescription}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-[var(--nht-radius-xl)] border border-white/[0.06]">
      <table className="min-w-full text-left text-sm">
        <thead className="sticky top-0 z-10 border-b border-white/[0.06] bg-[var(--nht-black-elevated)]/95 text-overline text-[var(--nht-text-tertiary)] backdrop-blur">
          <tr>
            <th className="px-4 py-3 font-medium">{labels.title}</th>
            <th className="px-4 py-3 font-medium">{labels.creator}</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">
              {labels.assigned}
            </th>
            <th className="px-4 py-3 font-medium">{labels.priority}</th>
            <th className="px-4 py-3 font-medium">{labels.status}</th>
            <th className="px-4 py-3 font-medium">{labels.due}</th>
            <th className="px-4 py-3 text-right font-medium">{labels.actions}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const overdue = isTaskOverdue(item.due_date, item.status);
            return (
              <tr
                key={item.id}
                className="border-b border-white/[0.04] transition hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/tasks/${item.id}`}
                    className="font-medium text-white hover:text-[var(--nht-accent)]"
                  >
                    {item.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                  {item.creator ? (
                    <Link
                      href={`/admin/creators/${item.creator.id}`}
                      className="hover:text-[var(--nht-accent)]"
                    >
                      {item.creator.display_name ||
                        item.creator.email ||
                        labels.none}
                    </Link>
                  ) : (
                    labels.none
                  )}
                </td>
                <td className="hidden px-4 py-3 text-[var(--nht-text-secondary)] md:table-cell">
                  {item.assignee?.full_name ?? labels.unassigned}
                </td>
                <td className="px-4 py-3">
                  <TaskPriorityBadge
                    priority={item.priority}
                    label={priorityLabels[item.priority]}
                  />
                </td>
                <td className="px-4 py-3">
                  <TaskStatusBadge
                    status={item.status}
                    label={statusLabels[item.status]}
                  />
                </td>
                <td
                  className={`px-4 py-3 ${
                    overdue ? "text-red-300" : "text-[var(--nht-text-secondary)]"
                  }`}
                >
                  <div className="space-y-1">
                    <div>{formatTaskDate(item.due_date, locale)}</div>
                    <TaskDeadlineBadge
                      dueDate={item.due_date}
                      status={item.status}
                      labels={deadlineLabels}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/tasks/${item.id}`}
                    className="text-xs text-[var(--nht-accent)] hover:underline"
                  >
                    {labels.view}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
