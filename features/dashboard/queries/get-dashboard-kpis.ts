import { createClient } from "@/lib/supabase/server";
import type { DashboardKpis } from "@/features/dashboard/types";
import type { ApplicationStatus } from "@/types/database.types";

export async function getDashboardKpis(): Promise<DashboardKpis> {
  const supabase = await createClient();

  async function count(status?: ApplicationStatus): Promise<number> {
    let query = supabase
      .from("applications")
      .select("id", { count: "exact", head: true });

    if (status) {
      query = query.eq("status", status);
    }

    const { count, error } = await query;

    if (error) {
      console.error("[getDashboardKpis]", error.message);
      throw new Error("Failed to load dashboard KPIs.");
    }

    return count ?? 0;
  }

  const [total, newCount, reviewing, active, rejected] = await Promise.all([
    count(),
    count("new"),
    count("reviewing"),
    count("active"),
    count("rejected"),
  ]);

  return {
    total,
    new: newCount,
    reviewing,
    active,
    rejected,
  };
}
