import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import { hasPermission } from "@/features/core/permissions";
import type { MonthlyReport } from "@/features/finance/types";

function isAdminLike(role: string): boolean {
  return role === "owner" || role === "admin" || role === "finance";
}

async function scopedCreatorIds(): Promise<string[] | null> {
  const session = await requireStaffSession();
  if (!session) throw new Error("Unauthorized");
  if (!hasPermission(session.profile.role, "finance.read")) {
    throw new Error("Forbidden");
  }
  if (isAdminLike(session.profile.role)) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("creators")
    .select("id")
    .eq("manager_id", session.profile.id);
  return (data ?? []).map((row) => row.id);
}

function periodBounds(year: number, month: number): {
  start: string;
  end: string;
  paidAtStart: string;
  paidAtEnd: string;
} {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(year, month, 0);
  const end = `${year}-${String(month).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
  return {
    start,
    end,
    paidAtStart: `${start}T00:00:00.000Z`,
    paidAtEnd: `${end}T23:59:59.999Z`,
  };
}

export async function getMonthlyReport(input: {
  month: number;
  year: number;
  creatorId?: string | null;
  platform?: string | null;
}): Promise<MonthlyReport> {
  const session = await requireStaffSession();
  if (!session) throw new Error("Unauthorized");
  if (!hasPermission(session.profile.role, "finance.read")) {
    throw new Error("Forbidden");
  }

  const month = Math.min(12, Math.max(1, Math.floor(input.month)));
  const year = Math.floor(input.year);
  const creatorId = input.creatorId || null;
  const platform = input.platform || null;
  const { start, end, paidAtStart, paidAtEnd } = periodBounds(year, month);

  const scoped = await scopedCreatorIds();
  if (scoped && scoped.length === 0) {
    return {
      month,
      year,
      creatorId,
      platform,
      revenue: 0,
      commission: 0,
      expenses: 0,
      netProfit: 0,
    };
  }

  if (creatorId && scoped && !scoped.includes(creatorId)) {
    throw new Error("Forbidden");
  }

  const supabase = await createClient();

  let txQuery = supabase
    .from("finance_transactions")
    .select("gross_revenue, agency_amount, creator_amount, status")
    .gte("transaction_date", start)
    .lte("transaction_date", end);

  if (scoped) txQuery = txQuery.in("creator_id", scoped);
  if (creatorId) txQuery = txQuery.eq("creator_id", creatorId);
  if (platform) txQuery = txQuery.eq("platform", platform);

  let payoutQuery = supabase
    .from("creator_payouts")
    .select("amount")
    .eq("status", "completed")
    .gte("paid_at", paidAtStart)
    .lte("paid_at", paidAtEnd);

  if (scoped) payoutQuery = payoutQuery.in("creator_id", scoped);
  if (creatorId) payoutQuery = payoutQuery.eq("creator_id", creatorId);

  const [{ data: txRows, error: txError }, { data: payoutRows, error: payoutError }] =
    await Promise.all([txQuery, payoutQuery]);

  if (txError) {
    console.error("[getMonthlyReport.transactions]", txError.message);
    throw new Error("Failed to load monthly report.");
  }
  if (payoutError) {
    console.error("[getMonthlyReport.payouts]", payoutError.message);
    throw new Error("Failed to load monthly report.");
  }

  const revenue = (txRows ?? []).reduce(
    (sum, row) => sum + Number(row.gross_revenue ?? 0),
    0,
  );
  const commission = (txRows ?? []).reduce(
    (sum, row) => sum + Number(row.agency_amount ?? 0),
    0,
  );
  const expenses = (payoutRows ?? []).reduce(
    (sum, row) => sum + Number(row.amount ?? 0),
    0,
  );

  return {
    month,
    year,
    creatorId,
    platform,
    revenue,
    commission,
    expenses,
    netProfit: commission,
  };
}
