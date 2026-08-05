import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import { hasPermission } from "@/features/core/permissions";
import type { FinanceChartPoint, FinanceCharts } from "@/features/finance/types";

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

function monthKey(date: string): string {
  return date.slice(0, 7);
}

function lastTwelveMonthLabels(now = new Date()): string[] {
  const labels: string[] = [];
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    labels.push(`${y}-${m}`);
  }
  return labels;
}

function toSeries(
  labels: string[],
  map: Map<string, number>,
): FinanceChartPoint[] {
  return labels.map((label) => ({
    label,
    value: map.get(label) ?? 0,
  }));
}

function emptyCharts(): FinanceCharts {
  const labels = lastTwelveMonthLabels();
  const zeros = toSeries(labels, new Map());
  return {
    revenueByMonth: zeros,
    revenueByPlatform: [],
    revenueByCreator: [],
    agencyProfitByMonth: zeros,
    payoutsByMonth: zeros,
  };
}

export async function getFinanceCharts(): Promise<FinanceCharts> {
  const session = await requireStaffSession();
  if (!session) throw new Error("Unauthorized");
  if (!hasPermission(session.profile.role, "finance.read")) {
    throw new Error("Forbidden");
  }

  const creatorIds = await scopedCreatorIds();
  if (creatorIds && creatorIds.length === 0) {
    return emptyCharts();
  }

  const supabase = await createClient();
  const labels = lastTwelveMonthLabels();
  const rangeStart = `${labels[0]}-01`;

  let txQuery = supabase
    .from("finance_transactions")
    .select(
      "gross_revenue, agency_amount, platform, transaction_date, creator_id",
    )
    .gte("transaction_date", rangeStart);

  if (creatorIds) txQuery = txQuery.in("creator_id", creatorIds);

  let payoutQuery = supabase
    .from("creator_payouts")
    .select("amount, paid_at, status, creator_id")
    .eq("status", "completed")
    .not("paid_at", "is", null)
    .gte("paid_at", `${rangeStart}T00:00:00.000Z`);

  if (creatorIds) payoutQuery = payoutQuery.in("creator_id", creatorIds);

  const [{ data: txRows, error: txError }, { data: payoutRows, error: payoutError }] =
    await Promise.all([txQuery, payoutQuery]);

  if (txError) {
    console.error("[getFinanceCharts.transactions]", txError.message);
    throw new Error("Failed to load finance charts.");
  }
  if (payoutError) {
    console.error("[getFinanceCharts.payouts]", payoutError.message);
    throw new Error("Failed to load finance charts.");
  }

  const revenueByMonthMap = new Map<string, number>();
  const agencyByMonthMap = new Map<string, number>();
  const platformMap = new Map<string, number>();
  const creatorTotals = new Map<string, number>();

  for (const row of txRows ?? []) {
    const key = monthKey(row.transaction_date);
    revenueByMonthMap.set(
      key,
      (revenueByMonthMap.get(key) ?? 0) + Number(row.gross_revenue ?? 0),
    );
    agencyByMonthMap.set(
      key,
      (agencyByMonthMap.get(key) ?? 0) + Number(row.agency_amount ?? 0),
    );

    const platform = row.platform || "other";
    platformMap.set(
      platform,
      (platformMap.get(platform) ?? 0) + Number(row.gross_revenue ?? 0),
    );

    creatorTotals.set(
      row.creator_id,
      (creatorTotals.get(row.creator_id) ?? 0) + Number(row.gross_revenue ?? 0),
    );
  }

  const topCreatorIds = [...creatorTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id]) => id);

  const nameMap = new Map<string, string>();
  if (topCreatorIds.length > 0) {
    const { data: creators } = await supabase
      .from("creators")
      .select("id, display_name")
      .in("id", topCreatorIds);
    for (const creator of creators ?? []) {
      nameMap.set(creator.id, creator.display_name);
    }
  }

  const payoutsByMonthMap = new Map<string, number>();
  for (const row of payoutRows ?? []) {
    if (!row.paid_at) continue;
    const key = monthKey(row.paid_at);
    payoutsByMonthMap.set(
      key,
      (payoutsByMonthMap.get(key) ?? 0) + Number(row.amount ?? 0),
    );
  }

  return {
    revenueByMonth: toSeries(labels, revenueByMonthMap),
    revenueByPlatform: [...platformMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value })),
    revenueByCreator: topCreatorIds.map((id) => ({
      label: nameMap.get(id) ?? id,
      value: creatorTotals.get(id) ?? 0,
    })),
    agencyProfitByMonth: toSeries(labels, agencyByMonthMap),
    payoutsByMonth: toSeries(labels, payoutsByMonthMap),
  };
}
