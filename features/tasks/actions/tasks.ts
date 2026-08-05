"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaffSession, isOwner } from "@/lib/auth";
import { publishEvent } from "@/features/core/events";
import { hasPermission } from "@/features/core/permissions";
import {
  assignTaskSchema,
  createSubtaskSchema,
  createTaskSchema,
  moveKanbanTaskSchema,
  subtaskIdSchema,
  attachmentIdSchema,
  taskCommentIdSchema,
  taskCommentSchema,
  taskDueDateSchema,
  taskIdSchema,
  taskStatusSchema,
  updateSubtaskSchema,
  updateTaskCommentSchema,
  updateTaskSchema,
} from "@/features/tasks/schemas/task.schema";
import {
  isAllowedTaskMime,
  TASK_FILES_BUCKET,
  TASK_MAX_FILE_BYTES,
  taskFilePath,
} from "@/features/tasks/lib/storage";
import type { TaskActionResult } from "@/features/tasks/types";
import type { TablesInsert, TablesUpdate } from "@/types/database.types";

async function revalidateTasks(id?: string, creatorId?: string | null) {
  const locale = await getLocale();
  revalidatePath(`/${locale}/admin/tasks`);
  revalidatePath(`/${locale}/admin`);
  if (id) revalidatePath(`/${locale}/admin/tasks/${id}`);
  if (creatorId) revalidatePath(`/${locale}/admin/creators/${creatorId}`);
}

async function loadTaskMeta(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("id, title, assigned_to, creator_id, status, due_date, priority, type, description, application_id, created_by")
    .eq("id", id)
    .maybeSingle();
  return data;
}

function assigneePayload(task: {
  title: string;
  assigned_to: string | null;
  status?: string;
}) {
  return {
    title: task.title,
    name: task.title,
    assigned_to: task.assigned_to,
    managerId: task.assigned_to,
    manager_id: task.assigned_to,
    status: task.status,
  };
}

export async function createTask(raw: unknown): Promise<TaskActionResult> {
  const t = await getTranslations("admin.tasks.actionErrors");
  try {
    const session = await requireStaffSession();
    if (!session || !hasPermission(session.profile.role, "tasks.create")) {
      return { success: false, error: t("unauthorized") };
    }

    const parsed = createTaskSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: t("invalid") };

    const supabase = await createClient();
    const { data: top } = await supabase
      .from("tasks")
      .select("sort_order")
      .eq("status", parsed.data.status)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    const row: TablesInsert<"tasks"> = {
      title: parsed.data.title,
      description: parsed.data.description || null,
      type: parsed.data.type,
      priority: parsed.data.priority,
      status: parsed.data.status,
      creator_id: parsed.data.creator_id ?? null,
      application_id: parsed.data.application_id ?? null,
      assigned_to: parsed.data.assigned_to ?? null,
      due_date: parsed.data.due_date ?? null,
      sort_order: (top?.sort_order ?? 0) - 1,
      created_by: session.profile.id,
      completed_at:
        parsed.data.status === "completed" ? new Date().toISOString() : null,
      archived_at:
        parsed.data.status === "archived" ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from("tasks")
      .insert(row)
      .select("id, assigned_to, creator_id, title, status")
      .single();

    if (error || !data) {
      console.error("[createTask]", error?.message);
      return { success: false, error: t("create") };
    }

    await publishEvent({
      type: "task.created",
      module: "tasks",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: data.id,
      relatedCreatorId: data.creator_id,
      link: `/admin/tasks/${data.id}`,
      payload: assigneePayload(data),
    });

    if (data.assigned_to && data.assigned_to !== session.profile.id) {
      await publishEvent({
        type: "task.assigned",
        module: "tasks",
        actorId: session.profile.id,
        actorRole: session.profile.role,
        targetId: data.id,
        relatedCreatorId: data.creator_id,
        link: `/admin/tasks/${data.id}`,
        recipientIds: [data.assigned_to],
        payload: assigneePayload(data),
      });
    }

    await revalidateTasks(data.id, data.creator_id);
    return { success: true, id: data.id };
  } catch (error) {
    console.error("[createTask]", error);
    return { success: false, error: t("create") };
  }
}

