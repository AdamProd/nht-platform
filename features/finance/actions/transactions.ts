"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import { isOwner } from "@/lib/auth/roles";
import {
  createTransactionSchema,
  deleteTransactionSchema,
  updateFinanceNotesSchema,
  updateFinanceStatusSchema,
  updateTransactionSchema,
} from "@/features/finance/schemas/finance.schema";
import type { FinanceActionResult } from "@/features/finance/types";
import type { TablesInsert, TablesUpdate } from "@/types/database.types";

async function revalidateFinance(id?: string) {
  const locale = await getLocale();
  revalidatePath(`/${locale}/admin/finance`);
  revalidatePath(`/${locale}/admin`);
  if (id) revalidatePath(`/${locale}/admin/finance/${id}`);
}

async function assertCreatorAccess(creatorId: string): Promise<FinanceActionResult | null> {
  const session = await requireStaffSession();
  const t = await getTranslations("admin.finance.actionErrors");
  if (!session) return { success: false, error: t("unauthorized") };

  if (session.profile.role === "owner" || session.profile.role === "admin") {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("creators")
    .select("id, manager_id")
    .eq("id", creatorId)
    .maybeSingle();

  if (!data || data.manager_id !== session.profile.id) {
    return { success: false, error: t("forbidden") };
  }

  return null;
}

export async function createTransaction(
  raw: unknown,
): Promise<FinanceActionResult> {
  const t = await getTranslations("admin.finance.actionErrors");

  try {
    const session = await requireStaffSession();
    if (!session || !["owner", "admin", "manager"].includes(session.profile.role)) {
      return { success: false, error: t("unauthorized") };
    }

    const parsed = createTransactionSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: t("invalid") };
    }

    let managerId = parsed.data.manager_id;
    if (session.profile.role === "manager") {
      managerId = session.profile.id;
      const denied = await assertCreatorAccess(parsed.data.creator_id);
      if (denied) return denied;
    }

    const row: TablesInsert<"finance_transactions"> = {
      creator_id: parsed.data.creator_id,
      manager_id: managerId,
      platform: parsed.data.platform,
      transaction_date: parsed.data.transaction_date,
      gross_revenue: parsed.data.gross_revenue,
      currency: parsed.data.currency,
      agency_percent: parsed.data.agency_percent,
      agency_amount: parsed.data.agency_amount,
      creator_percent: parsed.data.creator_percent,
      creator_amount: parsed.data.creator_amount,
      status: parsed.data.status,
      payment_method: parsed.data.payment_method,
      reference_id: parsed.data.reference_id,
      notes: parsed.data.notes,
      created_by: session.profile.id,
    };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("finance_transactions")
      .insert(row)
      .select("id")
      .single();

    if (error || !data) {
      console.error("[createTransaction]", error?.message);
      return { success: false, error: t("create") };
    }

    await revalidateFinance(data.id);
    return { success: true, id: data.id };
  } catch (error) {
    console.error("[createTransaction] unexpected:", error);
    return { success: false, error: t("create") };
  }
}

export async function updateTransaction(
  raw: unknown,
): Promise<FinanceActionResult> {
  const t = await getTranslations("admin.finance.actionErrors");

  try {
    const session = await requireStaffSession();
    if (!session) return { success: false, error: t("unauthorized") };

    const parsed = updateTransactionSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: t("invalid") };
    }

    const denied = await assertCreatorAccess(parsed.data.creator_id);
    if (denied) return denied;

    const patch: TablesUpdate<"finance_transactions"> = {
      creator_id: parsed.data.creator_id,
      manager_id:
        session.profile.role === "manager"
          ? session.profile.id
          : parsed.data.manager_id,
      platform: parsed.data.platform,
      transaction_date: parsed.data.transaction_date,
      gross_revenue: parsed.data.gross_revenue,
      currency: parsed.data.currency,
      agency_percent: parsed.data.agency_percent,
      agency_amount: parsed.data.agency_amount,
      creator_percent: parsed.data.creator_percent,
      creator_amount: parsed.data.creator_amount,
      payment_method: parsed.data.payment_method,
      reference_id: parsed.data.reference_id,
      notes: parsed.data.notes,
    };

    const supabase = await createClient();
    const { error } = await supabase
      .from("finance_transactions")
      .update(patch)
      .eq("id", parsed.data.id);

    if (error) {
      console.error("[updateTransaction]", error.message);
      return { success: false, error: t("save") };
    }

    await revalidateFinance(parsed.data.id);
    return { success: true, id: parsed.data.id };
  } catch (error) {
    console.error("[updateTransaction] unexpected:", error);
    return { success: false, error: t("save") };
  }
}

