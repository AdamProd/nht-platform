import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import { hasPermission } from "@/features/core/permissions";
import {
  taskListFiltersSchema,
  type TaskListFilters,
} from "@/features/tasks/schemas/task.schema";
import {
  endOfLocalDay,
  startOfLocalDay,
} from "@/features/tasks/lib/format";
import {
  KANBAN_PAGE_LIMIT,
  KANBAN_STATUSES,
  type TaskKanbanItem,
} from "@/features/tasks/types";

const KANBAN_SELECT = `
  *,
  creator:creators!tasks_creator_id_fkey (
    id,
    display_name,
    email
  ),
  assignee:profiles!tasks_assigned_to_fkey (
    id,
    full_name
  ),
  author:profiles!tasks_created_by_fkey (
    id,
    full_name
  ),
  comments:task_comments(count),
  attachments:task_attachments(count),
  subtasks:task_subtasks(id, is_done)
`;

type CountEmbed = { count: number }[] | null;
type SubtaskEmbed = { id: string; is_done: boolean }[] | null;

type KanbanRow = {
  id: string;
  title: string;
  description: string | null;
  status: TaskKanbanItem["status"];
  priority: TaskKanbanItem["priority"];
  type: TaskKanbanItem["type"];
  creator_id: string | null;
  application_id: string | null;
  assigned_to: string | null;
  created_by: string | null;
  due_date: string | null;
  completed_at: string | null;
  archived_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  creator: TaskKanbanItem["creator"];
  assignee: TaskKanbanItem["assignee"];
  author: TaskKanbanItem["author"];
  comments?: CountEmbed;
  attachments?: CountEmbed;
  subtasks?: SubtaskEmbed;
};

function mapKanbanRow(row: KanbanRow): TaskKanbanItem {
  const subtasks = row.subtasks ?? [];
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    type: row.type,
    creator_id: row.creator_id,
    application_id: row.application_id,
    assigned_to: row.assigned_to,
    created_by: row.created_by,
    due_date: row.due_date,
    completed_at: row.completed_at,
    archived_at: row.archived_at,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
    creator: row.creator,
    assignee: row.assignee,
    author: row.author,
    commentsCount: row.comments?.[0]?.count ?? 0,
    attachmentsCount: row.attachments?.[0]?.count ?? 0,
    subtasksTotal: subtasks.length,
    subtasksDone: subtasks.filter((item) => item.is_done).length,
  };
}

export async function listKanbanTasks(
  raw: Partial<TaskListFilters> | Record<string, string | undefined>,
): Promise<TaskKanbanItem[]> {
  const session = await requireStaffSession();
  if (!session) throw new Error("Unauthorized");
  if (!hasPermission(session.profile.role, "tasks.read")) {
    throw new Error("Forbidden");
  }

  const filters = taskListFiltersSchema.parse({
    q: raw.q ?? "",
    status: raw.status || undefined,
    priority: raw.priority || undefined,
    type: raw.type || undefined,
    assignee: raw.assignee ?? "",
    creator: raw.creator ?? "",
    sort: raw.sort ?? "newest",
    page: 1,
    scope: raw.scope ?? "",
  });

  const supabase = await createClient();
  let query = supabase
    .from("tasks")
    .select(KANBAN_SELECT)
    .in("status", [...KANBAN_STATUSES])
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(KANBAN_PAGE_LIMIT);

  if (filters.status && KANBAN_STATUSES.includes(filters.status as never)) {
    query = query.eq("status", filters.status);
  }
  if (filters.priority) query = query.eq("priority", filters.priority);
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.creator) query = query.eq("creator_id", filters.creator);

  if (filters.assignee === "unassigned") {
    query = query.is("assigned_to", null);
  } else if (filters.assignee) {
    query = query.eq("assigned_to", filters.assignee);
  }

  const now = new Date();
  const todayStart = startOfLocalDay(now).toISOString();
  const todayEnd = endOfLocalDay(now).toISOString();

  switch (filters.scope) {
    case "mine":
      query = query.eq("assigned_to", session.profile.id);
      break;
    case "overdue":
      query = query
        .lt("due_date", now.toISOString())
        .not("status", "eq", "completed");
      break;
    case "today":
      query = query.gte("due_date", todayStart).lte("due_date", todayEnd);
      break;
    case "completed":
      query = query.eq("status", "completed");
      break;
    case "high":
      query = query.in("priority", ["high", "urgent"]);
      break;
    default:
      break;
  }

  if (filters.q) {
    const term = filters.q
      .replaceAll(",", " ")
      .trim()
      .replaceAll("%", "")
      .replaceAll("_", "");
    if (term) {
      query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
    }
  }

  const { data, error } = await query;
  if (error) {
    console.error("[listKanbanTasks]", error.message);
    throw new Error("Failed to load kanban tasks.");
  }

  return ((data ?? []) as KanbanRow[]).map(mapKanbanRow);
}
