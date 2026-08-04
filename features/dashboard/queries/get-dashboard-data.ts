import { getDashboardKpis } from "@/features/dashboard/queries/get-dashboard-kpis";
import { getRecentApplications } from "@/features/dashboard/queries/get-recent-applications";
import { getPlatformBreakdown } from "@/features/dashboard/queries/get-platform-breakdown";
import type { DashboardData } from "@/features/dashboard/types";

export async function getDashboardData(): Promise<DashboardData> {
  const [kpis, recent, platforms] = await Promise.all([
    getDashboardKpis(),
    getRecentApplications(10),
    getPlatformBreakdown(),
  ]);

  return { kpis, recent, platforms };
}
