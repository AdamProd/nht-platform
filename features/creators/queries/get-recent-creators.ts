import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import type { CreatorListItem } from "@/features/creators/types";

const SELECT = `
  *,
  manager:profiles!creators_manager_id_fkey (
    id,
    full_name
  )
`;

export async function getRecentCreators(
  limit = 5,
): Promise<CreatorListItem[]> {
  const session = await requireStaffSession();
  if (!session) return [];

  const supabase = await createClient();

  let query = supabase
    .from("creators")
    .select(SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (session.profile.role === "manager") {
    query = query.eq("manager_id", session.profile.id);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[getRecentCreators]", error.message);
    throw new Error("Failed to load recent creators.");
  }

  return (data ?? []) as CreatorListItem[];
}

export async function getTopRevenueCreators(
  limit = 5,
): Promise<CreatorListItem[]> {
  const session = await requireStaffSession();
  if (!session) return [];

  const supabase = await createClient();

  let query = supabase
    .from("creators")
    .select(SELECT)
    .order("revenue_current_month", { ascending: false })
    .limit(limit);

  if (session.profile.role === "manager") {
    query = query.eq("manager_id", session.profile.id);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[getTopRevenueCreators]", error.message);
    throw new Error("Failed to load top revenue creators.");
  }

  return (data ?? []) as CreatorListItem[];
}
