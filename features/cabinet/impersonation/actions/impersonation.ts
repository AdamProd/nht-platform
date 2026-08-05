"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import {
  canImpersonateCreator,
  requireStaffSession,
} from "@/lib/auth";

async function revalidateCabinet() {
  const locale = await getLocale();
  revalidatePath(`/${locale}/creator`);
  revalidatePath(`/${locale}/admin/creators`);
}

/**
 * Live profiles has no impersonating_creator_id — cannot persist impersonation.
 */
export async function startImpersonation(
  creatorId: string,
): Promise<{ success: boolean; error?: string }> {
  const t = await getTranslations("creator.actionErrors");
  const session = await requireStaffSession();
  if (!session || !canImpersonateCreator(session.profile.role)) {
    return { success: false, error: t("forbidden") };
  }

  void creatorId;
  console.warn(
    "[startImpersonation] profiles.impersonating_creator_id missing on live schema",
  );
  return { success: false, error: t("save") };
}

export async function stopImpersonation(): Promise<void> {
  const session = await requireStaffSession();
  if (!session) return;

  await revalidateCabinet();
  const locale = await getLocale();
  redirect({ href: "/admin/creators", locale });
}
