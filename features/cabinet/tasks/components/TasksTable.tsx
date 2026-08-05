"use client";

import { useOptimistic, useTransition } from "react";
import { completeTask } from "@/features/cabinet/profile/actions/cabinet";
import { FlashToast, useActionToast } from "@/features/cabinet/dashboard/FlashToast";

type TaskRow = {
  id: string;
  title: string;
  details: string | null;
  priority: string;
  status: string;
  deadline: string | null;
  manager?: { full_name: string | null } | null;
};

type Labels = {
  table: Record<string, string>;
  priority: Record<string, string>;
  status: Record<string, string>;
  actions: { complete: string; completing: string; completed: string };
  empty: string;
  unassigned: string;
  toastCompleted: string;
  saveError: string;
};

export default function TasksTable({
  tasks,
  locale,
  labels,
}: {
  tasks: TaskRow[];
  locale: string;
  labels: Labels;
}) {
  const [rows, setRows] = useOptimistic(tasks);
  const [, startTransition] = useTransition();
  const { toast, tone, run } = useActionToast();

  if (rows.length === 0) {
    return (
      <div className="rounded-[var(--nht-radius-xl)] border border-dashed border-white/[0.1] px-6 py-16 text-center text-sm text-[var(--nht-text-secondary)]">
        {labels.empty}
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-[var(--nht-radius-xl)] border border-white/[0.06]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/[0.06] bg-white/[0.02]">
            <tr className="text-overline text-[var(--nht-text-tertiary)]">
              <th className="px-4 py-3 font-medium">{labels.table.title}</th>
              <th className="px-4 py-3 font-medium">{labels.table.priority}</th>
              <th className="px-4 py-3 font-medium">{labels.table.status}</th>
              <th className="px-4 py-3 font-medium">{labels.table.deadline}</th>
              <th className="px-4 py-3 font-medium">{labels.table.manager}</th>
              <th className="px-4 py-3 font-medium">{labels.table.details}</th>
              <th className="px-4 py-3 font-medium">{labels.table.actions}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((task) => (
              <tr key={task.id} className="border-b border-white/[0.04]">
                <td className="px-4 py-3 text-white">{task.title}</td>
                <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                  {labels.priority[task.priority] ?? task.priority}
                </td>
                <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                  {labels.status[task.status] ?? task.status}
                </td>
                <td className="px-4 py-3 text-[var(--nht-text-tertiary)]">
                  {task.deadline
                    ? new Intl.DateTimeFormat(locale, {
                        dateStyle: "medium",
                      }).format(new Date(task.deadline))
                    : "—"}
                </td>
                <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                  {task.manager?.full_name ?? labels.unassigned}
                </td>
                <td className="max-w-xs px-4 py-3 text-[var(--nht-text-tertiary)]">
                  {task.details ?? "—"}
                </td>
                <td className="px-4 py-3">
                  {task.status !== "completed" && task.status !== "cancelled" ? (
                    <form
                      action={(formData) => {
                        startTransition(() => {
                          setRows(
                            rows.map((row) =>
                              row.id === task.id
                                ? { ...row, status: "completed" }
                                : row,
                            ),
                          );
                        });
                        run(
                          () => completeTask(formData),
                          labels.toastCompleted,
                          labels.saveError,
                        );
                      }}
                    >
                      <input type="hidden" name="id" value={task.id} />
                      <button
                        type="submit"
                        className="text-xs font-medium text-[var(--nht-gold)] hover:text-white"
                      >
                        {labels.actions.complete}
                      </button>
                    </form>
                  ) : (
                    <span className="text-xs text-[var(--nht-text-muted)]">
                      {labels.actions.completed}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <FlashToast message={toast} tone={tone} />
    </>
  );
}
