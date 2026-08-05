import type {
  StaffDepartment,
  StaffStatus,
  Tables,
  UserRole,
} from "@/types/database.types";
import { STAFF_ROLES } from "@/lib/auth/roles";

export type StaffListItem = Tables<"profiles"> & {
  managed_creators_count: number;
  email: string | null;
};

export type StaffDetail = Tables<"profiles"> & {
  email: string | null;
  managedCreators: Array<{
    id: string;
    display_name: string | null;
    status: string;
  }>;
  assignedApplications: Array<{
    id: string;
    full_name: string;
    status: string;
    created_at: string;
  }>;
  assignedTasks: Array<{
    id: string;
    title: string;
    status: string;
    creator_id: string;
  }>;
};

export type StaffListResult = {
  items: StaffListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type StaffStats = {
  employees: number;
  managers: number;
  creators: number;
  departments: number;
  activeToday: number;
};

export type StaffActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };

export type StaffSort = "newest" | "oldest" | "name";

/** Employee roles (excludes creator + guest). */
export const STAFF_EMPLOYEE_ROLES = STAFF_ROLES;

export type StaffEmployeeRole = (typeof STAFF_EMPLOYEE_ROLES)[number];

/** Roles that can be assigned when creating staff (not creator/guest/owner). */
export const ASSIGNABLE_STAFF_ROLES = [
  "admin",
  "manager",
  "support",
  "moderator",
  "content_manager",
  "finance",
  "viewer",
] as const satisfies readonly UserRole[];

export const STAFF_DEPARTMENTS = [
  "management",
  "sales",
  "support",
  "marketing",
  "content",
  "finance",
  "hr",
  "operations",
  "custom",
] as const satisfies readonly StaffDepartment[];

export const STAFF_STATUSES = [
  "invited",
  "active",
  "vacation",
  "suspended",
  "disabled",
  "archived",
] as const satisfies readonly StaffStatus[];

export const STAFF_PAGE_SIZE = 20;

export type { StaffDepartment, StaffStatus, UserRole };
