import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import { hasPermission } from "@/features/core/permissions";
import {
  payoutListFiltersSchema,
  type PayoutListFilters,
} from "@/features/finance/payouts/schemas/payout.schema";
import type {
  FinancePayoutListItem,
  FinancePayoutListResult,
} from "@/features/finance/types";

export const PAYOUT_PAGE_SIZE = 20;

const LIST_SELECT = `
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

export async function listFinancePayouts(
  raw: Partial<PayoutListFilters> | Record<string, string | undefined>,
): Promise<FinancePayoutListResult> {
  const session = await requireStaffSession();
  if (!session) throw new Error("Unauthorized");
  if (!hasPermission(session.profile.role, "finance.read")) {
    throw new Error("Forbidden");
  }

  const filters = payoutListFiltersSchema.parse({
    q: raw.q ?? "",
    status: raw.status || undefined,
    creator: raw.creator || undefined,
    page: raw.page ?? 1,
  });

  const page = filters.page;
  const from = (page - 1) * PAYOUT_PAGE_SIZE;
  const to = from + PAYOUT_PAGE_SIZE - 1;

  const supabase = await createClient();
  let query = supabase
    .from("creator_payouts")
    .select(LIST_SELECT, { count: "exact" })
    .order("requested_at", { ascending: false })
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
        pageSize: PAYOUT_PAGE_SIZE,
        totalPages: 1,
      };
    }
    query = query.in("creator_id", ids);
  }

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.creator) query = query.eq("creator_id", filters.creator);

  if (filters.q) {
    const term = filters.q
      .replaceAll(",", " ")
      .trim()
      .replaceAll("%", "")
      .replaceAll("_", "");
    query = query.or(
      [
        `receipt_number.ilike.%${term}%`,
        `notes.ilike.%${term}%`,
        `rejection_reason.ilike.%${term}%`,
      ].join(","),
    );
  }

  const { data, error, count } = await query;
  if (error) {
    console.error("[listFinancePayouts]", error.message);
    throw new Error("Failed to load payouts.");
  }

  const total = count ?? 0;
  return {
    items: (data ?? []) as FinancePayoutListItem[],
    total,
    page,
    pageSize: PAYOUT_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAYOUT_PAGE_SIZE)),
  };
}