export async function updateTask(raw: unknown): Promise<TaskActionResult> {
  const t = await getTranslations("admin.tasks.actionErrors");
  try {
    const session = await requireStaffSession();
    if (!session || !hasPermission(session.profile.role, "tasks.update")) {
      return { success: false, error: t("unauthorized") };
    }

    const parsed = updateTaskSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: t("invalid") };

    const existing = await loadTaskMeta(parsed.data.id);
    if (!existing) return { success: false, error: t("notFound") };

    const patch: TablesUpdate<"tasks"> = {};
    if (parsed.data.title !== undefined) patch.title = parsed.data.title;
    if (parsed.data.description !== undefined) {
      patch.description = parsed.data.description || null;
    }
    if (parsed.data.type !== undefined) patch.type = parsed.data.type;
    if (parsed.data.priority !== undefined) patch.priority = parsed.data.priority;
    if (parsed.data.creator_id !== undefined) {
      patch.creator_id = parsed.data.creator_id ?? null;
    }
    if (parsed.data.application_id !== undefined) {
      patch.application_id = parsed.data.application_id ?? null;
    }
    if (parsed.data.assigned_to !== undefined) {
      patch.assigned_to = parsed.data.assigned_to ?? null;
    }
    if (parsed.data.due_date !== undefined) {
      patch.due_date = parsed.data.due_date ?? null;
    }
    if (parsed.data.status !== undefined) {
      patch.status = parsed.data.status;
      if (parsed.data.status === "completed") {
        patch.completed_at = new Date().toISOString();
        patch.archived_at = null;
      } else if (parsed.data.status === "archived") {
        patch.archived_at = new Date().toISOString();
      } else {
        if (existing.status === "completed") patch.completed_at = null;
        if (existing.status === "archived") patch.archived_at = null;
      }
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tasks")
      .update(patch)
      .eq("id", parsed.data.id)
      .select("id, assigned_to, creator_id, title, status")
      .single();

    if (error || !data) {
      console.error("[updateTask]", error?.message);
      return { success: false, error: t("update") };
    }

    await publishEvent({
      type: "task.updated",
      module: "tasks",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: data.id,
      relatedCreatorId: data.creator_id,
      link: `/admin/tasks/${data.id}`,
      payload: assigneePayload(data),
    });

    if (
      parsed.data.status !== undefined &&
      parsed.data.status !== existing.status
    ) {
      await publishEvent({
        type: "task.status_changed",
        module: "tasks",
        actorId: session.profile.id,
        actorRole: session.profile.role,
        targetId: data.id,
        relatedCreatorId: data.creator_id,
        link: `/admin/tasks/${data.id}`,
        payload: {
          ...assigneePayload(data),
          previousStatus: existing.status,
          status: data.status,
        },
      });
      if (data.status === "completed") {
        await publishEvent({
          type: "task.completed",
          module: "tasks",
          actorId: session.profile.id,
          actorRole: session.profile.role,
          targetId: data.id,
          relatedCreatorId: data.creator_id,
          link: `/admin/tasks/${data.id}`,
          payload: assigneePayload(data),
        });
      }
    }

    if (
      parsed.data.assigned_to !== undefined &&
      data.assigned_to &&
      data.assigned_to !== existing.assigned_to &&
      data.assigned_to !== session.profile.id
    ) {
      await publishEvent({
        type: "task.assigned",
        module: "tasks",
        actorId: session.profile.id,
        actorRole: session.profile.role,
        targetId: data.id,
        relatedCreatorId: data.creator_id,
        link: `/admin/tasks/${data.id}`,
        recipientIds: [data.assigned_to],
        payload: assigneePayload(data),
      });
    }

    await revalidateTasks(data.id, data.creator_id);
    return { success: true, id: data.id };
  } catch (error) {
    console.error("[updateTask]", error);
    return { success: false, error: t("update") };
  }
}

export async function assignTask(raw: unknown): Promise<TaskActionResult> {
  const t = await getTranslations("admin.tasks.actionErrors");
  try {
    const session = await requireStaffSession();
    if (!session || !hasPermission(session.profile.role, "tasks.update")) {
      return { success: false, error: t("unauthorized") };
    }
    const parsed = assignTaskSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: t("invalid") };

    const existing = await loadTaskMeta(parsed.data.id);
    if (!existing) return { success: false, error: t("notFound") };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tasks")
      .update({ assigned_to: parsed.data.assigned_to })
      .eq("id", parsed.data.id)
      .select("id, assigned_to, creator_id, title, status")
      .single();

    if (error || !data) {
      console.error("[assignTask]", error?.message);
      return { success: false, error: t("update") };
    }

    await publishEvent({
      type: "task.assigned",
      module: "tasks",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: data.id,
      relatedCreatorId: data.creator_id,
      link: `/admin/tasks/${data.id}`,
      recipientIds: data.assigned_to ? [data.assigned_to] : [],
      payload: assigneePayload(data),
    });

    await revalidateTasks(data.id, data.creator_id);
    return { success: true, id: data.id };
  } catch (error) {
    console.error("[assignTask]", error);
    return { success: false, error: t("update") };
  }
}

