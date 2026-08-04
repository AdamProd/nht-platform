import type {
  ApplicationPriority,
  ApplicationStatus,
  Tables,
} from "@/types/database.types";

export type ApplicationManager = {
  id: string;
  full_name: string | null;
};

export type ApplicationListItem = Tables<"applications"> & {
  manager: ApplicationManager | null;
};

export type ApplicationDetail = ApplicationListItem;

export type ApplicationsListResult = {
  items: ApplicationListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ApplicationActionResult =
  | { success: true }
  | { success: false; error: string };

export type StaffManagerOption = {
  id: string;
  full_name: string | null;
  role: string;
};

export type { ApplicationStatus, ApplicationPriority };
