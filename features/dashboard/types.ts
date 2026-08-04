import type { ApplicationStatus } from "@/types/database.types";

export type DashboardKpis = {
  total: number;
  new: number;
  reviewing: number;
  active: number;
  rejected: number;
};

export type DashboardRecentApplication = {
  id: string;
  full_name: string;
  platform: string | null;
  status: ApplicationStatus;
  priority: string;
  created_at: string;
};

export type PlatformBreakdownItem = {
  platform: string;
  label: string;
  count: number;
};

export type DashboardData = {
  kpis: DashboardKpis;
  recent: DashboardRecentApplication[];
  platforms: PlatformBreakdownItem[];
};