export async function changeTaskStatus(raw: unknown): Promise<TaskActionResult> {
  const parsed = taskStatusSchema.safeParse(raw);
  if (!parsed.success) {
    const t = await getTranslations("admin.tasks.actionErrors");
    return { success: false, error: t("invalid") };
  }
  return updateTask({ id: parsed.data.id, status: parsed.data.status });
}

export async function changeTaskDueDate(raw: unknown): Promise<TaskActionResult> {
  const parsed = taskDueDateSchema.safeParse(raw);
  if (!parsed.success) {
    const t = await getTranslations("admin.tasks.actionErrors");
    return { success: false, error: t("invalid") };
  }
  return updateTask({
    id: parsed.data.id,
    due_date: parsed.data.due_date ?? "",
  });
}

export async function completeTask(raw: unknown): Promise<TaskActionResult> {
  const parsed = taskIdSchema.safeParse(raw);
  if (!parsed.success) {
    const t = await getTranslations("admin.tasks.actionErrors");
    return { success: false, error: t("invalid") };
  }
  return changeTaskStatus({ id: parsed.data.id, status: "completed" });
}

export async function moveTaskToReview(raw: unknown): Promise<TaskActionResult> {
  const parsed = taskIdSchema.safeParse(raw);
  if (!parsed.success) {
    const t = await getTranslations("admin.tasks.actionErrors");
    return { success: false, error: t("invalid") };
  }
  return changeTaskStatus({ id: parsed.data.id, status: "review" });
}

export async function archiveTask(raw: unknown): Promise<TaskActionResult> {
  const parsed = taskIdSchema.safeParse(raw);
  if (!parsed.success) {
    const t = await getTranslations("admin.tasks.actionErrors");
    return { success: false, error: t("invalid") };
  }
  return changeTaskStatus({ id: parsed.data.id, status: "archived" });
}

async function applySortOrders(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orderedIds: string[],
) {
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("tasks").update({ sort_order: index }).eq("id", id),
    ),
  );
}

export async function moveKanbanTask(raw: unknown): Promise<TaskActionResult> {
  const t = await getTranslations("admin.tasks.actionErrors");
  try {
    const session = await requireStaffSession();
    if (!session || !hasPermission(session.profile.role, "tasks.update")) {
      return { success: false, error: t("unauthorized") };
    }

    const parsed = moveKanbanTaskSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: t("invalid") };

    const existing = await loadTaskMeta(parsed.data.taskId);
    if (!existing) return { success: false, error: t("notFound") };

    const supabase = await createClient();
    const statusChanged = existing.status !== parsed.data.status;
    const nextStatus = parsed.data.status;

    const movedPatch: TablesUpdate<"tasks"> = {
      status: nextStatus,
      sort_order: Math.max(0, parsed.data.orderedIds.indexOf(parsed.data.taskId)),
      archived_at: null,
    };
    if (nextStatus === "completed") {
      if (existing.status !== "completed") {
        movedPatch.completed_at = new Date().toISOString();
      }
    } else {
      movedPatch.completed_at = null;
    }

    const { error: moveError } = await supabase
      .from("tasks")
      .update(movedPatch)
      .eq("id", parsed.data.taskId);

    if (moveError) {
      console.error("[moveKanbanTask.move]", moveError.message);
      return { success: false, error: t("update") };
    }

    if (
      parsed.data.previousOrderedIds &&
      statusChanged &&
      parsed.data.previousOrderedIds.length > 0
    ) {
      await applySortOrders(supabase, parsed.data.previousOrderedIds);
    }

    await applySortOrders(supabase, parsed.data.orderedIds);

    if (statusChanged) {
      await publishEvent({
        type: "task.status_changed",
        module: "tasks",
        actorId: session.profile.id,
        actorRole: session.profile.role,
        targetId: existing.id,
        relatedCreatorId: existing.creator_id,
        link: `/admin/tasks/${existing.id}`,
        payload: {
          ...assigneePayload({
            title: existing.title,
            assigned_to: existing.assigned_to,
            status: parsed.data.status,
          }),
          previousStatus: existing.status,
          status: parsed.data.status,
        },
      });

      if (parsed.data.status === "completed") {
        await publishEvent({
          type: "task.completed",
          module: "tasks",
          actorId: session.profile.id,
          actorRole: session.profile.role,
          targetId: existing.id,
          relatedCreatorId: existing.creator_id,
          link: `/admin/tasks/${existing.id}`,
          payload: assigneePayload({
            title: existing.title,
            assigned_to: existing.assigned_to,
            status: parsed.data.status,
          }),
        });
      }
    } else {
      await publishEvent({
        type: "task.updated",
        module: "tasks",
        actorId: session.profile.id,
        actorRole: session.profile.role,
        targetId: existing.id,
        relatedCreatorId: existing.creator_id,
        link: `/admin/tasks/${existing.id}`,
        payload: assigneePayload({
          title: existing.title,
          assigned_to: existing.assigned_to,
          status: parsed.data.status,
        }),
      });
    }

    await revalidateTasks(existing.id, existing.creator_id);
    return { success: true, id: existing.id };
  } catch (error) {
    console.error("[moveKanbanTask]", error);
    return { success: false, error: t("update") };
  }
}

