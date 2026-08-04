import { getDashboardKpis } from "@/features/dashboard/queries/get-dashboard-kpis";
import { getRecentApplications } from "@/features/dashboard/queries/get-recent-applications";
import { getPlatformBreakdown } from "@/features/dashboard/queries/get-platform-breakdown";
import { getRecentCreators } from "@/features/creators/queries/get-recent-creators";
import type { DashboardData } from "@/features/dashboard/types";

export async function getDashboardData(): Promise<DashboardData> {
  const [kpis, recent, recentCreators, platforms] = await Promise.all([
    getDashboardKpis(),
    getRecentApplications(10),
    getRecentCreators(5),
    getPlatformBreakdown(),
  ]);

  return { kpis, recent, recentCreators, platforms };
}
