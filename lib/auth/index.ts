export {
  STAFF_ROLES,
  hasAllowedRole,
  isOwner,
  isStaff,
  isAdminOrAbove,
} from "./roles";

export {
  CREATOR_ROLE,
  isCreatorRole,
  canImpersonateCreator,
  canAccessCreatorCabinet,
  isStaffBlockedFromCabinet,
} from "./creator";

export {
  findCreatorByAuthEmail,
  resolveCreatorForAuthUser,
  findCreatorById,
} from "./resolve-creator";

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
} from "./guards";
