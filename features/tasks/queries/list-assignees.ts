import { createClient } from "@/lib/supabase/server";

export type TaskAssigneeOption = {
  id: string;
  full_name: string | null;
};

/** Active staff who can be assigned CRM tasks. */
export async function listTaskAssignees(): Promise<TaskAssigneeOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .neq("role", "creator")
    .neq("role", "guest")
    .in("status", ["active", "invited", "vacation"])
    .order("full_name", { ascending: true });

  if (error) {
    console.error("[listTaskAssignees]", error.message);
    const fallback = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("role", [
        "owner",
        "admin",
        "manager",
        "support",
        "finance",
        "content_manager",
        "moderator",
        "viewer",
      ])
      .order("full_name", { ascending: true });
    if (fallback.error) {
      console.error("[listTaskAssignees.fallback]", fallback.error.message);
      return [];
    }
    return fallback.data ?? [];
  }

  return data ?? [];
}
