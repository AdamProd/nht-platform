/** Platform auth surface — re-exports from `@/lib/auth`. */
export {
  findCreatorByAuthEmail,
  resolveCreatorForAuthUser,
  findCreatorById,
} from "@/lib/auth/resolve-creator";

export {
  STAFF_ROLES,
  hasAllowedRole,
  isOwner,
  isStaff,
  isAdminOrAbove,
} from "@/lib/auth/roles";

export {
  CREATOR_ROLE,
  isCreatorRole,
  canImpersonateCreator,
  canAccessCreatorCabinet,
  isStaffBlockedFromCabinet,
} from "@/lib/auth/creator";

export {
  getAuthSession,
  requireAuth,
  requireRole,
  requireStaff,
  requireStaffSession,
  requireCreatorCabinet,
  requireCreatorCabinetSession,
  type AuthSession,
  type CreatorCabinetSession,
} from "@/lib/auth/guards";
