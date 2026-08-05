import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import { hasPermission } from "@/features/core/permissions";
import { STAFF_ROLES } from "@/lib/auth/roles";
import type { FinanceManagerOption } from "@/features/finance/types";

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

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, status")
    .in("role", [...STAFF_ROLES])
    .or("status.eq.active,status.is.null")
    .order("full_name", { ascending: true });

  if (error) {
    console.error("[listActiveFinanceManagers]", error.message);
    throw new Error("Failed to load staff.");
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
  const { data } = await supabase
    .from("profiles")
    .select("id, role, status")
    .eq("id", managerId)
    .maybeSingle();

  if (!data) return false;
  if (data.status && data.status !== "active" && data.status !== "invited") {
    return false;
  }
  return hasPermission(data.role, "finance.read");
}
