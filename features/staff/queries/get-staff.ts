import { createClient } from "@/lib/supabase/server";
import { requireStaffSession, isAdminOrAbove } from "@/lib/auth";
import type { StaffDetail } from "@/features/staff/types";

export async function getStaff(id: string): Promise<StaffDetail | null> {
  const session = await requireStaffSession();
  if (!session) return null;

  if (!isAdminOrAbove(session.profile.role) && session.profile.id !== id) {
    return null;
  }

  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getStaff]", error.message);
    return null;
  }
  if (!profile) return null;

  const [creators, applications, tasks] = await Promise.all([
    supabase
      .from("creators")
      .select("id, display_name, status")
      .eq("manager_id", id)
      .order("display_name", { ascending: true })
      .limit(50),
    supabase
      .from("applications")
      .select("id, full_name, status, created_at")
      .eq("assigned_manager", id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("creator_tasks")
      .select("id, title, status, creator_id")
      .eq("manager_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return {
    ...profile,
    managedCreators: creators.data ?? [],
    assignedApplications: applications.data ?? [],
    assignedTasks: tasks.error ? [] : (tasks.data ?? []),
  };
}
