"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import { isAdminOrAbove } from "@/lib/auth/roles";
import { publishEvent } from "@/features/core/events";
import { hasPermission } from "@/features/core/permissions";
import {
  approvePayoutSchema,
  createPayoutRequestSchema,
  payPayoutSchema,
  rejectPayoutSchema,
} from "@/features/finance/payouts/schemas/payout.schema";
import type { FinanceActionResult } from "@/features/finance/types";
import type { TablesInsert, TablesUpdate } from "@/types/database.types";

async function revalidatePayouts(id?: string, creatorId?: string) {
  const locale = await getLocale();
  revalidatePath(`/${locale}/admin/finance`);
  revalidatePath(`/${locale}/admin`);
  if (id) revalidatePath(`/${locale}/admin/finance/${id}`);
  if (creatorId) {
    revalidatePath(`/${locale}/admin/creators/${creatorId}`);
    revalidatePath(`/${locale}/creator/payouts`);
  }
}

async function assertCreatorAccess(
  creatorId: string,
): Promise<FinanceActionResult | null> {
  const session = await requireStaffSession();
  const t = await getTranslations("admin.finance.actionErrors");
  if (!session) return { success: false, error: t("unauthorized") };

  if (isAdminOrAbove(session.profile.role) || session.profile.role === "finance") {
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

async function loadCreatorManagerId(
  creatorId: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("creators")
    .select("manager_id")
    .eq("id", creatorId)
    .maybeSingle();
  return data?.manager_id ?? null;
}

export async function createPayoutRequest(
  raw: unknown,
): Promise<FinanceActionResult> {
  const t = await getTranslations("admin.finance.actionErrors");

  try {
    const session = await requireStaffSession();
    if (!session || !hasPermission(session.profile.role, "finance.create")) {
      return { success: false, error: t("unauthorized") };
    }

    const parsed = createPayoutRequestSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: t("invalid") };
    }

    const denied = await assertCreatorAccess(parsed.data.creator_id);
    if (denied) return denied;

    const row: TablesInsert<"creator_payouts"> = {
      creator_id: parsed.data.creator_id,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      method: parsed.data.method,
      period_start: parsed.data.period_start,
      period_end: parsed.data.period_end,
      notes: parsed.data.notes,
      status: "pending",
      requested_at: new Date().toISOString(),
    };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("creator_payouts")
      .insert(row)
      .select("id")
      .single();

    if (error || !data) {
      console.error("[createPayoutRequest]", error?.message);
      return { success: false, error: t("create") };
    }

    const managerId = await loadCreatorManagerId(parsed.data.creator_id);
    const payload = {
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      status: "pending",
      managerId,
      manager_id: managerId,
      creatorId: parsed.data.creator_id,
      notifyAdmins: true,
    };

    await publishEvent({
      type: "finance.payout.requested",
      module: "finance",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: data.id,
      entityType: "creator_payout",
      relatedCreatorId: parsed.data.creator_id,
      link: `/admin/finance`,
      payload,
    });

    await publishEvent({
      type: "finance.balance.updated",
      module: "finance",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: data.id,
      entityType: "creator_payout",
      relatedCreatorId: parsed.data.creator_id,
      link: `/admin/finance`,
      payload,
    });

    await revalidatePayouts(data.id, parsed.data.creator_id);
    return { success: true, id: data.id };
  } catch (error) {
    console.error("[createPayoutRequest] unexpected:", error);
    return { success: false, error: t("create") };
  }
}

export async function approvePayout(
  raw: unknown,
): Promise<FinanceActionResult> {
  const t = await getTranslations("admin.finance.actionErrors");

  try {
    const session = await requireStaffSession();
    if (!session || !hasPermission(session.profile.role, "finance.approve")) {
      return { success: false, error: t("unauthorized") };
    }

    const parsed = approvePayoutSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: t("invalid") };
    }

    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("creator_payouts")
      .select("*")
      .eq("id", parsed.data.id)
      .maybeSingle();

    if (!existing) return { success: false, error: t("invalid") };
    if (existing.status !== "pending") {
      return { success: false, error: t("invalidStatus") };
    }

    const denied = await assertCreatorAccess(existing.creator_id);
    if (denied) return denied;

    const now = new Date().toISOString();
    const patch: TablesUpdate<"creator_payouts"> = {
      status: "processing",
      approved_at: now,
      approved_by: session.profile.id,
      rejected_at: null,
      rejected_by: null,
      rejection_reason: null,
    };
    if (parsed.data.notes !== undefined) {
      patch.notes = parsed.data.notes;
    }

    const { error } = await supabase
      .from("creator_payouts")
      .update(patch)
      .eq("id", parsed.data.id);

    if (error) {
      console.error("[approvePayout]", error.message);
      return { success: false, error: t("save") };
    }

    const managerId = await loadCreatorManagerId(existing.creator_id);
    const payload = {
      amount: existing.amount,
      currency: existing.currency,
      status: "processing",
      previousStatus: existing.status,
      managerId,
      manager_id: managerId,
      creatorId: existing.creator_id,
      notifyAdmins: true,
    };

    await publishEvent({
      type: "finance.payout.approved",
      module: "finance",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: parsed.data.id,
      entityType: "creator_payout",
      relatedCreatorId: existing.creator_id,
      link: `/admin/finance`,
      payload,
    });

    await revalidatePayouts(parsed.data.id, existing.creator_id);
    return { success: true, id: parsed.data.id };
  } catch (error) {
    console.error("[approvePayout] unexpected:", error);
    return { success: false, error: t("save") };
  }
}

