import { createAdminClient } from "@/lib/supabase/admin";
import type { PublishEventInput } from "@/features/events/types";

/**
 * Resolve who should receive a notification for this event.
 * Prefer explicit recipientIds; otherwise derive from payload + type.
 */
export async function resolveNotificationRecipients(
  input: PublishEventInput,
): Promise<string[]> {
  if (input.recipientIds?.length) {
    return [...new Set(input.recipientIds.filter(Boolean))];
  }

  const admin = createAdminClient();
  const recipients = new Set<string>();
  const payload = input.payload ?? {};

  switch (input.type) {
    case "application.assigned":
    case "creator.assigned": {
      const managerId =
        (payload.managerId as string | undefined) ||
        (payload.assigned_manager as string | undefined) ||
        (payload.manager_id as string | undefined);
      if (managerId) recipients.add(managerId);
      break;
    }
    case "application.status_changed":
    case "application.updated": {
      const managerId = payload.assigned_manager as string | undefined;
      if (managerId) recipients.add(managerId);
      break;
    }
    case "creator.updated":
    case "creator.status_changed":
    case "creator.avatar_changed":
    case "creator.profile_updated":
    case "creator.document_uploaded":
    case "creator.platform_added": {
      const managerId =
        (payload.managerId as string | undefined) ||
        (payload.manager_id as string | undefined);
      if (managerId) {
        recipients.add(managerId);
      } else if (input.relatedCreatorId) {
        const { data } = await admin
          .from("creators")
          .select("manager_id")
          .eq("id", input.relatedCreatorId)
          .maybeSingle();
        if (data?.manager_id) recipients.add(data.manager_id);
      }
      break;
    }
    case "staff.role_changed":
    case "staff.created": {
      const targetUserId =
        (payload.userId as string | undefined) || input.targetId || undefined;
      if (targetUserId) recipients.add(targetUserId);
      break;
    }
    case "application.created":
    case "creator.created": {
      const { data: owners } = await admin
        .from("profiles")
        .select("id")
        .in("role", ["owner", "admin"]);
      for (const row of owners ?? []) recipients.add(row.id);
      break;
    }
    default:
      break;
  }

  // Never notify the actor about their own action
  if (input.actorId) recipients.delete(input.actorId);

  return [...recipients];
}
