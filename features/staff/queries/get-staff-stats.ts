import { createClient } from "@/lib/supabase/server";
import { requireStaffSession, isAdminOrAbove } from "@/lib/auth";
import type { StaffStats } from "@/features/staff/types";
import { STAFF_EMPLOYEE_ROLES } from "@/features/staff/types";

export async function getStaffStats(): Promise<StaffStats> {
  const session = await requireStaffSession();
  if (!session) throw new Error("Unauthorized");

  if (!isAdminOrAbove(session.profile.role)) {
    return {
      employees: 1,
      managers: session.profile.role === "manager" ? 1 : 0,
      creators: 0,
      departments: session.profile.department ? 1 : 0,
      activeToday: 0,
    };
  }

  const supabase = await createClient();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [employees, managers, creators, profiles, activeToday] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .in("role", [...STAFF_EMPLOYEE_ROLES]),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "manager"),
      supabase.from("creators").select("id", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("department")
        .in("role", [...STAFF_EMPLOYEE_ROLES])
        .not("department", "is", null),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .in("role", [...STAFF_EMPLOYEE_ROLES])
        .gte("last_login_at", startOfDay.toISOString()),
    ]);

  const departments = new Set(
    (profiles.data ?? [])
      .map((row) => row.department)
      .filter(Boolean),
  );

  return {
    employees: employees.count ?? 0,
    managers: managers.count ?? 0,
    creators: creators.count ?? 0,
    departments: departments.size,
    activeToday: activeToday.count ?? 0,
  };
}