export async function duplicateTask(raw: unknown): Promise<TaskActionResult> {
  const t = await getTranslations("admin.tasks.actionErrors");
  try {
    const session = await requireStaffSession();
    if (!session || !hasPermission(session.profile.role, "tasks.create")) {
      return { success: false, error: t("unauthorized") };
    }
    const parsed = taskIdSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: t("invalid") };

    const existing = await loadTaskMeta(parsed.data.id);
    if (!existing) return { success: false, error: t("notFound") };

    const tTasks = await getTranslations("admin.tasks");
    const copySuffix = tTasks("actions.copySuffix");

    const result = await createTask({
      title: `${existing.title}${copySuffix}`,
      description: existing.description ?? "",
      type: existing.type,
      priority: existing.priority,
      status: "new",
      creator_id: existing.creator_id ?? "",
      application_id: existing.application_id ?? "",
      assigned_to: existing.assigned_to ?? "",
      due_date: existing.due_date ?? "",
    });

    if (result.success && result.id) {
      await publishEvent({
        type: "task.duplicated",
        module: "tasks",
        actorId: session.profile.id,
        actorRole: session.profile.role,
        targetId: result.id,
        relatedCreatorId: existing.creator_id,
        link: `/admin/tasks/${result.id}`,
        payload: {
          title: existing.title,
          name: existing.title,
          sourceId: existing.id,
          assigned_to: existing.assigned_to,
          managerId: existing.assigned_to,
          manager_id: existing.assigned_to,
        },
      });
    }

    return result;
  } catch (error) {
    console.error("[duplicateTask]", error);
    return { success: false, error: t("create") };
  }
}

export async function deleteTask(raw: unknown): Promise<TaskActionResult> {
  const t = await getTranslations("admin.tasks.actionErrors");
  try {
    const session = await requireStaffSession();
    if (!session || !isOwner(session.profile.role)) {
      return { success: false, error: t("unauthorized") };
    }

    const parsed = taskIdSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: t("invalid") };

    const existing = await loadTaskMeta(parsed.data.id);
    if (!existing) return { success: false, error: t("notFound") };

    const supabase = await createClient();
    const { error } = await supabase.from("tasks").delete().eq("id", parsed.data.id);
    if (error) {
      console.error("[deleteTask]", error.message);
      return { success: false, error: t("delete") };
    }

    await publishEvent({
      type: "task.deleted",
      module: "tasks",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: existing.id,
      relatedCreatorId: existing.creator_id,
      link: `/admin/tasks`,
      payload: { title: existing.title, name: existing.title },
    });

    await revalidateTasks(undefined, existing.creator_id);
    return { success: true };
  } catch (error) {
    console.error("[deleteTask]", error);
    return { success: false, error: t("delete") };
  }
}

