import { requireStaffSession } from "@/lib/auth";
import { getDashboardKpis } from "@/features/dashboard/queries/get-dashboard-kpis";
import { getRecentApplications } from "@/features/dashboard/queries/get-recent-applications";
import { getPlatformBreakdown } from "@/features/dashboard/queries/get-platform-breakdown";
import {
  getRecentCreators,
  getTopRevenueCreators,
} from "@/features/creators/queries/get-recent-creators";
import { getDashboardTaskStats } from "@/features/tasks/queries/get-task-stats";
import type { DashboardData } from "@/features/dashboard/types";

export async function getDashboardData(): Promise<DashboardData> {
  const session = await requireStaffSession();
  const userId = session?.profile.id ?? "";

  const [
    kpis,
    recent,
    newestCreators,
    topRevenueCreators,
    platforms,
    tasks,
  ] = await Promise.all([
    getDashboardKpis(),
    getRecentApplications(10),
    getRecentCreators(5),
    getTopRevenueCreators(5),
    getPlatformBreakdown(),
    userId
      ? getDashboardTaskStats(userId)
      : Promise.resolve({
          openTasks: 0,
          myTasks: 0,
          overdue: 0,
          completedToday: 0,
        }),
  ]);

  return {
    kpis,
    recent,
    newestCreators,
    topRevenueCreators,
    latestRegistrations: newestCreators,
    recentCreators: newestCreators,
    platforms,
    tasks,
  };
}
