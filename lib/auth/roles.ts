import type { UserRole } from "@/types/database.types";

/** Roles allowed into the admin CRM. Owner is always included via bypass. */
export const STAFF_ROLES: readonly UserRole[] = [
  "owner",
  "admin",
  "manager",
  "support",
  "moderator",
  "content_manager",
  "finance",
  "viewer",
] as const;

export function isOwner(role: UserRole | null | undefined): boolean {
  return role === "owner";
}

export function isStaff(role: UserRole | null | undefined): boolean {
  if (!role) return false;
  return (STAFF_ROLES as readonly string[]).includes(role);
}

export function isAdminOrAbove(role: UserRole | null | undefined): boolean {
  return role === "owner" || role === "admin";
}

/**
 * Role check with owner bypass — owner passes every requireRole gate.
 */
export function hasAllowedRole(
  role: UserRole | null | undefined,
  allowed: readonly UserRole[],
): boolean {
  if (!role) return false;
  if (isOwner(role)) return true;
  return allowed.includes(role);
}