export async function addTaskComment(raw: unknown): Promise<TaskActionResult> {
  const t = await getTranslations("admin.tasks.actionErrors");
  try {
    const session = await requireStaffSession();
    if (!session || !hasPermission(session.profile.role, "tasks.update")) {
      return { success: false, error: t("unauthorized") };
    }
    const parsed = taskCommentSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: t("invalid") };

    const task = await loadTaskMeta(parsed.data.task_id);
    if (!task) return { success: false, error: t("notFound") };

    const supabase = await createClient();
    const { error } = await supabase.from("task_comments").insert({
      task_id: parsed.data.task_id,
      author_id: session.profile.id,
      body: parsed.data.body,
    });
    if (error) {
      console.error("[addTaskComment]", error.message);
      return { success: false, error: t("comment") };
    }

    await publishEvent({
      type: "task.comment.created",
      module: "tasks",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: task.id,
      relatedCreatorId: task.creator_id,
      link: `/admin/tasks/${task.id}`,
      payload: assigneePayload(task),
    });

    await revalidateTasks(task.id, task.creator_id);
    return { success: true, id: task.id };
  } catch (error) {
    console.error("[addTaskComment]", error);
    return { success: false, error: t("comment") };
  }
}

export async function updateTaskComment(raw: unknown): Promise<TaskActionResult> {
  const t = await getTranslations("admin.tasks.actionErrors");
  try {
    const session = await requireStaffSession();
    if (!session) return { success: false, error: t("unauthorized") };

    const parsed = updateTaskCommentSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: t("invalid") };

    const supabase = await createClient();
    const { data: comment } = await supabase
      .from("task_comments")
      .select("id, author_id, task_id")
      .eq("id", parsed.data.id)
      .maybeSingle();

    if (!comment) return { success: false, error: t("notFound") };
    if (
      comment.author_id !== session.profile.id &&
      !isOwner(session.profile.role)
    ) {
      return { success: false, error: t("unauthorized") };
    }

    const task = await loadTaskMeta(comment.task_id);
    const { error } = await supabase
      .from("task_comments")
      .update({ body: parsed.data.body })
      .eq("id", parsed.data.id);

    if (error) {
      console.error("[updateTaskComment]", error.message);
      return { success: false, error: t("comment") };
    }

    if (task) {
      await publishEvent({
        type: "task.comment.updated",
        module: "tasks",
        actorId: session.profile.id,
        actorRole: session.profile.role,
        targetId: task.id,
        relatedCreatorId: task.creator_id,
        link: `/admin/tasks/${task.id}`,
        payload: assigneePayload(task),
      });
      await revalidateTasks(task.id, task.creator_id);
    }

    return { success: true, id: comment.task_id };
  } catch (error) {
    console.error("[updateTaskComment]", error);
    return { success: false, error: t("comment") };
  }
}

export async function deleteTaskComment(raw: unknown): Promise<TaskActionResult> {
  const t = await getTranslations("admin.tasks.actionErrors");
  try {
    const session = await requireStaffSession();
    if (!session) return { success: false, error: t("unauthorized") };

    const parsed = taskCommentIdSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: t("invalid") };

    const supabase = await createClient();
    const { data: comment } = await supabase
      .from("task_comments")
      .select("id, author_id, task_id")
      .eq("id", parsed.data.id)
      .maybeSingle();

    if (!comment) return { success: false, error: t("notFound") };
    if (
      comment.author_id !== session.profile.id &&
      !isOwner(session.profile.role)
    ) {
      return { success: false, error: t("unauthorized") };
    }

    const task = await loadTaskMeta(comment.task_id);
    const { error } = await supabase
      .from("task_comments")
      .delete()
      .eq("id", parsed.data.id);

    if (error) {
      console.error("[deleteTaskComment]", error.message);
      return { success: false, error: t("comment") };
    }

    if (task) {
      await publishEvent({
        type: "task.comment.deleted",
        module: "tasks",
        actorId: session.profile.id,
        actorRole: session.profile.role,
        targetId: task.id,
        relatedCreatorId: task.creator_id,
        link: `/admin/tasks/${task.id}`,
        payload: assigneePayload(task),
      });
      await revalidateTasks(task.id, task.creator_id);
    }

    return { success: true };
  } catch (error) {
    console.error("[deleteTaskComment]", error);
    return { success: false, error: t("comment") };
  }
}

