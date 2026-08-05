"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { z } from "zod";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireCreatorCabinetSession } from "@/lib/auth";
import { stringArraySchema } from "@/features/creators/schemas/creator.schema";

const completeOnboardingSchema = z.object({
  avatar_url: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .nullable()
    .transform((value) => value || null),
  biography: z
    .string()
    .trim()
    .max(4000)
    .optional()
    .nullable()
    .transform((value) => value || null),
  timezone: z.string().trim().min(1).max(80),
  languages: stringArraySchema,
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .nullable()
    .transform((value) => value || null),
});

export type OnboardingState =
  | { ok: true }
  | { ok: false; error: string };

export async function completeCreatorOnboarding(
  _prev: OnboardingState | null,
  formData: FormData,
): Promise<OnboardingState> {
  const t = await getTranslations("creator.onboarding");

  try {
    const session = await requireCreatorCabinetSession();
    if (!session) {
      return { ok: false, error: t("errors.unauthorized") };
    }

    const parsed = completeOnboardingSchema.safeParse({
      avatar_url: formData.get("avatar_url"),
      biography: formData.get("biography"),
      timezone: formData.get("timezone"),
      languages: String(formData.get("languages") ?? ""),
      phone: formData.get("phone"),
    });

    if (!parsed.success) {
      return { ok: false, error: t("errors.invalid") };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("creators")
      .update({
        avatar_url: parsed.data.avatar_url,
        biography: parsed.data.biography,
        timezone: parsed.data.timezone,
        languages: parsed.data.languages,
        phone: parsed.data.phone,
        profile_completed_at: new Date().toISOString(),
        status:
          session.creator.status === "invited" ? "active" : session.creator.status,
        last_activity_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
      })
      .eq("id", session.creator.id);

    if (error) {
      console.error("[completeCreatorOnboarding]", error.message);
      return { ok: false, error: t("errors.save") };
    }

    const locale = await getLocale();
    revalidatePath(`/${locale}/creator`);
    redirect({ href: "/creator", locale });
    return { ok: true };
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    console.error("[completeCreatorOnboarding] unexpected:", error);
    return { ok: false, error: t("errors.save") };
  }
}
