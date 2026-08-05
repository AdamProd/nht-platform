import { createClient } from "@/lib/supabase/server";
import type { ActivityLogRow } from "@/features/core/events/types";

export async function listCreatorActivity(
  creatorId: string,
  limit = 30,
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
    .or(
      `related_creator_id.eq.${creatorId},and(entity_type.eq.creator,entity_id.eq.${creatorId})`,
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[listCreatorActivity]", error.message);
    return [];
  }

  return (data ?? []) as ActivityLogRow[];
}
