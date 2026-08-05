import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireStaff } from "@/lib/auth";
import { hasPermission } from "@/features/core/permissions";
import { redirect } from "@/i18n/navigation";
import { listFinanceCreators } from "@/features/finance/reports/queries/get-finance-dashboard";
import { listTaskAssignees } from "@/features/tasks/queries/list-assignees";
import { listKanbanTasks } from "@/features/tasks/queries/list-kanban-tasks";
import {
  getTaskStats,
  listTasks,
  TaskFilters,
  TaskFormModal,
  TaskKpiCards,
  TaskPagination,
  TaskTable,
  TaskViewSwitcher,
  TaskKanbanBoard,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_TYPES,
  type TaskViewMode,
} from "@/features/tasks";
import { notifyApproachingTaskDeadlines } from "@/features/tasks/actions/notify-deadlines";
import ErrorState from "@/shared/ui/ErrorState";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function AdminTasksPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireStaff();
  const t = await getTranslations("admin.tasks");
  const sp = await searchParams;

  if (!hasPermission(session.profile.role, "tasks.read")) {
    redirect({ href: "/admin", locale });
  }

  const q = first(sp.q);
  const status = first(sp.status);
  const priority = first(sp.priority);
  const type = first(sp.type);
  const assignee = first(sp.assignee);
  const creator = first(sp.creator);
  const sort = first(sp.sort) || "newest";
  const page = first(sp.page) || "1";
  const scope = first(sp.scope);
  const viewParam = first(sp.view);
  const view: TaskViewMode = viewParam === "kanban" ? "kanban" : "table";

  const canCreate = hasPermission(session.profile.role, "tasks.create");
  const canUpdate = hasPermission(session.profile.role, "tasks.update");

  let loadError: string | null = null;
  let stats: Awaited<ReturnType<typeof getTaskStats>>;
  let list: Awaited<ReturnType<typeof listTasks>>;
  let kanbanItems: Awaited<ReturnType<typeof listKanbanTasks>> = [];
  let creators: Awaited<ReturnType<typeof listFinanceCreators>>;
  let assignees: Awaited<ReturnType<typeof listTaskAssignees>>;

  try {
    if (view === "kanban") {
      const [statsResult, creatorsResult, assigneesResult, kanbanResult] =
        await Promise.all([
          getTaskStats(),
          listFinanceCreators(),
          listTaskAssignees(),
          listKanbanTasks({
            q,
            status,
            priority,
            type,
            assignee,
            creator,
            sort,
            scope,
          }),
        ]);
      stats = statsResult;
      creators = creatorsResult;
      assignees = assigneesResult;
      kanbanItems = kanbanResult;
      list = { items: [], total: 0, page: 1, pageSize: 20, totalPages: 1 };
    } else {
      [stats, list, creators, assignees] = await Promise.all([
        getTaskStats(),
        listTasks({
          q,
          status,
          priority,
          type,
          assignee,
          creator,
          sort,
          page,
          scope,
        }),
        listFinanceCreators(),
        listTaskAssignees(),
      ]);
    }
    void notifyApproachingTaskDeadlines();
  } catch (error) {
    console.error(error);
    loadError = t("errors.load");
    stats = {
      myTasks: 0,
      overdue: 0,
      today: 0,
      completed: 0,
      highPriority: 0,
    };
    list = { items: [], total: 0, page: 1, pageSize: 20, totalPages: 1 };
    kanbanItems = [];
    creators = [];
    assignees = [];
  }

  const statusLabels = Object.fromEntries(
    TASK_STATUSES.map((value) => [value, t(`status.${value}`)]),
  ) as Record<(typeof TASK_STATUSES)[number], string>;

  const priorityLabels = Object.fromEntries(
    TASK_PRIORITIES.map((value) => [value, t(`priority.${value}`)]),
  ) as Record<(typeof TASK_PRIORITIES)[number], string>;

  const typeLabels = Object.fromEntries(
    TASK_TYPES.map((value) => [value, t(`type.${value}`)]),
  ) as Record<(typeof TASK_TYPES)[number], string>;

  const filterQuery = {
    q,
    status,
    priority,
    type,
    assignee,
    creator,
    sort: sort === "newest" ? "" : sort,
    scope,
    view: view === "kanban" ? "kanban" : "",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-overline text-[var(--nht-gold)]">{t("label")}</p>
          <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-[var(--nht-text-secondary)]">
            {t("description")}
          </p>
        </div>
        <TaskFormModal
          canCreate={canCreate}
          defaultCreatorId={creator || undefined}
          creators={creators.map((item) => ({
            id: item.id,
            label: item.display_name || item.full_name || item.id,
          }))}
          assignees={assignees.map((item) => ({
            id: item.id,
            label: item.full_name || item.id,
          }))}
          labels={{
            open: t("form.open"),
            title: t("form.title"),
            submit: t("form.submit"),
            submitting: t("form.submitting"),
            cancel: t("form.cancel"),
            saved: t("form.saved"),
            error: t("form.error"),
            fields: {
              title: t("fields.title"),
              description: t("fields.description"),
              type: t("fields.type"),
              priority: t("fields.priority"),
              status: t("fields.status"),
              creator: t("fields.creator"),
              assignTo: t("fields.assignTo"),
              dueDate: t("fields.dueDate"),
              none: t("fields.none"),
            },
          }}
          statusLabels={statusLabels}
          priorityLabels={priorityLabels}
          typeLabels={typeLabels}
        />
      </div>

      {loadError ? <ErrorState title={loadError} /> : null}

      <TaskKpiCards
        stats={stats}
        labels={{
          myTasks: t("kpis.myTasks"),
          overdue: t("kpis.overdue"),
          today: t("kpis.today"),
          completed: t("kpis.completed"),
          highPriority: t("kpis.highPriority"),
        }}
      />

      <TaskFilters
        values={{
          q,
          status,
          priority,
          type,
          assignee,
          creator,
          sort,
          scope,
          view: view === "kanban" ? "kanban" : "",
        }}
        labels={{
          search: t("filters.searchPlaceholder"),
          status: t("filters.status"),
          priority: t("filters.priority"),
          type: t("filters.type"),
          assignee: t("filters.assignee"),
          creator: t("filters.creator"),
          sort: t("filters.sort"),
          all: t("filters.all"),
          unassigned: t("filters.unassigned"),
          clear: t("filters.clear"),
        }}
        statusOptions={TASK_STATUSES.map((value) => ({
          value,
          label: statusLabels[value],
        }))}
        priorityOptions={TASK_PRIORITIES.map((value) => ({
          value,
          label: priorityLabels[value],
        }))}
        typeOptions={TASK_TYPES.map((value) => ({
          value,
          label: typeLabels[value],
        }))}
        assigneeOptions={assignees.map((item) => ({
          value: item.id,
          label: item.full_name || item.id,
        }))}
        creatorOptions={creators.map((item) => ({
          value: item.id,
          label: item.display_name || item.full_name || item.id,
        }))}
        sortOptions={[
          { value: "newest", label: t("sort.newest") },
          { value: "oldest", label: t("sort.oldest") },
          { value: "due_asc", label: t("sort.dueAsc") },
          { value: "due_desc", label: t("sort.dueDesc") },
          { value: "priority", label: t("sort.priority") },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TaskViewSwitcher
          value={view}
          labels={{
            table: t("view.table"),
            kanban: t("view.kanban"),
          }}
          query={filterQuery}
        />
      </div>

      {view === "kanban" ? (
        <TaskKanbanBoard
          key={kanbanItems
            .map(
              (item) =>
                `${item.id}:${item.status}:${item.sort_order}:${item.assigned_to}:${item.title}`,
            )
            .join("|")}
          items={kanbanItems}
          locale={locale}
          canUpdate={canUpdate}
          canCreate={canCreate}
          assignees={assignees.map((item) => ({
            id: item.id,
            label: item.full_name || item.id,
          }))}
          labels={{
            emptyTitle: t("kanban.emptyTitle"),
            emptyCreate: t("kanban.emptyCreate"),
            card: {
              creator: t("fields.creator"),
              manager: t("kanban.manager"),
              due: t("fields.dueDate"),
              priority: t("fields.priority"),
              unassigned: t("filters.unassigned"),
              none: t("fields.none"),
              edit: t("actions.edit"),
              assign: t("actions.assign"),
              complete: t("actions.complete"),
              archive: t("actions.archive"),
              save: t("actions.save"),
              cancel: t("form.cancel"),
              comments: t("detail.comments"),
              files: t("detail.attachments"),
              subtasks: t("detail.subtasks"),
              overdue: t("deadline.overdue"),
              errorFallback: t("detail.error"),
            },
          }}
          statusLabels={statusLabels}
          priorityLabels={priorityLabels}
        />
      ) : (
        <>
          <TaskTable
            items={list.items}
            locale={locale}
            labels={{
              title: t("table.title"),
              creator: t("table.creator"),
              assigned: t("table.assigned"),
              priority: t("table.priority"),
              status: t("table.status"),
              due: t("table.due"),
              actions: t("table.actions"),
              view: t("table.view"),
              empty: t("empty.title"),
              emptyTitle: t("empty.title"),
              emptyDescription: t("empty.description"),
              unassigned: t("filters.unassigned"),
              none: t("fields.none"),
            }}
            deadlineLabels={{
              none: t("deadline.none"),
              overdue: t("deadline.overdue"),
              today: t("deadline.today"),
              tomorrow: t("deadline.tomorrow"),
              inDays: (days) => t("deadline.inDays", { days }),
            }}
            statusLabels={statusLabels}
            priorityLabels={priorityLabels}
            typeLabels={typeLabels}
          />

          <TaskPagination
            page={list.page}
            totalPages={list.totalPages}
            total={list.total}
            labels={{
              previous: t("pagination.previous"),
              next: t("pagination.next"),
              of: t("pagination.of"),
            }}
            query={{
              q,
              status,
              priority,
              type,
              assignee,
              creator,
              sort: sort === "newest" ? "" : sort,
              scope,
            }}
          />
        </>
      )}
    </div>
  );
}
