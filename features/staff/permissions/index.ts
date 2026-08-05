import type { UserRole } from "@/types/database.types";

/** Modules that expose CRUD-style capabilities. */
export type PermissionModule =
  | "applications"
  | "creators"
  | "finance"
  | "tasks"
  | "calendar"
  | "blog"
  | "analytics"
  | "settings"
  | "staff"
  | "notifications"
  | "activity";

export type PermissionAction = "create" | "read" | "update" | "delete" | "manage";

export type Permission =
  | `${PermissionModule}.${PermissionAction}`
  | "staff.promote_owner"
  | "staff.transfer_ownership"
  | "staff.delete_owner";

const ALL_CRUD = (
  module: PermissionModule,
): Permission[] => [
  `${module}.create`,
  `${module}.read`,
  `${module}.update`,
  `${module}.delete`,
];

/** Central role → permission matrix. Owner bypasses via hasPermission(). */
export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[] | "*"> = {
  owner: "*",
  admin: [
    ...ALL_CRUD("applications"),
    ...ALL_CRUD("creators"),
    ...ALL_CRUD("finance"),
    ...ALL_CRUD("tasks"),
    ...ALL_CRUD("calendar"),
    ...ALL_CRUD("blog"),
    "analytics.read",
    "analytics.manage",
    "settings.read",
    "settings.update",
    "settings.manage",
    "staff.create",
    "staff.read",
    "staff.update",
    "staff.delete",
    "staff.manage",
    "notifications.read",
    "notifications.manage",
    "activity.read",
  ],
  manager: [
    "applications.read",
    "applications.update",
    "creators.read",
    "creators.update",
    "finance.read",
    "tasks.read",
    "tasks.update",
    "calendar.read",
    "calendar.update",
    "blog.read",
    "analytics.read",
    "notifications.read",
    "activity.read",
    "staff.read",
  ],
  support: [
    "applications.read",
    "applications.update",
    "creators.read",
    "tasks.read",
    "tasks.update",
    "calendar.read",
    "notifications.read",
  ],
  moderator: [
    "applications.read",
    "creators.read",
    "blog.read",
    "blog.update",
    "tasks.read",
    "notifications.read",
  ],
  content_manager: [
    "blog.create",
    "blog.read",
    "blog.update",
    "blog.delete",
    "creators.read",
    "calendar.read",
    "notifications.read",
  ],
  finance: [
    "finance.create",
    "finance.read",
    "finance.update",
    "finance.delete",
    "creators.read",
    "analytics.read",
    "notifications.read",
  ],
  viewer: [
    "applications.read",
    "creators.read",
    "finance.read",
    "tasks.read",
    "calendar.read",
    "blog.read",
    "analytics.read",
    "notifications.read",
    "activity.read",
  ],
  creator: [],
  guest: [],
};

/**
 * Single permission check used across the platform.
 * Owner always passes. No duplicated permission logic in modules.
 */
export function hasPermission(
  role: UserRole | null | undefined,
  permission: Permission,
): boolean {
  if (!role) return false;
  const grants = ROLE_PERMISSIONS[role];
  if (grants === "*") return true;
  return grants.includes(permission);
}

export function listPermissionsForRole(role: UserRole): readonly Permission[] {
  const grants = ROLE_PERMISSIONS[role];
  if (grants === "*") {
    return Object.values(ROLE_PERMISSIONS)
      .filter((value): value is readonly Permission[] => value !== "*")
      .flat()
      .filter((value, index, all) => all.indexOf(value) === index)
      .concat([
        "staff.promote_owner",
        "staff.transfer_ownership",
        "staff.delete_owner",
      ]);
  }
  return grants;
}

export const PERMISSION_MODULES: PermissionModule[] = [
  "applications",
  "creators",
  "finance",
  "tasks",
  "calendar",
  "blog",
  "analytics",
  "settings",
  "staff",
  "notifications",
  "activity",
];

export const PERMISSION_ACTIONS: PermissionAction[] = [
  "create",
  "read",
  "update",
  "delete",
  "manage",
];
