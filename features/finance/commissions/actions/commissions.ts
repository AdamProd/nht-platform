"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import { publishEvent } from "@/features/core/events";
import { hasPermission } from "@/features/core/permissions";
import { updateCommissionSettingsSchema } from "@/features/finance/commissions/schemas/commission.schema";
import type { FinanceActionResult } from "@/features/finance/types";

async function revalidateCommissions() {
  const locale = await getLocale();
  revalidatePath(`/${locale}/admin/finance`);
  revalidatePath(`/${locale}/admin`);
}

export async function updateCommissionSettings(
  raw: unknown,
): Promise<FinanceActionResult> {
  const t = await getTranslations("admin.finance.actionErrors");

  try {
    const session = await requireStaffSession();
    if (
      !session ||
      !hasPermission(session.profile.role, "finance.approve")
    ) {
      return { success: false, error: t("unauthorized") };
    }

    const parsed = updateCommissionSettingsSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: t("invalid") };
    }

    const supabase = await createClient();
    const { data: current } = await supabase
      .from("commission_settings")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let settingsId = current?.id ?? null;

    if (current) {
      const { error } = await supabase
        .from("commission_settings")
        .update({
          agency_percent: parsed.data.agency_percent,
          manager_percent: parsed.data.manager_percent,
          referral_percent: parsed.data.referral_percent,
          bonus_percent: parsed.data.bonus_percent,
          updated_by: session.profile.id,
        })
        .eq("id", current.id);

      if (error) {
        console.error("[updateCommissionSettings.update]", error.message);
        return { success: false, error: t("save") };
      }
    } else {
      const { data: created, error } = await supabase
        .from("commission_settings")
        .insert({
          agency_percent: parsed.data.agency_percent,
          manager_percent: parsed.data.manager_percent,
          referral_percent: parsed.data.referral_percent,
          bonus_percent: parsed.data.bonus_percent,
          updated_by: session.profile.id,
        })
        .select("id")
        .single();

      if (error || !created) {
        console.error("[updateCommissionSettings.insert]", error?.message);
        return { success: false, error: t("save") };
      }
      settingsId = created.id;
    }

    const { error: historyError } = await supabase
      .from("commission_history")
      .insert({
        settings_id: settingsId,
        agency_percent: parsed.data.agency_percent,
        manager_percent: parsed.data.manager_percent,
        referral_percent: parsed.data.referral_percent,
        bonus_percent: parsed.data.bonus_percent,
        note: parsed.data.note,
        changed_by: session.profile.id,
      });

    if (historyError) {
      console.error("[updateCommissionSettings.history]", historyError.message);
      return { success: false, error: t("save") };
    }

    await publishEvent({
      type: "finance.balance.updated",
      module: "finance",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: settingsId,
      entityType: "commission_settings",
      link: `/admin/finance`,
      visibility: "staff",
      payload: {
        before: current
          ? {
              agency_percent: current.agency_percent,
              manager_percent: current.manager_percent,
              referral_percent: current.referral_percent,
              bonus_percent: current.bonus_percent,
            }
          : null,
        after: {
          agency_percent: parsed.data.agency_percent,
          manager_percent: parsed.data.manager_percent,
          referral_percent: parsed.data.referral_percent,
          bonus_percent: parsed.data.bonus_percent,
        },
        notifyAdmins: true,
      },
    });

    await revalidateCommissions();
    return { success: true, id: settingsId ?? undefined };
  } catch (error) {
    console.error("[updateCommissionSettings] unexpected:", error);
    return { success: false, error: t("save") };
  }
}
