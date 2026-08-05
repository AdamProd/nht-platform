"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import { isAdminOrAbove } from "@/lib/auth/roles";
import { publishEvent } from "@/features/events";
import { hasPermission } from "@/features/staff/permissions";
import { assertActiveStaffAssignee } from "@/features/finance/queries/list-finance-managers";
import {
  createTransactionSchema,
  deleteTransactionSchema,
  updateFinanceNotesSchema,
  updateFinanceStatusSchema,
  updateTransactionSchema,
} from "@/features/finance/schemas/finance.schema";
import type { FinanceActionResult } from "@/features/finance/types";
import type { TablesInsert, TablesUpdate } from "@/types/database.types";

const LARGE_PAYOUT_THRESHOLD = 5000;

async function revalidateFinance(id?: string) {
  const locale = await getLocale();
  revalidatePath(`/${locale}/admin/finance`);
  revalidatePath(`/${locale}/admin`);
  if (id) revalidatePath(`/${locale}/admin/finance/${id}`);
}

async function assertCreatorAccess(
  creatorId: string,
): Promise<FinanceActionResult | null> {
  const session = await requireStaffSession();
  const t = await getTranslations("admin.finance.actionErrors");
  if (!session) return { success: false, error: t("unauthorized") };

  if (isAdminOrAbove(session.profile.role)) {
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

function isLargePayout(amount: number | null | undefined): boolean {
  return Number(amount ?? 0) >= LARGE_PAYOUT_THRESHOLD;
}

export async function createTransaction(
  raw: unknown,
): Promise<FinanceActionResult> {
  const t = await getTranslations("admin.finance.actionErrors");

  try {
    const session = await requireStaffSession();
    if (!session || !hasPermission(session.profile.role, "finance.create")) {
      return { success: false, error: t("unauthorized") };
    }

    const parsed = createTransactionSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: t("invalid") };
    }

    let managerId = parsed.data.manager_id;
    if (!isAdminOrAbove(session.profile.role)) {
      managerId = session.profile.id;
      const denied = await assertCreatorAccess(parsed.data.creator_id);
      if (denied) return denied;
    }

    if (!(await assertActiveStaffAssignee(managerId))) {
      return { success: false, error: t("invalidManager") };
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

    const large = isLargePayout(parsed.data.creator_amount);
    const payload = {
      amount: parsed.data.creator_amount,
      gross: parsed.data.gross_revenue,
      currency: parsed.data.currency,
      status: parsed.data.status,
      managerId,
      manager_id: managerId,
      creatorId: parsed.data.creator_id,
      largePayout: large,
      notifyOwners: large,
      notifyAdmins: parsed.data.status === "pending",
    };

    await publishEvent({
      type: "finance.transaction.created",
      module: "finance",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: data.id,
      relatedCreatorId: parsed.data.creator_id,
      link: `/admin/finance/${data.id}`,
      payload,
    });

    if (parsed.data.status === "pending" || parsed.data.status === "approved") {
      await publishEvent({
        type: "finance.payout.created",
        module: "finance",
        actorId: session.profile.id,
        actorRole: session.profile.role,
        targetId: data.id,
        relatedCreatorId: parsed.data.creator_id,
        link: `/admin/finance/${data.id}`,
        payload: {
          ...payload,
          notifyAdmins: parsed.data.status === "pending",
        },
      });
    }

    if (managerId) {
      await publishEvent({
        type: "finance.transaction.assigned",
        module: "finance",
        actorId: session.profile.id,
        actorRole: session.profile.role,
        targetId: data.id,
        relatedCreatorId: parsed.data.creator_id,
        link: `/admin/finance/${data.id}`,
        payload,
      });
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
    if (!session || !hasPermission(session.profile.role, "finance.update")) {
      return { success: false, error: t("unauthorized") };
    }

    const parsed = updateTransactionSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: t("invalid") };
    }

    const denied = await assertCreatorAccess(parsed.data.creator_id);
    if (denied) return denied;

    const canAssign = isAdminOrAbove(session.profile.role);

    const managerId = canAssign
      ? parsed.data.manager_id
      : session.profile.id;

    if (!(await assertActiveStaffAssignee(managerId))) {
      return { success: false, error: t("invalidManager") };
    }

    const supabase = await createClient();
    const { data: before } = await supabase
      .from("finance_transactions")
      .select("*")
      .eq("id", parsed.data.id)
      .maybeSingle();

    if (!before) return { success: false, error: t("invalid") };

    const patch: TablesUpdate<"finance_transactions"> = {
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
      payment_method: parsed.data.payment_method,
      reference_id: parsed.data.reference_id,
      notes: parsed.data.notes,
    };

    const { error } = await supabase
      .from("finance_transactions")
      .update(patch)
      .eq("id", parsed.data.id);

    if (error) {
      console.error("[updateTransaction]", error.message);
      return { success: false, error: t("save") };
    }

    const payload = {
      before: {
        amount: before.creator_amount,
        gross: before.gross_revenue,
        agency_percent: before.agency_percent,
        manager_id: before.manager_id,
      },
      after: {
        amount: parsed.data.creator_amount,
        gross: parsed.data.gross_revenue,
        agency_percent: parsed.data.agency_percent,
        manager_id: managerId,
      },
      managerId,
      manager_id: managerId,
      creatorId: parsed.data.creator_id,
      largePayout: isLargePayout(parsed.data.creator_amount),
      notifyOwners: isLargePayout(parsed.data.creator_amount),
    };

    await publishEvent({
      type: "finance.transaction.updated",
      module: "finance",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: parsed.data.id,
      relatedCreatorId: parsed.data.creator_id,
      link: `/admin/finance/${parsed.data.id}`,
      payload,
    });

    if (before.manager_id !== managerId) {
      await publishEvent({
        type: "finance.transaction.assigned",
        module: "finance",
        actorId: session.profile.id,
        actorRole: session.profile.role,
        targetId: parsed.data.id,
        relatedCreatorId: parsed.data.creator_id,
        link: `/admin/finance/${parsed.data.id}`,
        payload,
      });
    }

    await publishEvent({
      type: "finance.payout.updated",
      module: "finance",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: parsed.data.id,
      relatedCreatorId: parsed.data.creator_id,
      link: `/admin/finance/${parsed.data.id}`,
      payload,
    });

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
    if (!session || !hasPermission(session.profile.role, "finance.update")) {
      return { success: false, error: t("unauthorized") };
    }

    if (
      parsed.data.status === "paid" &&
      !hasPermission(session.profile.role, "finance.approve")
    ) {
      return { success: false, error: t("forbidden") };
    }

    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("finance_transactions")
      .select("*")
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

    const payload = {
      status: parsed.data.status,
      previousStatus: existing.status,
      amount: existing.creator_amount,
      managerId: existing.manager_id,
      manager_id: existing.manager_id,
      creatorId: existing.creator_id,
      before: { status: existing.status },
      after: { status: parsed.data.status },
      notifyAdmins: parsed.data.status === "pending",
    };

    await publishEvent({
      type: "finance.transaction.status_changed",
      module: "finance",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: parsed.data.id,
      relatedCreatorId: existing.creator_id,
      link: `/admin/finance/${parsed.data.id}`,
      payload,
    });

    if (parsed.data.status === "paid") {
      await publishEvent({
        type: "finance.payout.paid",
        module: "finance",
        actorId: session.profile.id,
        actorRole: session.profile.role,
        targetId: parsed.data.id,
        relatedCreatorId: existing.creator_id,
        link: `/admin/finance/${parsed.data.id}`,
        payload,
      });
    } else if (parsed.data.status === "cancelled") {
      await publishEvent({
        type: "finance.payout.cancelled",
        module: "finance",
        actorId: session.profile.id,
        actorRole: session.profile.role,
        targetId: parsed.data.id,
        relatedCreatorId: existing.creator_id,
        link: `/admin/finance/${parsed.data.id}`,
        payload,
      });
    } else if (parsed.data.status === "approved" || parsed.data.status === "pending") {
      await publishEvent({
        type: "finance.payout.updated",
        module: "finance",
        actorId: session.profile.id,
        actorRole: session.profile.role,
        targetId: parsed.data.id,
        relatedCreatorId: existing.creator_id,
        link: `/admin/finance/${parsed.data.id}`,
        payload: {
          ...payload,
          notifyAdmins: parsed.data.status === "pending",
        },
      });
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
    if (!session || !hasPermission(session.profile.role, "finance.update")) {
      return { success: false, error: t("unauthorized") };
    }

    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("finance_transactions")
      .select("id, creator_id, notes, manager_id")
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

    await publishEvent({
      type: "finance.transaction.updated",
      module: "finance",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: parsed.data.id,
      relatedCreatorId: existing.creator_id,
      link: `/admin/finance/${parsed.data.id}`,
      payload: {
        before: { notes: existing.notes },
        after: { notes: parsed.data.notes },
        managerId: existing.manager_id,
        manager_id: existing.manager_id,
        creatorId: existing.creator_id,
      },
    });

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
    if (!session || !hasPermission(session.profile.role, "finance.delete")) {
      return { success: false, error: t("ownerOnly") };
    }

    const parsed = deleteTransactionSchema.safeParse({
      id: formData.get("id"),
    });
    if (!parsed.success) {
      return { success: false, error: t("invalid") };
    }

    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("finance_transactions")
      .select("id, creator_id, creator_amount, manager_id, status")
      .eq("id", parsed.data.id)
      .maybeSingle();

    const { error } = await supabase
      .from("finance_transactions")
      .delete()
      .eq("id", parsed.data.id);

    if (error) {
      console.error("[deleteTransaction]", error.message);
      return { success: false, error: t("delete") };
    }

    await publishEvent({
      type: "finance.transaction.deleted",
      module: "finance",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: parsed.data.id,
      relatedCreatorId: existing?.creator_id,
      visibility: "staff",
      payload: {
        before: existing,
        amount: existing?.creator_amount,
        status: existing?.status,
        managerId: existing?.manager_id,
        creatorId: existing?.creator_id,
      },
    });

    await revalidateFinance();
    return { success: true };
  } catch (error) {
    console.error("[deleteTransaction]", error);
    return { success: false, error: t("delete") };
  }
}
