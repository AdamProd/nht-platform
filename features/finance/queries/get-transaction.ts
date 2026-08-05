import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import type { FinanceTransactionDetail } from "@/features/finance/types";

const DETAIL_SELECT = `
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

export async function getFinanceTransaction(
  id: string,
): Promise<FinanceTransactionDetail | null> {
  const session = await requireStaffSession();
  if (!session) throw new Error("Unauthorized");

  const supabase = await createClient();
  let query = supabase
    .from("finance_transactions")
    .select(DETAIL_SELECT)
    .eq("id", id);

  if (session.profile.role === "manager") {
    const { data: creators } = await supabase
      .from("creators")
      .select("id")
      .eq("manager_id", session.profile.id);
    const ids = (creators ?? []).map((row) => row.id);
    query = query.or(
      `manager_id.eq.${session.profile.id}${ids.length ? `,creator_id.in.(${ids.join(",")})` : ""}`,
    );
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    console.error("[getFinanceTransaction]", error.message);
    throw new Error("Failed to load transaction.");
  }

  return (data as FinanceTransactionDetail | null) ?? null;
}
