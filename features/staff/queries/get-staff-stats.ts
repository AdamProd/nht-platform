import { createClient } from "@/lib/supabase/server";
import { requireStaffSession, isAdminOrAbove } from "@/lib/auth";
import type { StaffStats } from "@/features/staff/types";
import { STAFF_EMPLOYEE_ROLES } from "@/features/staff/types";
import type { UserRole } from "@/types/database.types";
import { isSchemaDriftError } from "@/shared/utils";

const LEGACY_STAFF_ROLES: readonly UserRole[] = [
  "owner",
  "admin",
  "manager",
] as const;

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

  try {
    return await loadStats([...STAFF_EMPLOYEE_ROLES], true);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("[getStaffStats] schema drift, legacy fallback:", message);
    try {
      return await loadStats([...LEGACY_STAFF_ROLES], false);
    } catch (fallbackError) {
      console.error("[getStaffStats.fallback]", fallbackError);
      return {
        employees: 0,
        managers: 0,
        creators: 0,
        departments: 0,
        activeToday: 0,
      };
    }
  }
}

async function loadStats(
  roles: UserRole[],
  withStaffColumns: boolean,
): Promise<StaffStats> {
  const supabase = await createClient();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const employeesQ = supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .in("role", roles);
  const managersQ = supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "manager");
  const creatorsQ = supabase
    .from("creators")
    .select("id", { count: "exact", head: true });

  if (!withStaffColumns) {
    const [employees, managers, creators] = await Promise.all([
      employeesQ,
      managersQ,
      creatorsQ,
    ]);
    for (const result of [employees, managers, creators]) {
      if (result.error) throw new Error(result.error.message);
    }
    return {
      employees: employees.count ?? 0,
      managers: managers.count ?? 0,
      creators: creators.count ?? 0,
      departments: 0,
      activeToday: 0,
    };
  }

  const [employees, managers, creators, profiles, activeToday] =
    await Promise.all([
      employeesQ,
      managersQ,
      creatorsQ,
      supabase
        .from("profiles")
        .select("department")
        .in("role", roles)
        .not("department", "is", null),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .in("role", roles)
        .gte("last_login_at", startOfDay.toISOString()),
    ]);

  for (const result of [employees, managers, creators, profiles, activeToday]) {
    if (result.error) {
      if (isSchemaDriftError(result.error.message)) {
        throw new Error(result.error.message);
      }
      console.error("[getStaffStats]", result.error.message);
    }
  }

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
