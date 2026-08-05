import { getDashboardKpis } from "@/features/dashboard/queries/get-dashboard-kpis";
import { getRecentApplications } from "@/features/dashboard/queries/get-recent-applications";
import { getPlatformBreakdown } from "@/features/dashboard/queries/get-platform-breakdown";
import {
  getRecentCreators,
  getTopRevenueCreators,
} from "@/features/creators/queries/get-recent-creators";
import type { DashboardData } from "@/features/dashboard/types";

export async function getDashboardData(): Promise<DashboardData> {
  const [
    kpis,
    recent,
    newestCreators,
    topRevenueCreators,
    platforms,
  ] = await Promise.all([
    getDashboardKpis(),
    getRecentApplications(10),
    getRecentCreators(5),
    getTopRevenueCreators(5),
    getPlatformBreakdown(),
  ]);

  return {
    kpis,
    recent,
    newestCreators,
    topRevenueCreators,
    latestRegistrations: newestCreators,
    recentCreators: newestCreators,
    platforms,
  };
}
