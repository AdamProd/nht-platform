"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { z } from "zod";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

const setPasswordSchema = z
  .object({
    password: z.string().min(8).max(128),
    confirm: z.string().min(8).max(128),
  })
  .refine((value) => value.password === value.confirm, {
    message: "mismatch",
    path: ["confirm"],
  });

export type SetPasswordState =
  | { ok: true }
  | { ok: false; error: string };

export async function setPasswordAction(
  _prev: SetPasswordState | null,
  formData: FormData,
): Promise<SetPasswordState> {
  const t = await getTranslations("auth.setPassword");

  try {
    await requireAuth("/auth/set-password");

    const parsed = setPasswordSchema.safeParse({
      password: formData.get("password"),
      confirm: formData.get("confirm"),
    });

    if (!parsed.success) {
      return { ok: false, error: t("errors.invalid") };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });

    if (error) {
      console.error("[setPassword]", error.message);
      return { ok: false, error: t("errors.save") };
    }

    const locale = await getLocale();
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
    console.error("[setPassword] unexpected:", error);
    return { ok: false, error: t("errors.save") };
  }
}