export async function addTaskSubtask(raw: unknown): Promise<TaskActionResult> {
  const t = await getTranslations("admin.tasks.actionErrors");
  try {
    const session = await requireStaffSession();
    if (!session || !hasPermission(session.profile.role, "tasks.update")) {
      return { success: false, error: t("unauthorized") };
    }
    const parsed = createSubtaskSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: t("invalid") };

    const task = await loadTaskMeta(parsed.data.task_id);
    if (!task) return { success: false, error: t("notFound") };

    const supabase = await createClient();
    const { count } = await supabase
      .from("task_subtasks")
      .select("id", { count: "exact", head: true })
      .eq("task_id", parsed.data.task_id);

    const { error } = await supabase.from("task_subtasks").insert({
      task_id: parsed.data.task_id,
      title: parsed.data.title,
      position: count ?? 0,
      created_by: session.profile.id,
    });

    if (error) {
      console.error("[addTaskSubtask]", error.message);
      return { success: false, error: t("update") };
    }

    await publishEvent({
      type: "task.updated",
      module: "tasks",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: task.id,
      relatedCreatorId: task.creator_id,
      link: `/admin/tasks/${task.id}`,
      payload: { ...assigneePayload(task), subtask: true },
      description: `Subtask added: ${parsed.data.title}`,
    });

    await revalidateTasks(task.id, task.creator_id);
    return { success: true, id: task.id };
  } catch (error) {
    console.error("[addTaskSubtask]", error);
    return { success: false, error: t("update") };
  }
}

export async function updateTaskSubtask(raw: unknown): Promise<TaskActionResult> {
  const t = await getTranslations("admin.tasks.actionErrors");
  try {
    const session = await requireStaffSession();
    if (!session || !hasPermission(session.profile.role, "tasks.update")) {
      return { success: false, error: t("unauthorized") };
    }
    const parsed = updateSubtaskSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: t("invalid") };

    const supabase = await createClient();
    const { data: subtask } = await supabase
      .from("task_subtasks")
      .select("id, task_id, title")
      .eq("id", parsed.data.id)
      .maybeSingle();
    if (!subtask) return { success: false, error: t("notFound") };

    const patch: TablesUpdate<"task_subtasks"> = {};
    if (parsed.data.title !== undefined) patch.title = parsed.data.title;
    if (parsed.data.is_done !== undefined) {
      patch.is_done = parsed.data.is_done;
      patch.completed_at = parsed.data.is_done ? new Date().toISOString() : null;
    }

    const { error } = await supabase
      .from("task_subtasks")
      .update(patch)
      .eq("id", parsed.data.id);
    if (error) {
      console.error("[updateTaskSubtask]", error.message);
      return { success: false, error: t("update") };
    }

    const task = await loadTaskMeta(subtask.task_id);
    if (task) {
      await publishEvent({
        type: "task.updated",
        module: "tasks",
        actorId: session.profile.id,
        actorRole: session.profile.role,
        targetId: task.id,
        relatedCreatorId: task.creator_id,
        link: `/admin/tasks/${task.id}`,
        payload: {
          ...assigneePayload(task),
          subtask: true,
          is_done: parsed.data.is_done,
        },
        description:
          parsed.data.is_done === true
            ? `Subtask completed: ${subtask.title}`
            : parsed.data.is_done === false
              ? `Subtask reopened: ${subtask.title}`
              : `Subtask updated: ${subtask.title}`,
      });
      await revalidateTasks(task.id, task.creator_id);
    }

    return { success: true, id: subtask.task_id };
  } catch (error) {
    console.error("[updateTaskSubtask]", error);
    return { success: false, error: t("update") };
  }
}

export async function deleteTaskSubtask(raw: unknown): Promise<TaskActionResult> {
  const t = await getTranslations("admin.tasks.actionErrors");
  try {
    const session = await requireStaffSession();
    if (!session || !hasPermission(session.profile.role, "tasks.update")) {
      return { success: false, error: t("unauthorized") };
    }
    const parsed = subtaskIdSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: t("invalid") };

    const supabase = await createClient();
    const { data: subtask } = await supabase
      .from("task_subtasks")
      .select("id, task_id, title")
      .eq("id", parsed.data.id)
      .maybeSingle();
    if (!subtask) return { success: false, error: t("notFound") };

    const { error } = await supabase
      .from("task_subtasks")
      .delete()
      .eq("id", parsed.data.id);
    if (error) {
      console.error("[deleteTaskSubtask]", error.message);
      return { success: false, error: t("update") };
    }

    const task = await loadTaskMeta(subtask.task_id);
    if (task) {
      await publishEvent({
        type: "task.updated",
        module: "tasks",
        actorId: session.profile.id,
        actorRole: session.profile.role,
        targetId: task.id,
        relatedCreatorId: task.creator_id,
        link: `/admin/tasks/${task.id}`,
        payload: { ...assigneePayload(task), subtaskDeleted: true },
        description: `Subtask removed: ${subtask.title}`,
      });
      await revalidateTasks(task.id, task.creator_id);
    }

    return { success: true };
  } catch (error) {
    console.error("[deleteTaskSubtask]", error);
    return { success: false, error: t("update") };
  }
}

