import { createClient } from "@/lib/supabase/server";
import type { ActivityLogRow } from "@/features/core/events/types";

export async function listStaffActivity(
  staffId: string,
  limit = 20,
): Promise<ActivityLogRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_logs")
    .select(
      `
      *,
      actor:profiles!activity_logs_actor_id_fkey (
        id,
        full_name,
        avatar_url,
        role
      )
    `,
    )
    .or(`actor_id.eq.${staffId},entity_id.eq.${staffId}`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[listStaffActivity]", error.message);
    return [];
  }

  return (data ?? []) as ActivityLogRow[];
}
