"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { z } from "zod";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCreatorRole, isStaff } from "@/lib/auth";
import { publishEvent } from "@/features/events";
import type { UserRole } from "@/types/database.types";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
  next: z.string().optional(),
});

export type LoginState =
  | { ok: true }
  | { ok: false; error: string };

function safeNextPath(next: string | undefined, role: string): string {
  if (role === "guest") {
    return "/";
  }

  const fallback = isCreatorRole(role as never) ? "/creator" : "/admin";

  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }

  if (isCreatorRole(role as never)) {
    if (next === "/creator" || next.startsWith("/creator/")) return next;
    if (next.includes("/auth/set-password")) return next;
    const localeCreator = next.match(
      /^\/(en|ru|de|fr|es|it|pt|pl|cs|uk)(\/creator(?:\/.*)?)$/,
    );
    if (localeCreator) return next;
    return "/creator";
  }

  if (next === "/admin" || next.startsWith("/admin/")) return next;
  const localeAdmin = next.match(
    /^\/(en|ru|de|fr|es|it|pt|pl|cs|uk)(\/admin(?:\/.*)?)$/,
  );
  if (localeAdmin) return next;
  return "/admin";
}

export async function loginAction(
  _prev: LoginState | null,
  formData: FormData,
): Promise<LoginState> {
  const t = await getTranslations("auth.errors");

  try {
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      next: formData.get("next") || "",
    });

    if (!parsed.success) {
      return { ok: false, error: t("invalidCredentials") };
    }

    const { email, password, next } = parsed.data;
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("[auth.login]", error.message);
      return { ok: false, error: t("invalidCredentials") };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, error: t("session") };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("[auth.login.profile]", profileError.message);
      await supabase.auth.signOut();
      return { ok: false, error: t("permissions") };
    }

    const role = (profile?.role ?? "guest") as UserRole;

    if (role === "guest") {
      const locale = await getLocale();
      redirect({ href: "/", locale });
      return { ok: true };
    }

    if (!isStaff(role) && !isCreatorRole(role)) {
      await supabase.auth.signOut();
      return { ok: false, error: t("noAccess") };
    }

    // Touch last login for creators (linked by email — no creators.user_id)
    if (isCreatorRole(role) && user.email) {
      const admin = createAdminClient();
      const creator = await admin
        .from("creators")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();
      if (creator.data?.id) {
        await admin
          .from("creators")
          .update({ last_login_at: new Date().toISOString() })
          .eq("id", creator.data.id);
      }
    }

    if (isStaff(role)) {
      const admin = createAdminClient();
      await admin
        .from("profiles")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", user.id);

      await publishEvent({
        type: "staff.login",
        module: "auth",
        actorId: user.id,
        actorRole: role,
        targetId: user.id,
        entityType: "profile",
        visibility: "owner",
        payload: {
          name: profile?.full_name ?? user.email,
          email: user.email,
          role,
        },
      });
    }

    const locale = await getLocale();
    redirect({ href: safeNextPath(next, role), locale });
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
    console.error("[auth.login] unexpected:", error);
    return { ok: false, error: t("generic") };
  }
}
