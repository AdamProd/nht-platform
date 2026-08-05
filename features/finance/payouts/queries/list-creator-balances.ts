import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import { hasPermission } from "@/features/core/permissions";
import type { CreatorBalance } from "@/features/finance/types";

export type CreatorBalanceRow = CreatorBalance & {
  creatorId: string;
  creatorName: string;
};

function isAdminLike(role: string): boolean {
  return role === "owner" || role === "admin" || role === "finance";
}

/**
 * Per-creator balances for Finance overview cards.
 * Balance = earned (non-cancelled/disputed creator_amount) − completed payouts.
 */
export async function listCreatorBalances(): Promise<CreatorBalanceRow[]> {
  const session = await requireStaffSession();
  if (!session) throw new Error("Unauthorized");
  if (!hasPermission(session.profile.role, "finance.read")) {
    throw new Error("Forbidden");
  }

  const supabase = await createClient();

  let creatorsQuery = supabase
    .from("creators")
    .select("id, display_name, full_name")
    .order("display_name", { ascending: true });

  if (!isAdminLike(session.profile.role)) {
    creatorsQuery = creatorsQuery.eq("manager_id", session.profile.id);
  }

  const { data: creators, error: creatorsError } = await creatorsQuery;
  if (creatorsError) {
    console.error("[listCreatorBalances.creators]", creatorsError.message);
    throw new Error("Failed to load creator balances.");
  }

  const creatorRows = creators ?? [];
  if (creatorRows.length === 0) return [];

  const ids = creatorRows.map((row) => row.id);

  const [{ data: txRows, error: txError }, { data: payoutRows, error: payoutError }] =
    await Promise.all([
      supabase
        .from("finance_transactions")
        .select("creator_id, creator_amount, status")
        .in("creator_id", ids),
      supabase
        .from("creator_payouts")
        .select("creator_id, amount, status")
        .in("creator_id", ids),
    ]);

  if (txError) {
    console.error("[listCreatorBalances.transactions]", txError.message);
    throw new Error("Failed to load creator balances.");
  }
  if (payoutError) {
    console.error("[listCreatorBalances.payouts]", payoutError.message);
    throw new Error("Failed to load creator balances.");
  }

  const earned = new Map<string, number>();
  const lifetime = new Map<string, number>();
  for (const row of txRows ?? []) {
    const amount = Number(row.creator_amount ?? 0);
    lifetime.set(row.creator_id, (lifetime.get(row.creator_id) ?? 0) + amount);
    if (row.status !== "cancelled" && row.status !== "disputed") {
      earned.set(row.creator_id, (earned.get(row.creator_id) ?? 0) + amount);
    }
  }

  const pending = new Map<string, number>();
  const paid = new Map<string, number>();
  for (const row of payoutRows ?? []) {
    const amount = Number(row.amount ?? 0);
    if (row.status === "pending" || row.status === "processing") {
      pending.set(row.creator_id, (pending.get(row.creator_id) ?? 0) + amount);
    }
    if (row.status === "completed") {
      paid.set(row.creator_id, (paid.get(row.creator_id) ?? 0) + amount);
    }
  }

  return creatorRows.map((creator) => {
    const earnedAmount = earned.get(creator.id) ?? 0;
    const paidAmount = paid.get(creator.id) ?? 0;
    return {
      creatorId: creator.id,
      creatorName: creator.display_name || creator.full_name || creator.id.slice(0, 8),
      currentBalance: earnedAmount - paidAmount,
      pending: pending.get(creator.id) ?? 0,
      paid: paidAmount,
      lifetimeRevenue: lifetime.get(creator.id) ?? 0,
    };
  });
}
