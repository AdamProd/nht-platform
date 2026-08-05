import type { UserRole } from "@/types/database.types";
import { isOwner, isStaff } from "@/lib/auth/roles";

export const CREATOR_ROLE: UserRole = "creator";

export function isCreatorRole(role: UserRole | null | undefined): boolean {
  return role === "creator";
}

/** Owner/admin may impersonate; managers cannot. */
export function canImpersonateCreator(
  role: UserRole | null | undefined,
): boolean {
  return isOwner(role) || role === "admin";
}

export function canAccessCreatorCabinet(
  role: UserRole | null | undefined,
  impersonatingCreatorId: string | null | undefined,
): boolean {
  if (isCreatorRole(role)) return true;
  if (canImpersonateCreator(role) && impersonatingCreatorId) return true;
  return false;
}

export function isStaffBlockedFromCabinet(
  role: UserRole | null | undefined,
  impersonatingCreatorId: string | null | undefined,
): boolean {
  return isStaff(role) && !canAccessCreatorCabinet(role, impersonatingCreatorId);
}
