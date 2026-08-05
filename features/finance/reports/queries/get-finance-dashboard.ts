import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import { hasPermission } from "@/features/core/permissions";
import type {
  FinanceAgencySummary,
  FinanceCreatorOption,
  FinanceCreatorSummary,
  FinanceDashboardKpis,
} from "@/features/finance/types";
import {
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  todayIso,
} from "@/features/finance/lib/format";

function sumField(
  rows: Array<Record<string, unknown>> | null | undefined,
  key: string,
): number {
  return (rows ?? []).reduce((sum, row) => sum + Number(row[key] ?? 0), 0);
}

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

export async function getFinanceDashboardKpis(): Promise<FinanceDashboardKpis> {
  const session = await requireStaffSession();
  if (!session) throw new Error("Unauthorized");
  if (!hasPermission(session.profile.role, "finance.read")) {
    throw new Error("Forbidden");
  }

  const supabase = await createClient();
  const creatorIds = await scopedCreatorIds();
  const today = todayIso();
  const weekStart = startOfWeek();
  const monthStart = startOfMonth();
  const yearStart = startOfYear();

  let base = supabase
    .from("finance_transactions")
    .select(
      "gross_revenue, agency_amount, creator_amount, status, transaction_date, creator_id",
    );

  if (creatorIds) {
    if (creatorIds.length === 0) {
      return emptyKpis();
    }
    base = base.in("creator_id", creatorIds);
  }

  const { data, error } = await base;
  if (error) {
    console.error("[getFinanceDashboardKpis]", error.message);
    throw new Error("Failed to load finance KPIs.");
  }

  const rows = data ?? [];
  const paidThisMonth = rows
    .filter(
      (row) =>
        row.status === "paid" &&
        row.transaction_date >= monthStart &&
        row.transaction_date <= today,
    )
    .reduce((sum, row) => sum + Number(row.creator_amount ?? 0), 0);

  let creatorsQuery = supabase
    .from("creators")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");
  if (creatorIds) creatorsQuery = creatorsQuery.in("id", creatorIds);
  const { count: activeCreators } = await creatorsQuery;

  return {
    totalRevenue: sumField(rows, "gross_revenue"),
    agencyRevenue: sumField(rows, "agency_amount"),
    creatorRevenue: sumField(rows, "creator_amount"),
    pendingPayouts: rows
      .filter((row) => row.status === "pending" || row.status === "approved")
      .reduce((sum, row) => sum + Number(row.creator_amount ?? 0), 0),
    paidThisMonth,
    activeCreators: activeCreators ?? 0,
    revenueToday: rows
      .filter((row) => row.transaction_date === today)
      .reduce((sum, row) => sum + Number(row.gross_revenue ?? 0), 0),
    revenueThisWeek: rows
      .filter((row) => row.transaction_date >= weekStart)
      .reduce((sum, row) => sum + Number(row.gross_revenue ?? 0), 0),
    revenueThisMonth: rows
      .filter((row) => row.transaction_date >= monthStart)
      .reduce((sum, row) => sum + Number(row.gross_revenue ?? 0), 0),
    revenueThisYear: rows
      .filter((row) => row.transaction_date >= yearStart)
      .reduce((sum, row) => sum + Number(row.gross_revenue ?? 0), 0),
    countPending: rows.filter((row) => row.status === "pending").length,
    countApproved: rows.filter((row) => row.status === "approved").length,
    countRejected: rows.filter(
      (row) => row.status === "cancelled" || row.status === "disputed",
    ).length,
    countPaid: rows.filter((row) => row.status === "paid").length,
  };
}

function emptyKpis(): FinanceDashboardKpis {
  return {
    totalRevenue: 0,
    agencyRevenue: 0,
    creatorRevenue: 0,
    pendingPayouts: 0,
    paidThisMonth: 0,
    activeCreators: 0,
    revenueToday: 0,
    revenueThisWeek: 0,
    revenueThisMonth: 0,
    revenueThisYear: 0,
    countPending: 0,
    countApproved: 0,
    countRejected: 0,
    countPaid: 0,
  };
}

export async function getFinanceSummaries(): Promise<{
  creator: FinanceCreatorSummary;
  agency: FinanceAgencySummary;
}> {
  const session = await requireStaffSession();
  if (!session) throw new Error("Unauthorized");
  if (!hasPermission(session.profile.role, "finance.read")) {
    throw new Error("Forbidden");
  }

  const supabase = await createClient();
  const creatorIds = await scopedCreatorIds();
  const monthStart = startOfMonth();
  const quarterStart = startOfQuarter();
  const yearStart = startOfYear();

  let query = supabase
    .from("finance_transactions")
    .select(
      "gross_revenue, agency_amount, creator_amount, status, transaction_date",
    );

  if (creatorIds) {
    if (creatorIds.length === 0) {
      return {
        creator: {
          lifetimeRevenue: 0,
          thisMonth: 0,
          pendingPayout: 0,
          lastPayout: null,
          averageMonthlyRevenue: 0,
        },
        agency: {
          monthlyRevenue: 0,
          quarterRevenue: 0,
          yearRevenue: 0,
        },
      };
    }
    query = query.in("creator_id", creatorIds);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[getFinanceSummaries]", error.message);
    throw new Error("Failed to load finance summaries.");
  }

  const rows = data ?? [];
  const paid = rows
    .filter((row) => row.status === "paid")
    .sort((a, b) => b.transaction_date.localeCompare(a.transaction_date));

  const months = new Set(rows.map((row) => row.transaction_date.slice(0, 7)));
  const lifetime = sumField(rows, "creator_amount");

  return {
    creator: {
      lifetimeRevenue: lifetime,
      thisMonth: rows
        .filter((row) => row.transaction_date >= monthStart)
        .reduce((sum, row) => sum + Number(row.creator_amount ?? 0), 0),
      pendingPayout: rows
        .filter((row) => row.status === "pending" || row.status === "approved")
        .reduce((sum, row) => sum + Number(row.creator_amount ?? 0), 0),
      lastPayout: paid[0] ? Number(paid[0].creator_amount) : null,
      averageMonthlyRevenue: months.size > 0 ? lifetime / months.size : 0,
    },
    agency: {
      monthlyRevenue: rows
        .filter((row) => row.transaction_date >= monthStart)
        .reduce((sum, row) => sum + Number(row.agency_amount ?? 0), 0),
      quarterRevenue: rows
        .filter((row) => row.transaction_date >= quarterStart)
        .reduce((sum, row) => sum + Number(row.agency_amount ?? 0), 0),
      yearRevenue: rows
        .filter((row) => row.transaction_date >= yearStart)
        .reduce((sum, row) => sum + Number(row.agency_amount ?? 0), 0),
    },
  };
}

export async function listFinanceCreators(): Promise<FinanceCreatorOption[]> {
  const session = await requireStaffSession();
  if (!session) throw new Error("Unauthorized");
  if (!hasPermission(session.profile.role, "finance.read")) {
    throw new Error("Forbidden");
  }

  const supabase = await createClient();
  let query = supabase
    .from("creators")
    .select("id, display_name, full_name, manager_id")
    .order("display_name", { ascending: true });

  if (!isAdminLike(session.profile.role)) {
    query = query.eq("manager_id", session.profile.id);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[listFinanceCreators]", error.message);
    throw new Error("Failed to load creators.");
  }

  return (data ?? []) as FinanceCreatorOption[];
}
