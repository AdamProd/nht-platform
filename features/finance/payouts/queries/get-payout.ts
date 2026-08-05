import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import { hasPermission } from "@/features/core/permissions";
import type { FinancePayoutListItem } from "@/features/finance/types";

const DETAIL_SELECT = `
  *,
  creator:creators!creator_payouts_creator_id_fkey (
    id,
    display_name,
    full_name,
    email,
    manager_id
  )
`;

function isAdminLike(role: string): boolean {
  return role === "owner" || role === "admin" || role === "finance";
}

export async function getFinancePayout(
  id: string,
): Promise<FinancePayoutListItem | null> {
  const session = await requireStaffSession();
  if (!session) throw new Error("Unauthorized");
  if (!hasPermission(session.profile.role, "finance.read")) {
    throw new Error("Forbidden");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("creator_payouts")
    .select(DETAIL_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getFinancePayout]", error.message);
    throw new Error("Failed to load payout.");
  }

  if (!data) return null;

  const payout = data as FinancePayoutListItem;

  if (!isAdminLike(session.profile.role)) {
    const managerId = payout.creator?.manager_id;
    if (managerId !== session.profile.id) {
      throw new Error("Forbidden");
    }
  }

  return payout;
}
