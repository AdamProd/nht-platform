import { createClient } from "@/lib/supabase/server";
import type { ApplicationDetail } from "@/features/applications/types";

export async function getApplication(
  id: string,
): Promise<ApplicationDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      *,
      manager:profiles!applications_assigned_manager_fkey (
        id,
        full_name
      )
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getApplication]", error.message);
    throw new Error("Failed to load application.");
  }

  return (data as ApplicationDetail | null) ?? null;
}
