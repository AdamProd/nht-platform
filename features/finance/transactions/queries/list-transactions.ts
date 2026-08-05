import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import { hasPermission } from "@/features/core/permissions";
import {
  financeListFiltersSchema,
  type FinanceListFilters,
} from "@/features/finance/transactions/schemas/finance.schema";
import type {
  FinanceListResult,
  FinanceTransactionListItem,
} from "@/features/finance/types";

export const FINANCE_PAGE_SIZE = 20;

const LIST_SELECT = `
  *,
  creator:creators!finance_transactions_creator_id_fkey (
    id,
    display_name,
    full_name,
    email
  ),
  manager:profiles!finance_transactions_manager_id_fkey (
    id,
    full_name
  )
`;

function isAdminLike(role: string): boolean {
  return role === "owner" || role === "admin" || role === "finance";
}

export async function listFinanceTransactions(
  raw: Partial<FinanceListFilters> | Record<string, string | undefined>,
): Promise<FinanceListResult> {
  const session = await requireStaffSession();
  if (!session) throw new Error("Unauthorized");
  if (!hasPermission(session.profile.role, "finance.read")) {
    throw new Error("Forbidden");
  }

  const filters = financeListFiltersSchema.parse({
    q: raw.q ?? "",
    status: raw.status || undefined,
    platform: raw.platform || undefined,
    creator: raw.creator || undefined,
    manager: raw.manager || undefined,
    from: raw.from ?? "",
    to: raw.to ?? "",
    page: raw.page ?? 1,
  });

  const page = filters.page;
  const from = (page - 1) * FINANCE_PAGE_SIZE;
  const to = from + FINANCE_PAGE_SIZE - 1;

  const supabase = await createClient();
  let query = supabase
    .from("finance_transactions")
    .select(LIST_SELECT, { count: "exact" })
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (!isAdminLike(session.profile.role)) {
    const { data: creators } = await supabase
      .from("creators")
      .select("id")
      .eq("manager_id", session.profile.id);
    const ids = (creators ?? []).map((row) => row.id);
    if (ids.length === 0) {
      return {
        items: [],
        total: 0,
        page,
        pageSize: FINANCE_PAGE_SIZE,
        totalPages: 1,
      };
    }
    query = query.or(
      `manager_id.eq.${session.profile.id},creator_id.in.(${ids.join(",")})`,
    );
  }

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.platform) query = query.eq("platform", filters.platform);
  if (filters.creator) query = query.eq("creator_id", filters.creator);
  if (filters.manager && isAdminLike(session.profile.role)) {
    query = query.eq("manager_id", filters.manager);
  }
  if (filters.from) query = query.gte("transaction_date", filters.from);
  if (filters.to) query = query.lte("transaction_date", filters.to);

  if (filters.q) {
    const term = filters.q
      .replaceAll(",", " ")
      .trim()
      .replaceAll("%", "")
      .replaceAll("_", "");
    query = query.or(
      [
        `platform.ilike.%${term}%`,
        `reference_id.ilike.%${term}%`,
        `notes.ilike.%${term}%`,
      ].join(","),
    );
  }

  const { data, error, count } = await query;
  if (error) {
    console.error("[listFinanceTransactions]", error.message);
    throw new Error("Failed to load transactions.");
  }

  const total = count ?? 0;
  return {
    items: (data ?? []) as FinanceTransactionListItem[],
    total,
    page,
    pageSize: FINANCE_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / FINANCE_PAGE_SIZE)),
  };
}
