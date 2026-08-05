import { createAdminClient } from "@/lib/supabase/admin";
import type { PublishEventInput } from "@/features/core/events/types";

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
    case "creator.assigned":
    case "manager.changed": {
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
    case "status.changed":
    case "creator.avatar_changed":
    case "creator.profile_updated":
    case "creator.document_uploaded":
    case "creator.platform_added":
    case "creator.archived": {
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
    case "creator.deleted": {
      const { data: owners } = await admin
        .from("profiles")
        .select("id")
        .in("role", ["owner", "admin"]);
      for (const row of owners ?? []) recipients.add(row.id);
      break;
    }
    case "staff.role_changed":
    case "staff.created":
    case "staff.status_changed":
    case "staff.assigned_creator":
    case "employee.created":
    case "employee.updated":
    case "employee.suspended":
    case "employee.activated": {
      const targetUserId =
        (payload.userId as string | undefined) || input.targetId || undefined;
      if (targetUserId) recipients.add(targetUserId);
      break;
    }
    case "employee.deleted": {
      const { data: owners } = await admin
        .from("profiles")
        .select("id")
        .in("role", ["owner", "admin"]);
      for (const row of owners ?? []) recipients.add(row.id);
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
    case "finance.transaction.created":
    case "finance.transaction.updated":
    case "finance.transaction.status_changed":
    case "finance.transaction.assigned":
    case "finance.payout.created":
    case "finance.payout.updated":
    case "finance.payout.paid":
    case "finance.payout.cancelled":
    case "finance.payout.requested":
    case "finance.payout.approved":
    case "finance.payout.rejected":
    case "finance.balance.updated": {
      const managerId =
        (payload.managerId as string | undefined) ||
        (payload.manager_id as string | undefined);
      if (managerId) recipients.add(managerId);

      if (payload.notifyOwners || payload.largePayout) {
        const { data: owners } = await admin
          .from("profiles")
          .select("id")
          .eq("role", "owner");
        for (const row of owners ?? []) recipients.add(row.id);
      }

      if (payload.notifyAdmins) {
        const { data: admins } = await admin
          .from("profiles")
          .select("id")
          .in("role", ["owner", "admin"]);
        for (const row of admins ?? []) recipients.add(row.id);
      }

      // Future: creator profile user id when linked
      const creatorUserId = payload.creatorUserId as string | undefined;
      if (creatorUserId) recipients.add(creatorUserId);
      break;
    }
    case "finance.transaction.deleted": {
      const { data: owners } = await admin
        .from("profiles")
        .select("id")
        .in("role", ["owner", "admin"]);
      for (const row of owners ?? []) recipients.add(row.id);
      break;
    }
    case "task.assigned": {
      const assigneeId =
        (payload.assigned_to as string | undefined) ||
        (payload.managerId as string | undefined) ||
        (payload.manager_id as string | undefined);
      if (assigneeId) recipients.add(assigneeId);
      break;
    }
    case "task.created":
    case "task.updated":
    case "task.completed":
    case "task.status_changed":
    case "task.comment.created":
    case "task.comment.updated":
    case "task.attachment.uploaded":
    case "task.duplicated":
    case "task.deadline_approaching": {
      const assigneeId =
        (payload.assigned_to as string | undefined) ||
        (payload.managerId as string | undefined) ||
        (payload.manager_id as string | undefined);
      if (assigneeId) recipients.add(assigneeId);
      break;
    }
    case "task.deleted": {
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
