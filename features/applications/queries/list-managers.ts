import { createClient } from "@/lib/supabase/server";
import type { StaffManagerOption } from "@/features/applications/types";

/** Staff profiles that can be assigned as application managers. */
export async function listStaffManagers(): Promise<StaffManagerOption[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .in("role", ["owner", "admin", "manager"])
    .order("full_name", { ascending: true });

  if (error) {
    console.error("[listStaffManagers]", error.message);
    throw new Error("Failed to load managers.");
  }

  return data ?? [];
}
