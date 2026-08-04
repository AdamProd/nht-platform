"use server";

import { getLocale } from "next-intl/server";
import { z } from "zod";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { isStaff } from "@/lib/auth/roles";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
  next: z.string().optional(),
});

export type LoginState =
  | { ok: true }
  | { ok: false; error: string };

function safeNextPath(next: string | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/admin";
  }
  return next;
}

export async function loginAction(
  _prev: LoginState | null,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || "/admin",
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid email or password." };
  }

  const { email, password, next } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[auth.login]", error.message);
    return { ok: false, error: "Invalid email or password." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Unable to establish a session." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !isStaff(profile.role)) {
    await supabase.auth.signOut();
    return {
      ok: false,
      error: "This account does not have admin access.",
    };
  }

  const locale = await getLocale();
  redirect({ href: safeNextPath(next), locale });
  return { ok: true };
}
