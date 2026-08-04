import { createClient } from "@/lib/supabase/server";
import type { DashboardRecentApplication } from "@/features/dashboard/types";

export async function getRecentApplications(
  limit = 10,
): Promise<DashboardRecentApplication[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applications")
    .select("id, full_name, platform, status, priority, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getRecentApplications]", error.message);
    throw new Error("Failed to load recent applications.");
  }

  return data ?? [];
}
