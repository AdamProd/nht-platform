import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import type { CreatorStats } from "@/features/creators/types";

export async function getCreatorStats(): Promise<CreatorStats> {
  const session = await requireStaffSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  let query = supabase
    .from("creators")
    .select("status, revenue_current_month");

  if (session.profile.role === "manager") {
    query = query.eq("manager_id", session.profile.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[getCreatorStats]", error.message);
    throw new Error("Failed to load creator stats.");
  }

  const rows = data ?? [];
  const total = rows.length;
  const active = rows.filter((row) => row.status === "active").length;
  const vacation = rows.filter((row) => row.status === "vacation").length;
  const inactive = rows.filter((row) => row.status === "inactive").length;
  const revenueCurrent = rows.reduce(
    (sum, row) => sum + Number(row.revenue_current_month ?? 0),
    0,
  );
  const revenueAverage = total > 0 ? revenueCurrent / total : 0;

  return {
    total,
    active,
    vacation,
    inactive,
    revenueCurrent,
    revenueAverage,
  };
}