export async function uploadTaskAttachment(
  taskId: string,
  formData: FormData,
): Promise<TaskActionResult> {
  const t = await getTranslations("admin.tasks.actionErrors");
  try {
    const session = await requireStaffSession();
    if (!session || !hasPermission(session.profile.role, "tasks.update")) {
      return { success: false, error: t("unauthorized") };
    }

    const task = await loadTaskMeta(taskId);
    if (!task) return { success: false, error: t("notFound") };

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { success: false, error: t("invalid") };
    }
    if (file.size > TASK_MAX_FILE_BYTES) {
      return { success: false, error: t("fileTooLarge") };
    }
    if (!isAllowedTaskMime(file.type)) {
      return { success: false, error: t("fileType") };
    }

    const path = taskFilePath(taskId, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    const admin = createAdminClient();
    const { error: uploadError } = await admin.storage
      .from(TASK_FILES_BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[uploadTaskAttachment.storage]", uploadError.message);
      return { success: false, error: t("upload") };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("task_attachments").insert({
      task_id: taskId,
      uploaded_by: session.profile.id,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      bucket: TASK_FILES_BUCKET,
      path,
    });

    if (error) {
      console.error("[uploadTaskAttachment.db]", error.message);
      await admin.storage.from(TASK_FILES_BUCKET).remove([path]);
      return { success: false, error: t("upload") };
    }

    await publishEvent({
      type: "task.attachment.uploaded",
      module: "tasks",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: task.id,
      relatedCreatorId: task.creator_id,
      link: `/admin/tasks/${task.id}`,
      payload: {
        ...assigneePayload(task),
        fileName: file.name,
      },
    });

    await revalidateTasks(task.id, task.creator_id);
    return { success: true, id: task.id };
  } catch (error) {
    console.error("[uploadTaskAttachment]", error);
    return { success: false, error: t("upload") };
  }
}

export async function deleteTaskAttachment(raw: unknown): Promise<TaskActionResult> {
  const t = await getTranslations("admin.tasks.actionErrors");
  try {
    const session = await requireStaffSession();
    if (!session || !hasPermission(session.profile.role, "tasks.update")) {
      return { success: false, error: t("unauthorized") };
    }

    const parsed = attachmentIdSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: t("invalid") };

    const supabase = await createClient();
    const { data: file } = await supabase
      .from("task_attachments")
      .select("*")
      .eq("id", parsed.data.id)
      .maybeSingle();
    if (!file) return { success: false, error: t("notFound") };

    if (
      file.uploaded_by !== session.profile.id &&
      !isOwner(session.profile.role) &&
      session.profile.role !== "admin"
    ) {
      return { success: false, error: t("unauthorized") };
    }

    const admin = createAdminClient();
    await admin.storage.from(file.bucket || TASK_FILES_BUCKET).remove([file.path]);

    const { error } = await supabase
      .from("task_attachments")
      .delete()
      .eq("id", parsed.data.id);
    if (error) {
      console.error("[deleteTaskAttachment]", error.message);
      return { success: false, error: t("delete") };
    }

    const task = await loadTaskMeta(file.task_id);
    if (task) {
      await publishEvent({
        type: "task.attachment.deleted",
        module: "tasks",
        actorId: session.profile.id,
        actorRole: session.profile.role,
        targetId: task.id,
        relatedCreatorId: task.creator_id,
        link: `/admin/tasks/${task.id}`,
        payload: {
          ...assigneePayload(task),
          fileName: file.file_name,
        },
      });
      await revalidateTasks(task.id, task.creator_id);
    }

    return { success: true };
  } catch (error) {
    console.error("[deleteTaskAttachment]", error);
    return { success: false, error: t("delete") };
  }
}
