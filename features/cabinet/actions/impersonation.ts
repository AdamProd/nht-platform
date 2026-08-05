"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  canImpersonateCreator,
  requireStaffSession,
} from "@/lib/auth";

async function revalidateCabinet() {
  const locale = await getLocale();
  revalidatePath(`/${locale}/creator`);
  revalidatePath(`/${locale}/admin/creators`);
}

export async function startImpersonation(
  creatorId: string,
): Promise<{ success: boolean; error?: string }> {
  const t = await getTranslations("creator.actionErrors");
  const session = await requireStaffSession();
  if (!session || !canImpersonateCreator(session.profile.role)) {
    return { success: false, error: t("forbidden") };
  }

  const supabase = await createClient();
  const { data: creator } = await supabase
    .from("creators")
    .select("id")
    .eq("id", creatorId)
    .maybeSingle();

  if (!creator) {
    return { success: false, error: t("invalid") };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ impersonating_creator_id: creatorId })
    .eq("id", session.profile.id);

  if (error) {
    console.error("[startImpersonation]", error.message);
    return { success: false, error: t("save") };
  }

  await revalidateCabinet();
  const locale = await getLocale();
  redirect({ href: "/creator", locale });
  return { success: true };
}

export async function stopImpersonation(): Promise<void> {
  const session = await requireStaffSession();
  if (!session) return;

  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ impersonating_creator_id: null })
    .eq("id", session.profile.id);

  await revalidateCabinet();
  const locale = await getLocale();
  redirect({ href: "/admin/creators", locale });
}
