"use server";

import { z } from "zod";
import { getTranslations } from "next-intl/server";
import { requireStaffSession, isStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type CheckCreatorEmailResult =
  | { success: true; available: boolean }
  | { success: false; error: string };

const emailSchema = z.string().trim().email().max(255);

export async function checkCreatorEmail(
  rawEmail: unknown,
): Promise<CheckCreatorEmailResult> {
  const t = await getTranslations("admin.creators.actionErrors");

  try {
    const session = await requireStaffSession();
    if (!session || !isStaff(session.profile.role)) {
      return { success: false, error: t("unauthorized") };
    }

    const parsed = emailSchema.safeParse(rawEmail);
    if (!parsed.success) {
      return { success: false, error: t("invalid") };
    }

    const email = parsed.data.toLowerCase();
    const supabase = await createClient();

    const { data: creator, error: creatorError } = await supabase
      .from("creators")
      .select("id")
      .ilike("email", email)
      .limit(1)
      .maybeSingle();

    if (creatorError) {
      console.error("[checkCreatorEmail.creators]", creatorError.message);
      return { success: false, error: t("save") };
    }

    if (creator) {
      return { success: true, available: false };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .ilike("email", email)
      .limit(1)
      .maybeSingle();

    if (profileError) {
      console.error("[checkCreatorEmail.profiles]", profileError.message);
      return { success: false, error: t("save") };
    }

    if (profile) {
      return { success: true, available: false };
    }

    return { success: true, available: true };
  } catch (error) {
    console.error("[checkCreatorEmail]", error);
    return { success: false, error: t("save") };
  }
}
