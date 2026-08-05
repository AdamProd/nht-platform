import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import { hasPermission } from "@/features/core/permissions";
import { STAFF_ROLES } from "@/lib/auth/roles";
import type { FinanceManagerOption } from "@/features/finance/types";
import type { UserRole } from "@/types/database.types";
import { isSchemaDriftError } from "@/shared/utils";

const LEGACY_STAFF_ROLES: readonly UserRole[] = [
  "owner",
  "admin",
  "manager",
] as const;

/**
 * Active staff profiles that can be assigned on finance transactions.
 * Uses Staff Management profiles (not hardcoded role lists in UI).
 */
export async function listActiveFinanceManagers(): Promise<
  FinanceManagerOption[]
> {
  const session = await requireStaffSession();
  if (!session) throw new Error("Unauthorized");
  if (!hasPermission(session.profile.role, "finance.read")) {
    throw new Error("Forbidden");
  }

  try {
    return await loadManagers([...STAFF_ROLES], true);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(
      "[listActiveFinanceManagers] schema drift, legacy fallback:",
      message,
    );
    try {
      return await loadManagers([...LEGACY_STAFF_ROLES], false);
    } catch (fallbackError) {
      console.error("[listActiveFinanceManagers.fallback]", fallbackError);
      return [];
    }
  }
}

async function loadManagers(
  roles: UserRole[],
  withStatus: boolean,
): Promise<FinanceManagerOption[]> {
  const supabase = await createClient();

  if (withStatus) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role, status")
      .in("role", roles)
      .or("status.eq.active,status.is.null")
      .order("full_name", { ascending: true });

    if (error) {
      console.error("[listActiveFinanceManagers]", error.message);
      throw new Error(error.message);
    }

    return (data ?? [])
      .filter((row) => hasPermission(row.role, "finance.read"))
      .map((row) => ({
        id: row.id,
        full_name: row.full_name,
      }));
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .in("role", roles)
    .order("full_name", { ascending: true });

  if (error) {
    console.error("[listActiveFinanceManagers]", error.message);
    throw new Error(error.message);
  }

  return (data ?? [])
    .filter((row) => hasPermission(row.role, "finance.read"))
    .map((row) => ({
      id: row.id,
      full_name: row.full_name,
    }));
}

export async function assertActiveStaffAssignee(
  managerId: string | null | undefined,
): Promise<boolean> {
  if (!managerId) return true;
  const supabase = await createClient();

  const withStatus = await supabase
    .from("profiles")
    .select("id, role, status")
    .eq("id", managerId)
    .maybeSingle();

  if (withStatus.error && isSchemaDriftError(withStatus.error.message)) {
    const legacy = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", managerId)
      .maybeSingle();
    if (!legacy.data) return false;
    return hasPermission(legacy.data.role, "finance.read");
  }

  if (!withStatus.data) return false;
  const status = withStatus.data.status;
  if (status && status !== "active" && status !== "invited") {
    return false;
  }
  return hasPermission(withStatus.data.role, "finance.read");
}
