import type { PlatformEventType } from "@/features/events/types";

/** Default UI copy keys under events.catalog.* — resolved at publish time. */
export const EVENT_CATALOG: Record<
  PlatformEventType,
  {
    titleKey: string;
    messageKey: string;
    descriptionKey: string;
    entityType: string;
    defaultVisibility: "owner" | "staff" | "manager_scoped";
  }
> = {
  "application.created": {
    titleKey: "applicationCreatedTitle",
    messageKey: "applicationCreatedMessage",
    descriptionKey: "applicationCreatedDescription",
    entityType: "application",
    defaultVisibility: "staff",
  },
  "application.updated": {
    titleKey: "applicationUpdatedTitle",
    messageKey: "applicationUpdatedMessage",
    descriptionKey: "applicationUpdatedDescription",
    entityType: "application",
    defaultVisibility: "manager_scoped",
  },
  "application.status_changed": {
    titleKey: "applicationStatusTitle",
    messageKey: "applicationStatusMessage",
    descriptionKey: "applicationStatusDescription",
    entityType: "application",
    defaultVisibility: "manager_scoped",
  },
  "application.assigned": {
    titleKey: "applicationAssignedTitle",
    messageKey: "applicationAssignedMessage",
    descriptionKey: "applicationAssignedDescription",
    entityType: "application",
    defaultVisibility: "manager_scoped",
  },
  "creator.created": {
    titleKey: "creatorCreatedTitle",
    messageKey: "creatorCreatedMessage",
    descriptionKey: "creatorCreatedDescription",
    entityType: "creator",
    defaultVisibility: "staff",
  },
  "creator.updated": {
    titleKey: "creatorUpdatedTitle",
    messageKey: "creatorUpdatedMessage",
    descriptionKey: "creatorUpdatedDescription",
    entityType: "creator",
    defaultVisibility: "manager_scoped",
  },
  "creator.assigned": {
    titleKey: "creatorAssignedTitle",
    messageKey: "creatorAssignedMessage",
    descriptionKey: "creatorAssignedDescription",
    entityType: "creator",
    defaultVisibility: "manager_scoped",
  },
  "creator.status_changed": {
    titleKey: "creatorStatusTitle",
    messageKey: "creatorStatusMessage",
    descriptionKey: "creatorStatusDescription",
    entityType: "creator",
    defaultVisibility: "manager_scoped",
  },
  "creator.avatar_changed": {
    titleKey: "creatorAvatarTitle",
    messageKey: "creatorAvatarMessage",
    descriptionKey: "creatorAvatarDescription",
    entityType: "creator",
    defaultVisibility: "manager_scoped",
  },
  "creator.profile_updated": {
    titleKey: "creatorProfileTitle",
    messageKey: "creatorProfileMessage",
    descriptionKey: "creatorProfileDescription",
    entityType: "creator",
    defaultVisibility: "manager_scoped",
  },
  "creator.document_uploaded": {
    titleKey: "creatorDocumentTitle",
    messageKey: "creatorDocumentMessage",
    descriptionKey: "creatorDocumentDescription",
    entityType: "creator",
    defaultVisibility: "manager_scoped",
  },
  "creator.platform_added": {
    titleKey: "creatorPlatformTitle",
    messageKey: "creatorPlatformMessage",
    descriptionKey: "creatorPlatformDescription",
    entityType: "creator",
    defaultVisibility: "manager_scoped",
  },
  "staff.login": {
    titleKey: "staffLoginTitle",
    messageKey: "staffLoginMessage",
    descriptionKey: "staffLoginDescription",
    entityType: "profile",
    defaultVisibility: "owner",
  },
  "staff.logout": {
    titleKey: "staffLogoutTitle",
    messageKey: "staffLogoutMessage",
    descriptionKey: "staffLogoutDescription",
    entityType: "profile",
    defaultVisibility: "owner",
  },
  "staff.created": {
    titleKey: "staffCreatedTitle",
    messageKey: "staffCreatedMessage",
    descriptionKey: "staffCreatedDescription",
    entityType: "profile",
    defaultVisibility: "owner",
  },
  "staff.role_changed": {
    titleKey: "staffRoleTitle",
    messageKey: "staffRoleMessage",
    descriptionKey: "staffRoleDescription",
    entityType: "profile",
    defaultVisibility: "owner",
  },
};