export async function updateFinanceStatus(
  formData: FormData,
): Promise<FinanceActionResult> {
  const t = await getTranslations("admin.finance.actionErrors");

  try {
    const parsed = updateFinanceStatusSchema.safeParse({
      id: formData.get("id"),
      status: formData.get("status"),
    });
    if (!parsed.success) {
      return { success: false, error: t("invalidStatus") };
    }

    const session = await requireStaffSession();
    if (!session) return { success: false, error: t("unauthorized") };

    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("finance_transactions")
      .select("id, creator_id")
      .eq("id", parsed.data.id)
      .maybeSingle();

    if (!existing) return { success: false, error: t("invalid") };
    const denied = await assertCreatorAccess(existing.creator_id);
    if (denied) return denied;

    const { error } = await supabase
      .from("finance_transactions")
      .update({ status: parsed.data.status })
      .eq("id", parsed.data.id);

    if (error) {
      console.error("[updateFinanceStatus]", error.message);
      return { success: false, error: t("save") };
    }

    await revalidateFinance(parsed.data.id);
    return { success: true, id: parsed.data.id };
  } catch (error) {
    console.error("[updateFinanceStatus]", error);
    return { success: false, error: t("save") };
  }
}

export async function updateFinanceNotes(
  formData: FormData,
): Promise<FinanceActionResult> {
  const t = await getTranslations("admin.finance.actionErrors");

  try {
    const parsed = updateFinanceNotesSchema.safeParse({
      id: formData.get("id"),
      notes: formData.get("notes") ?? "",
    });
    if (!parsed.success) {
      return { success: false, error: t("invalidNotes") };
    }

    const session = await requireStaffSession();
    if (!session) return { success: false, error: t("unauthorized") };

    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("finance_transactions")
      .select("id, creator_id")
      .eq("id", parsed.data.id)
      .maybeSingle();

    if (!existing) return { success: false, error: t("invalid") };
    const denied = await assertCreatorAccess(existing.creator_id);
    if (denied) return denied;

    const { error } = await supabase
      .from("finance_transactions")
      .update({ notes: parsed.data.notes })
      .eq("id", parsed.data.id);

    if (error) {
      console.error("[updateFinanceNotes]", error.message);
      return { success: false, error: t("save") };
    }

    await revalidateFinance(parsed.data.id);
    return { success: true, id: parsed.data.id };
  } catch (error) {
    console.error("[updateFinanceNotes]", error);
    return { success: false, error: t("save") };
  }
}

export async function deleteTransaction(
  formData: FormData,
): Promise<FinanceActionResult> {
  const t = await getTranslations("admin.finance.actionErrors");

  try {
    const session = await requireStaffSession();
    if (!session) return { success: false, error: t("unauthorized") };
    if (!isOwner(session.profile.role)) {
      return { success: false, error: t("ownerOnly") };
    }

    const parsed = deleteTransactionSchema.safeParse({
      id: formData.get("id"),
    });
    if (!parsed.success) {
      return { success: false, error: t("invalid") };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("finance_transactions")
      .delete()
      .eq("id", parsed.data.id);

    if (error) {
      console.error("[deleteTransaction]", error.message);
      return { success: false, error: t("delete") };
    }

    await revalidateFinance();
    return { success: true };
  } catch (error) {
    console.error("[deleteTransaction]", error);
    return { success: false, error: t("delete") };
  }
}