export async function rejectPayout(
  raw: unknown,
): Promise<FinanceActionResult> {
  const t = await getTranslations("admin.finance.actionErrors");

  try {
    const session = await requireStaffSession();
    if (!session || !hasPermission(session.profile.role, "finance.approve")) {
      return { success: false, error: t("unauthorized") };
    }

    const parsed = rejectPayoutSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: t("invalid") };
    }

    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("creator_payouts")
      .select("*")
      .eq("id", parsed.data.id)
      .maybeSingle();

    if (!existing) return { success: false, error: t("invalid") };
    if (existing.status !== "pending" && existing.status !== "processing") {
      return { success: false, error: t("invalidStatus") };
    }

    const denied = await assertCreatorAccess(existing.creator_id);
    if (denied) return denied;

    const now = new Date().toISOString();
    const { error } = await supabase
      .from("creator_payouts")
      .update({
        status: "failed",
        rejected_at: now,
        rejected_by: session.profile.id,
        rejection_reason: parsed.data.rejection_reason,
      })
      .eq("id", parsed.data.id);

    if (error) {
      console.error("[rejectPayout]", error.message);
      return { success: false, error: t("save") };
    }

    const managerId = await loadCreatorManagerId(existing.creator_id);
    const payload = {
      amount: existing.amount,
      currency: existing.currency,
      status: "failed",
      previousStatus: existing.status,
      rejection_reason: parsed.data.rejection_reason,
      managerId,
      manager_id: managerId,
      creatorId: existing.creator_id,
      notifyAdmins: true,
    };

    await publishEvent({
      type: "finance.payout.rejected",
      module: "finance",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: parsed.data.id,
      entityType: "creator_payout",
      relatedCreatorId: existing.creator_id,
      link: `/admin/finance`,
      payload,
    });

    await publishEvent({
      type: "finance.balance.updated",
      module: "finance",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: parsed.data.id,
      entityType: "creator_payout",
      relatedCreatorId: existing.creator_id,
      link: `/admin/finance`,
      payload,
    });

    await revalidatePayouts(parsed.data.id, existing.creator_id);
    return { success: true, id: parsed.data.id };
  } catch (error) {
    console.error("[rejectPayout] unexpected:", error);
    return { success: false, error: t("save") };
  }
}

export async function payPayout(raw: unknown): Promise<FinanceActionResult> {
  const t = await getTranslations("admin.finance.actionErrors");

  try {
    const session = await requireStaffSession();
    if (!session || !hasPermission(session.profile.role, "finance.approve")) {
      return { success: false, error: t("unauthorized") };
    }

    const parsed = payPayoutSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: t("invalid") };
    }

    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("creator_payouts")
      .select("*")
      .eq("id", parsed.data.id)
      .maybeSingle();

    if (!existing) return { success: false, error: t("invalid") };
    if (existing.status !== "processing" && existing.status !== "pending") {
      return { success: false, error: t("invalidStatus") };
    }

    const denied = await assertCreatorAccess(existing.creator_id);
    if (denied) return denied;

    const now = new Date().toISOString();
    const patch: TablesUpdate<"creator_payouts"> = {
      status: "completed",
      paid_at: now,
      approved_at: existing.approved_at ?? now,
      approved_by: existing.approved_by ?? session.profile.id,
    };
    if (parsed.data.receipt_number !== undefined) {
      patch.receipt_number = parsed.data.receipt_number;
    }

    const { error } = await supabase
      .from("creator_payouts")
      .update(patch)
      .eq("id", parsed.data.id);

    if (error) {
      console.error("[payPayout]", error.message);
      return { success: false, error: t("save") };
    }

    const managerId = await loadCreatorManagerId(existing.creator_id);
    const payload = {
      amount: existing.amount,
      currency: existing.currency,
      status: "completed",
      previousStatus: existing.status,
      managerId,
      manager_id: managerId,
      creatorId: existing.creator_id,
      notifyAdmins: true,
    };

    await publishEvent({
      type: "finance.payout.paid",
      module: "finance",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: parsed.data.id,
      entityType: "creator_payout",
      relatedCreatorId: existing.creator_id,
      link: `/admin/finance`,
      payload,
    });

    await publishEvent({
      type: "finance.balance.updated",
      module: "finance",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: parsed.data.id,
      entityType: "creator_payout",
      relatedCreatorId: existing.creator_id,
      link: `/admin/finance`,
      payload,
    });

    await revalidatePayouts(parsed.data.id, existing.creator_id);
    return { success: true, id: parsed.data.id };
  } catch (error) {
    console.error("[payPayout] unexpected:", error);
    return { success: false, error: t("save") };
  }
}
