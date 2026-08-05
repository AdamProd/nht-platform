import { getTranslations, setRequestLocale } from "next-intl/server";
import { listTasks } from "@/features/cabinet/queries/cabinet";
import TasksTable from "@/features/cabinet/tasks/components/TasksTable";

type Props = { params: Promise<{ locale: string }> };

export default async function CreatorTasksPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("creator.tasks");
  const tRoot = await getTranslations("creator");
  const { tasks } = await listTasks();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-overline text-[var(--nht-gold)]">{t("label")}</p>
        <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-[var(--nht-text-secondary)]">
          {t("description")}
        </p>
      </div>
      <TasksTable
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tasks={tasks as any}
        locale={locale}
        labels={{
          table: {
            title: t("table.title"),
            priority: t("table.priority"),
            status: t("table.status"),
            deadline: t("table.deadline"),
            manager: t("table.manager"),
            details: t("table.details"),
            actions: t("table.actions"),
          },
          priority: {
            low: t("priority.low"),
            normal: t("priority.normal"),
            high: t("priority.high"),
            urgent: t("priority.urgent"),
          },
          status: {
            open: t("status.open"),
            in_progress: t("status.in_progress"),
            completed: t("status.completed"),
            cancelled: t("status.cancelled"),
          },
          actions: {
            complete: t("actions.complete"),
            completing: t("actions.completing"),
            completed: t("actions.completed"),
          },
          empty: t("empty"),
          unassigned: t("unassigned"),
          toastCompleted: tRoot("toast.taskCompleted"),
          saveError: tRoot("actionErrors.save"),
        }}
      />
    </div>
  );
}
