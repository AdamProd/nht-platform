import type {
  TimelineAccent,
  TimelineIconKind,
} from "@/features/creators/profile/timeline/types/timeline";

export type TimelineVisual = {
  titleKey: string;
  descriptionKey: string;
  icon: TimelineIconKind;
  color: TimelineAccent;
};

/**
 * Maps raw activity/event types (including aliases) to CRM timeline visuals.
 * Unknown types fall back to a neutral activity presentation.
 */
const EVENT_VISUALS: Record<string, TimelineVisual> = {
  // Creator
  "creator.created": {
    titleKey: "creatorCreated",
    descriptionKey: "creatorCreatedDesc",
    icon: "user",
    color: "purple",
  },
  "creator.updated": {
    titleKey: "creatorUpdated",
    descriptionKey: "creatorUpdatedDesc",
    icon: "user",
    color: "purple",
  },
  "creator.profile_updated": {
    titleKey: "creatorUpdated",
    descriptionKey: "creatorUpdatedDesc",
    icon: "user",
    color: "purple",
  },
  "creator.avatar_changed": {
    titleKey: "creatorUpdated",
    descriptionKey: "avatarChangedDesc",
    icon: "user",
    color: "purple",
  },
  "creator.archived": {
    titleKey: "creatorArchived",
    descriptionKey: "creatorArchivedDesc",
    icon: "archive",
    color: "gray",
  },
  "creator.restored": {
    titleKey: "creatorRestored",
    descriptionKey: "creatorRestoredDesc",
    icon: "user",
    color: "purple",
  },
  "creator.deleted": {
    titleKey: "creatorDeleted",
    descriptionKey: "creatorDeletedDesc",
    icon: "trash",
    color: "red",
  },
  "creator.status_changed": {
    titleKey: "statusChanged",
    descriptionKey: "statusChangedDesc",
    icon: "user",
    color: "purple",
  },
  "status.changed": {
    titleKey: "statusChanged",
    descriptionKey: "statusChangedDesc",
    icon: "user",
    color: "purple",
  },

  // Manager
  "creator.assigned": {
    titleKey: "managerAssigned",
    descriptionKey: "managerAssignedDesc",
    icon: "users",
    color: "purple",
  },
  "creator.manager.assigned": {
    titleKey: "managerAssigned",
    descriptionKey: "managerAssignedDesc",
    icon: "users",
    color: "purple",
  },
  "creator.manager.changed": {
    titleKey: "managerChanged",
    descriptionKey: "managerChangedDesc",
    icon: "users",
    color: "purple",
  },
  "manager.changed": {
    titleKey: "managerChanged",
    descriptionKey: "managerChangedDesc",
    icon: "users",
    color: "purple",
  },
  "creator.manager.removed": {
    titleKey: "managerRemoved",
    descriptionKey: "managerRemovedDesc",
    icon: "users",
    color: "gray",
  },
  "staff.assigned_creator": {
    titleKey: "managerAssigned",
    descriptionKey: "managerAssignedDesc",
    icon: "users",
    color: "purple",
  },
  "staff.unassigned_creator": {
    titleKey: "managerRemoved",
    descriptionKey: "managerRemovedDesc",
    icon: "users",
    color: "gray",
  },

  // Finance
  "finance.transaction.created": {
    titleKey: "transactionCreated",
    descriptionKey: "transactionCreatedDesc",
    icon: "dollar",
    color: "green",
  },
  "finance.transaction.updated": {
    titleKey: "transactionUpdated",
    descriptionKey: "transactionUpdatedDesc",
    icon: "dollar",
    color: "green",
  },
  "finance.transaction.status_changed": {
    titleKey: "transactionUpdated",
    descriptionKey: "transactionUpdatedDesc",
    icon: "dollar",
    color: "green",
  },
  "finance.payout.created": {
    titleKey: "payoutCreated",
    descriptionKey: "payoutCreatedDesc",
    icon: "dollar",
    color: "green",
  },
  "finance.payout.updated": {
    titleKey: "payoutUpdated",
    descriptionKey: "payoutUpdatedDesc",
    icon: "dollar",
    color: "green",
  },
  "finance.payout.approved": {
    titleKey: "payoutApproved",
    descriptionKey: "payoutApprovedDesc",
    icon: "dollar",
    color: "green",
  },
  "finance.payout.paid": {
    titleKey: "payoutApproved",
    descriptionKey: "payoutApprovedDesc",
    icon: "dollar",
    color: "green",
  },
  "finance.payout.requested": {
    titleKey: "payoutRequested",
    descriptionKey: "payoutRequestedDesc",
    icon: "dollar",
    color: "orange",
  },
  "finance.payout.rejected": {
    titleKey: "payoutRejected",
    descriptionKey: "payoutRejectedDesc",
    icon: "dollar",
    color: "red",
  },
  "finance.payout.cancelled": {
    titleKey: "payoutRejected",
    descriptionKey: "payoutRejectedDesc",
    icon: "dollar",
    color: "gray",
  },
  "finance.balance.updated": {
    titleKey: "balanceUpdated",
    descriptionKey: "balanceUpdatedDesc",
    icon: "dollar",
    color: "blue",
  },

  // Platforms (generic + specific)
  "creator.platform_added": {
    titleKey: "platformConnected",
    descriptionKey: "platformConnectedDesc",
    icon: "link",
    color: "blue",
  },
  "platform.onlyfans.connected": {
    titleKey: "onlyfansConnected",
    descriptionKey: "platformConnectedDesc",
    icon: "link",
    color: "blue",
  },
  "platform.onlyfans.disconnected": {
    titleKey: "onlyfansDisconnected",
    descriptionKey: "platformDisconnectedDesc",
    icon: "link",
    color: "gray",
  },
  "platform.fansly.connected": {
    titleKey: "fanslyConnected",
    descriptionKey: "platformConnectedDesc",
    icon: "link",
    color: "blue",
  },
  "platform.fansly.disconnected": {
    titleKey: "fanslyDisconnected",
    descriptionKey: "platformDisconnectedDesc",
    icon: "link",
    color: "gray",
  },
  "platform.manyvids.connected": {
    titleKey: "manyvidsConnected",
    descriptionKey: "platformConnectedDesc",
    icon: "link",
    color: "blue",
  },
  "platform.manyvids.disconnected": {
    titleKey: "manyvidsDisconnected",
    descriptionKey: "platformDisconnectedDesc",
    icon: "link",
    color: "gray",
  },

  // Documents
  "document.uploaded": {
    titleKey: "documentUploaded",
    descriptionKey: "documentUploadedDesc",
    icon: "file",
    color: "blue",
  },
  "creator.document_uploaded": {
    titleKey: "documentUploaded",
    descriptionKey: "documentUploadedDesc",
    icon: "file",
    color: "blue",
  },
  "document.deleted": {
    titleKey: "documentDeleted",
    descriptionKey: "documentDeletedDesc",
    icon: "file",
    color: "red",
  },

  // Tasks
  "task.created": {
    titleKey: "taskCreated",
    descriptionKey: "taskCreatedDesc",
    icon: "activity",
    color: "purple",
  },
  "task.updated": {
    titleKey: "taskUpdated",
    descriptionKey: "taskUpdatedDesc",
    icon: "activity",
    color: "purple",
  },
  "task.assigned": {
    titleKey: "taskAssigned",
    descriptionKey: "taskAssignedDesc",
    icon: "users",
    color: "purple",
  },
  "task.completed": {
    titleKey: "taskCompleted",
    descriptionKey: "taskCompletedDesc",
    icon: "activity",
    color: "green",
  },
  "task.deleted": {
    titleKey: "taskDeleted",
    descriptionKey: "taskDeletedDesc",
    icon: "trash",
    color: "red",
  },

  // Support
  "support.ticket.created": {
    titleKey: "ticketCreated",
    descriptionKey: "ticketCreatedDesc",
    icon: "message",
    color: "orange",
  },
  "support.ticket.closed": {
    titleKey: "ticketClosed",
    descriptionKey: "ticketClosedDesc",
    icon: "message",
    color: "gray",
  },

  // Notifications / invite
  "notification.sent": {
    titleKey: "notificationSent",
    descriptionKey: "notificationSentDesc",
    icon: "bell",
    color: "orange",
  },
  "creator.invited": {
    titleKey: "invitationSent",
    descriptionKey: "invitationSentDesc",
    icon: "bell",
    color: "purple",
  },
};

const FALLBACK: TimelineVisual = {
  titleKey: "genericEvent",
  descriptionKey: "genericEventDesc",
  icon: "activity",
  color: "purple",
};

export function resolveTimelineVisual(eventType: string): TimelineVisual {
  return EVENT_VISUALS[eventType] ?? FALLBACK;
}

export function formatTimelineMoney(
  value: unknown,
  currency = "USD",
): string | null {
  const amount = typeof value === "string" ? Number(value) : Number(value);
  if (!Number.isFinite(amount)) return null;
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(0)}`;
  }
}
