import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import { hasPermission } from "@/features/core/permissions";
import {
  startOfMonth,
  startOfWeek,
} from "@/features/finance/lib/format";

/**
 * Creator-scoped finance summary for future Creator Cabinet consumption.
 * Not exposed on creator routes yet — relationship preparation only.
 */
export async function getCreatorFinanceSummary(creatorId: string): Promise<{
  lifetimeRevenue: number;
  thisMonth: number;
  thisWeek: number;
  pendingPayout: number;
  paidTotal: number;
  transactionCount: number;
}> {
  const session = await requireStaffSession();
  if (!session) throw new Error("Unauthorized");
  if (!hasPermission(session.profile.role, "finance.read")) {
    throw new Error("Forbidden");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("finance_transactions")
    .select("gross_revenue, creator_amount, status, transaction_date")
    .eq("creator_id", creatorId);

  if (error) {
    console.error("[getCreatorFinanceSummary]", error.message);
    throw new Error("Failed to load creator finance.");
  }

  const rows = data ?? [];
  const monthStart = startOfMonth();
  const weekStart = startOfWeek();

  return {
    lifetimeRevenue: rows.reduce(
      (sum, row) => sum + Number(row.creator_amount ?? 0),
      0,
    ),
    thisMonth: rows
      .filter((row) => row.transaction_date >= monthStart)
      .reduce((sum, row) => sum + Number(row.creator_amount ?? 0), 0),
    thisWeek: rows
      .filter((row) => row.transaction_date >= weekStart)
      .reduce((sum, row) => sum + Number(row.creator_amount ?? 0), 0),
    pendingPayout: rows
      .filter((row) => row.status === "pending" || row.status === "approved")
      .reduce((sum, row) => sum + Number(row.creator_amount ?? 0), 0),
    paidTotal: rows
      .filter((row) => row.status === "paid")
      .reduce((sum, row) => sum + Number(row.creator_amount ?? 0), 0),
    transactionCount: rows.length,
  };
}

export async function listCreatorFinanceTransactions(
  creatorId: string,
  limit = 50,
) {
  const session = await requireStaffSession();
  if (!session) throw new Error("Unauthorized");
  if (!hasPermission(session.profile.role, "finance.read")) {
    throw new Error("Forbidden");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("finance_transactions")
    .select("*")
    .eq("creator_id", creatorId)
    .order("transaction_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[listCreatorFinanceTransactions]", error.message);
    throw new Error("Failed to load creator transactions.");
  }

  return data ?? [];
}
