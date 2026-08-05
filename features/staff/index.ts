export type {
  StaffListItem,
  StaffDetail,
  StaffListResult,
  StaffStats,
  StaffActionResult,
  StaffSort,
  StaffEmployeeRole,
  StaffDepartment,
  StaffStatus,
} from "@/features/staff/types";

export {
  STAFF_EMPLOYEE_ROLES,
  ASSIGNABLE_STAFF_ROLES,
  STAFF_DEPARTMENTS,
  STAFF_STATUSES,
  STAFF_PAGE_SIZE,
} from "@/features/staff/types";

export {
  hasPermission,
  listPermissionsForRole,
  ROLE_PERMISSIONS,
  PERMISSION_MODULES,
  PERMISSION_ACTIONS,
} from "@/features/staff/permissions";

export { listStaff } from "@/features/staff/queries/list-staff";
export { getStaff } from "@/features/staff/queries/get-staff";
export { getStaffStats } from "@/features/staff/queries/get-staff-stats";
export { listStaffActivity } from "@/features/staff/queries/list-staff-activity";

export {
  createStaff,
  updateStaffProfile,
  updateStaffRole,
  updateStaffStatus,
  updateStaffDepartment,
  deleteStaff,
  transferOwnership,
  assignCreatorToStaff,
  unassignCreatorFromStaff,
  assignApplicationToStaff,
  assignTaskToStaff,
} from "@/features/staff/actions/staff";
