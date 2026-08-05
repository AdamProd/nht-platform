/** Compatibility shim — prefer `@/features/core/events`. */
export {
  publishEvent,
  EVENT_CATALOG,
  resolveNotificationRecipients,
  type PublishEventInput,
  type PublishedEvent,
  type PlatformEventType,
  type EventModule,
  type EventVisibility,
  type NotificationRow,
  type ActivityLogRow,
  type EventActionResult,
} from "@/features/core/events";

export {
  getUnreadNotificationCount,
  listRecentNotifications,
  listNotifications,
  NOTIFICATIONS_PAGE_SIZE,
  markNotificationRead,
  markAllNotificationsRead,
  archiveNotification,
  deleteNotification,
} from "@/features/core/notifications";

export {
  listActivityLogs,
  ACTIVITY_PAGE_SIZE,
} from "@/features/core/activity";
