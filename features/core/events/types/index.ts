import type { Json, UserRole } from "@/types/database.types";

export type EventModule =
  | "applications"
  | "creators"
  | "cabinet"
  | "finance"
  | "admin"
  | "auth"
  | "blog"
  | "analytics"
  | "settings"
  | "tasks"
  | "calendar";

export type EventVisibility = "owner" | "staff" | "manager_scoped";

export type PlatformEventType =
  | "application.created"
  | "application.updated"
  | "application.status_changed"
  | "application.assigned"
  | "creator.created"
  | "creator.updated"
  | "creator.assigned"
  | "creator.status_changed"
  | "creator.avatar_changed"
  | "creator.profile_updated"
  | "creator.document_uploaded"
  | "creator.platform_added"
  | "creator.archived"
  | "creator.deleted"
  | "manager.changed"
  | "status.changed"
  | "staff.login"
  | "staff.logout"
  | "staff.created"
  | "staff.updated"
  | "staff.deleted"
  | "staff.role_changed"
  | "staff.department_changed"
  | "staff.status_changed"
  | "staff.assigned_creator"
  | "staff.unassigned_creator"
  | "employee.created"
  | "employee.updated"
  | "employee.deleted"
  | "employee.suspended"
  | "employee.activated"
  | "finance.transaction.created"
  | "finance.transaction.updated"
  | "finance.transaction.deleted"
  | "finance.transaction.status_changed"
  | "finance.transaction.assigned"
  | "finance.payout.created"
  | "finance.payout.updated"
  | "finance.payout.paid"
  | "finance.payout.cancelled"
  | "finance.payout.requested"
  | "finance.payout.approved"
  | "finance.payout.rejected"
  | "finance.balance.updated"
  | "task.created"
  | "task.updated"
  | "task.assigned"
  | "task.completed"
  | "task.deleted"
  | "task.status_changed"
  | "task.comment.created"
  | "task.comment.updated"
  | "task.comment.deleted"
  | "task.attachment.uploaded"
  | "task.attachment.deleted"
  | "task.duplicated"
  | "task.deadline_approaching";

export type PublishEventInput = {
  type: PlatformEventType;
  module: EventModule;
  actorId?: string | null;
  actorRole?: UserRole | null;
  targetId?: string | null;
  entityType?: string | null;
  relatedCreatorId?: string | null;
  visibility?: EventVisibility;
  payload?: Record<string, unknown>;
  /** Explicit notification recipients; otherwise derived from event type */
  recipientIds?: string[];
  link?: string | null;
  title?: string;
  message?: string;
  description?: string;
};

export type PublishedEvent = {
  id: string;
  type: PlatformEventType;
  module: EventModule;
};

export type NotificationRow = {
  id: string;
  created_at: string;
  recipient_id: string;
  actor_id: string | null;
  module: string;
  event_type: string;
  event_id: string | null;
  title: string;
  message: string;
  link: string | null;
  read_at: string | null;
  archived_at: string | null;
  actor?: { id: string; full_name: string | null; role: UserRole } | null;
};

export type ActivityLogRow = {
  id: string;
  created_at: string;
  event_id: string | null;
  actor_id: string | null;
  actor_role: UserRole | null;
  module: string;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  description: string;
  payload: Json;
  visibility: string;
  related_creator_id: string | null;
  actor?: { id: string; full_name: string | null; avatar_url: string | null; role: UserRole } | null;
};

export type EventActionResult =
  | { success: true }
  | { success: false; error: string };
