import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaffSession } from "@/lib/auth";
import { hasPermission } from "@/features/core/permissions";
import { TASK_FILES_BUCKET } from "@/features/tasks/lib/storage";
import type { TaskDetail } from "@/features/tasks/types";

const DETAIL_SELECT = `
  *,
  creator:creators!tasks_creator_id_fkey (
    id,
    display_name,
    email
  ),
  assignee:profiles!tasks_assigned_to_fkey (
    id,
    full_name,
    avatar_url,
    role,
    department
  ),
  author:profiles!tasks_created_by_fkey (
    id,
    full_name,
    avatar_url,
    role,
    department
  )
`;

export async function getTask(id: string): Promise<TaskDetail | null> {
  const session = await requireStaffSession();
  if (!session) throw new Error("Unauthorized");
  if (!hasPermission(session.profile.role, "tasks.read")) {
    throw new Error("Forbidden");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(DETAIL_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getTask]", error.message);
    throw new Error("Failed to load task.");
  }
  if (!data) return null;

  const [
    { data: comments },
    { data: subtasks },
    { data: attachments },
    { data: activity },
  ] = await Promise.all([
    supabase
      .from("task_comments")
      .select(
        `
        *,
        author:profiles!task_comments_author_id_fkey (
          id,
          full_name,
          avatar_url,
          role
        )
      `,
      )
      .eq("task_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("task_subtasks")
      .select("*")
      .eq("task_id", id)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("task_attachments")
      .select(
        `
        *,
        uploader:profiles!task_attachments_uploaded_by_fkey (
          id,
          full_name,
          avatar_url
        )
      `,
      )
      .eq("task_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("activity_logs")
      .select(
        `
        id,
        event_type,
        description,
        created_at,
        actor:profiles!activity_logs_actor_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `,
      )
      .eq("entity_type", "task")
      .eq("entity_id", id)
      .order("created_at", { ascending: false })
      .limit(80),
  ]);

  let signedAttachments = (attachments ?? []) as TaskDetail["attachments"];
  if (signedAttachments.length > 0) {
    try {
      const admin = createAdminClient();
      signedAttachments = await Promise.all(
        signedAttachments.map(async (file) => {
          const { data: signed } = await admin.storage
            .from(file.bucket || TASK_FILES_BUCKET)
            .createSignedUrl(file.path, 60 * 60);
          return {
            ...file,
            signedUrl: signed?.signedUrl ?? null,
          };
        }),
      );
    } catch (signError) {
      console.error("[getTask.signedUrls]", signError);
    }
  }

  return {
    ...(data as Omit<
      TaskDetail,
      "comments" | "subtasks" | "attachments" | "activity"
    >),
    comments: (comments ?? []) as TaskDetail["comments"],
    subtasks: (subtasks ?? []) as TaskDetail["subtasks"],
    attachments: signedAttachments,
    activity: (activity ?? []).map((row) => ({
      id: row.id,
      event_type: row.event_type,
      description: row.description,
      created_at: row.created_at,
      actor: row.actor
        ? {
            id: row.actor.id,
            full_name: row.actor.full_name,
            avatar_url: row.actor.avatar_url,
          }
        : null,
    })),
  };
}
