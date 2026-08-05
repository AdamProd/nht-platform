import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import { hasPermission } from "@/features/core/permissions";
import {
  endOfLocalDay,
  startOfLocalDay,
} from "@/features/tasks/lib/format";
import type { TaskStats } from "@/features/tasks/types";

type CountFilter = {
  assignedTo?: string;
  statusEq?: string;
  statusNotIn?: string[];
  priorityIn?: string[];
  dueBefore?: string;
  dueFrom?: string;
  dueTo?: string;
  completedFrom?: string;
  completedTo?: string;
};

async function countTasks(filter: CountFilter = {}): Promise<number> {
  const supabase = await createClient();
  let query = supabase.from("tasks").select("id", { count: "exact", head: true });

  if (filter.assignedTo) query = query.eq("assigned_to", filter.assignedTo);
  if (filter.statusEq) query = query.eq("status", filter.statusEq as never);
  if (filter.statusNotIn?.length) {
    query = query.not("status", "in", `(${filter.statusNotIn.join(",")})`);
  }
  if (filter.priorityIn?.length) {
    query = query.in("priority", filter.priorityIn as never[]);
  }
  if (filter.dueBefore) query = query.lt("due_date", filter.dueBefore);
  if (filter.dueFrom) query = query.gte("due_date", filter.dueFrom);
  if (filter.dueTo) query = query.lte("due_date", filter.dueTo);
  if (filter.completedFrom) {
    query = query.gte("completed_at", filter.completedFrom);
  }
  if (filter.completedTo) query = query.lte("completed_at", filter.completedTo);

  const { count, error } = await query;
  if (error) {
    console.error("[countTasks]", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function getTaskStats(): Promise<TaskStats> {
  const session = await requireStaffSession();
  if (!session) throw new Error("Unauthorized");
  if (!hasPermission(session.profile.role, "tasks.read")) {
    throw new Error("Forbidden");
  }

  const userId = session.profile.id;
  const now = new Date();
  const todayStart = startOfLocalDay(now).toISOString();
  const todayEnd = endOfLocalDay(now).toISOString();
  const openStatuses = ["completed", "archived"];

  const [myTasks, overdue, today, completed, highPriority] = await Promise.all([
    countTasks({
      assignedTo: userId,
      statusNotIn: openStatuses,
    }),
    countTasks({
      dueBefore: now.toISOString(),
      statusNotIn: openStatuses,
    }),
    countTasks({
      dueFrom: todayStart,
      dueTo: todayEnd,
      statusNotIn: openStatuses,
    }),
    countTasks({ statusEq: "completed" }),
    countTasks({
      priorityIn: ["high", "urgent"],
      statusNotIn: openStatuses,
    }),
  ]);

  return { myTasks, overdue, today, completed, highPriority };
}

export async function getDashboardTaskStats(userId: string): Promise<{
  openTasks: number;
  myTasks: number;
  overdue: number;
  completedToday: number;
}> {
  const now = new Date();
  const todayStart = startOfLocalDay(now).toISOString();
  const todayEnd = endOfLocalDay(now).toISOString();
  const openStatuses = ["completed", "archived"];

  const [openTasks, myTasks, overdue, completedToday] = await Promise.all([
    countTasks({ statusNotIn: openStatuses }),
    countTasks({ assignedTo: userId, statusNotIn: openStatuses }),
    countTasks({
      dueBefore: now.toISOString(),
      statusNotIn: openStatuses,
    }),
    countTasks({
      statusEq: "completed",
      completedFrom: todayStart,
      completedTo: todayEnd,
    }),
  ]);

  return { openTasks, myTasks, overdue, completedToday };
}
