/** Prefer `@/features/core/permissions`. */
export {
  hasPermission,
  listPermissionsForRole,
  ROLE_PERMISSIONS,
  PERMISSION_MODULES,
  PERMISSION_ACTIONS,
  type Permission,
  type PermissionModule,
  type PermissionAction,
} from "@/features/core/permissions/index";

export { default as PermissionsMatrix } from "@/features/staff/permissions/components/PermissionsMatrix";
