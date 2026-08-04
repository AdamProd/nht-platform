import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import type { CreatorDetail } from "@/features/creators/types";

const DETAIL_SELECT = `
  *,
  manager:profiles!creators_manager_id_fkey (
    id,
    full_name
  )
`;

export async function getCreator(id: string): Promise<CreatorDetail | null> {
  const session = await requireStaffSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  let query = supabase.from("creators").select(DETAIL_SELECT).eq("id", id);

  if (session.profile.role === "manager") {
    query = query.eq("manager_id", session.profile.id);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("[getCreator]", error.message);
    throw new Error("Failed to load creator.");
  }

  return (data as CreatorDetail | null) ?? null;
}
