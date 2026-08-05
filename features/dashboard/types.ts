import type { ApplicationStatus } from "@/types/database.types";
import type { CreatorListItem } from "@/features/creators/types";

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

export type DashboardTaskStats = {
  openTasks: number;
  myTasks: number;
  overdue: number;
  completedToday: number;
};

export type DashboardData = {
  kpis: DashboardKpis;
  recent: DashboardRecentApplication[];
  newestCreators: CreatorListItem[];
  topRevenueCreators: CreatorListItem[];
  latestRegistrations: CreatorListItem[];
  /** @deprecated Prefer newestCreators */
  recentCreators: CreatorListItem[];
  platforms: PlatformBreakdownItem[];
  tasks: DashboardTaskStats;
};
