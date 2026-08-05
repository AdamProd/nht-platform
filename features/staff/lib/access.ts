import { requireStaffSession, isAdminOrAbove, isOwner } from "@/lib/auth";
import { hasPermission } from "@/features/staff/permissions";
import type { UserRole } from "@/types/database.types";
import type { StaffActionResult } from "@/features/staff/types";

export async function requireStaffAdminSession() {
  const session = await requireStaffSession();
  if (!session) return null;
  if (!isAdminOrAbove(session.profile.role)) return null;
  return session;
}

export function canManageTargetStaff(
  actorRole: UserRole,
  targetRole: UserRole,
): boolean {
  if (isOwner(actorRole)) return true;
  if (actorRole === "admin" && targetRole !== "owner") return true;
  return false;
}

export function canChangeRoleTo(
  actorRole: UserRole,
  nextRole: UserRole,
): boolean {
  if (nextRole === "owner") {
    return hasPermission(actorRole, "staff.promote_owner");
  }
  if (isOwner(actorRole)) return true;
  return actorRole === "admin";
}

export function forbiddenResult(message: string): StaffActionResult {
  return { success: false, error: message };
}
