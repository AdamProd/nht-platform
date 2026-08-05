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
  TASK_PAGE_SIZE,
  type TaskListItem,
  type TaskListResult,
} from "@/features/tasks/types";

const LIST_SELECT = `
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
  )
`;

export async function listTasks(
  raw: Partial<TaskListFilters> | Record<string, string | undefined>,
): Promise<TaskListResult> {
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
    page: raw.page ?? 1,
    scope: raw.scope ?? "",
  });

  const page = filters.page;
  const from = (page - 1) * TASK_PAGE_SIZE;
  const to = from + TASK_PAGE_SIZE - 1;

  const supabase = await createClient();
  let query = supabase.from("tasks").select(LIST_SELECT, { count: "exact" });

  switch (filters.sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "due_asc":
      query = query
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
      break;
    case "due_desc":
      query = query
        .order("due_date", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      break;
    case "priority":
      query = query
        .order("priority", { ascending: true })
        .order("created_at", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  query = query.range(from, to);

  if (filters.status) query = query.eq("status", filters.status);
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
      query = query
        .eq("assigned_to", session.profile.id)
        .not("status", "in", "(completed,archived)");
      break;
    case "overdue":
      query = query
        .lt("due_date", now.toISOString())
        .not("status", "in", "(completed,archived)");
      break;
    case "today":
      query = query
        .gte("due_date", todayStart)
        .lte("due_date", todayEnd)
        .not("status", "in", "(completed,archived)");
      break;
    case "completed":
      query = query.eq("status", "completed");
      break;
    case "high":
      query = query
        .in("priority", ["high", "urgent"])
        .not("status", "in", "(completed,archived)");
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

  const { data, error, count } = await query;
  if (error) {
    console.error("[listTasks]", error.message);
    throw new Error("Failed to load tasks.");
  }

  const total = count ?? 0;
  return {
    items: (data ?? []) as TaskListItem[],
    total,
    page,
    pageSize: TASK_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / TASK_PAGE_SIZE)),
  };
}

export async function listCreatorCrmTasks(
  creatorId: string,
): Promise<TaskListItem[]> {
  const session = await requireStaffSession();
  if (!session) throw new Error("Unauthorized");
  if (!hasPermission(session.profile.role, "tasks.read")) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(LIST_SELECT)
    .eq("creator_id", creatorId)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[listCreatorCrmTasks]", error.message);
    return [];
  }

  return (data ?? []) as TaskListItem[];
}
