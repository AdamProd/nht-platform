"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { publishEvent } from "@/features/core/events";
import { endOfLocalDay, startOfLocalDay } from "@/features/tasks/lib/format";
import { OPEN_TASK_STATUSES } from "@/features/tasks/types";

/**
 * Notify assignees about tasks due today or tomorrow.
 * Idempotent per task within the last 20 hours.
 * Safe to call on tasks list page load (best-effort).
 */
export async function notifyApproachingTaskDeadlines(): Promise<void> {
  try {
    const admin = createAdminClient();
    const now = new Date();
    const from = startOfLocalDay(now).toISOString();
    const to = endOfLocalDay(
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
    ).toISOString();
    const since = new Date(now.getTime() - 20 * 60 * 60 * 1000).toISOString();

    const { data: tasks, error } = await admin
      .from("tasks")
      .select("id, title, assigned_to, creator_id, status, due_date")
      .in("status", OPEN_TASK_STATUSES)
      .not("assigned_to", "is", null)
      .gte("due_date", from)
      .lte("due_date", to)
      .limit(50);

    if (error || !tasks?.length) {
      if (error) console.error("[notifyApproachingTaskDeadlines]", error.message);
      return;
    }

    const taskIds = tasks.map((task) => task.id);
    const { data: existing } = await admin
      .from("platform_events")
      .select("target_id")
      .eq("type", "task.deadline_approaching")
      .in("target_id", taskIds)
      .gte("created_at", since);

    const alreadyNotified = new Set(
      (existing ?? []).map((row) => row.target_id).filter(Boolean),
    );

    for (const task of tasks) {
      if (!task.assigned_to || alreadyNotified.has(task.id)) continue;

      await publishEvent({
        type: "task.deadline_approaching",
        module: "tasks",
        actorId: null,
        actorRole: null,
        targetId: task.id,
        relatedCreatorId: task.creator_id,
        link: `/admin/tasks/${task.id}`,
        recipientIds: [task.assigned_to],
        payload: {
          title: task.title,
          name: task.title,
          assigned_to: task.assigned_to,
          managerId: task.assigned_to,
          manager_id: task.assigned_to,
          due_date: task.due_date,
          status: task.status,
        },
      });
    }
  } catch (error) {
    console.error("[notifyApproachingTaskDeadlines]", error);
  }
}
