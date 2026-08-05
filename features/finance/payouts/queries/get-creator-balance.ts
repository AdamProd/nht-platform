import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import { hasPermission } from "@/features/core/permissions";
import type { CreatorBalance } from "@/features/finance/types";

/**
 * Balance = sum(creator_amount where status not cancelled/disputed)
 *          - sum(completed creator_payouts).
 */
export async function getCreatorBalance(
  creatorId: string,
): Promise<CreatorBalance> {
  const session = await requireStaffSession();
  if (!session) throw new Error("Unauthorized");
  if (!hasPermission(session.profile.role, "finance.read")) {
    throw new Error("Forbidden");
  }

  const supabase = await createClient();

  const [{ data: txRows, error: txError }, { data: payoutRows, error: payoutError }] =
    await Promise.all([
      supabase
        .from("finance_transactions")
        .select("creator_amount, status")
        .eq("creator_id", creatorId),
      supabase
        .from("creator_payouts")
        .select("amount, status")
        .eq("creator_id", creatorId),
    ]);

  if (txError) {
    console.error("[getCreatorBalance.transactions]", txError.message);
    throw new Error("Failed to load creator balance.");
  }
  if (payoutError) {
    console.error("[getCreatorBalance.payouts]", payoutError.message);
    throw new Error("Failed to load creator balance.");
  }

  const transactions = txRows ?? [];
  const payouts = payoutRows ?? [];

  const earned = transactions
    .filter((row) => row.status !== "cancelled" && row.status !== "disputed")
    .reduce((sum, row) => sum + Number(row.creator_amount ?? 0), 0);

  const pending = payouts
    .filter((row) => row.status === "pending" || row.status === "processing")
    .reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

  const paid = payouts
    .filter((row) => row.status === "completed")
    .reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

  const lifetimeRevenue = transactions.reduce(
    (sum, row) => sum + Number(row.creator_amount ?? 0),
    0,
  );

  return {
    currentBalance: earned - paid,
    pending,
    paid,
    lifetimeRevenue,
  };
}
