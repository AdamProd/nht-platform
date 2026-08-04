import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasAllowedRole, isStaff, STAFF_ROLES } from "@/lib/auth/roles";
import type { Tables, UserRole } from "@/types/database.types";
import type { User } from "@supabase/supabase-js";

export type AuthSession = {
  user: User;
  profile: Tables<"profiles">;
};

export async function getAuthSession(): Promise<AuthSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) {
    console.error("[auth] Failed to load profile:", error?.message);
    return null;
  }

  return { user, profile };
}

export async function requireAuth(
  nextPath = "/admin",
): Promise<AuthSession> {
  const session = await getAuthSession();

  if (!session) {
    const locale = await getLocale();
    redirect({
      href: `/login?next=${encodeURIComponent(nextPath)}`,
      locale,
    });
    throw new Error("Unauthorized");
  }

  return session;
}

export async function requireRole(
  allowed: readonly UserRole[],
  nextPath = "/admin",
): Promise<AuthSession> {
  const session = await requireAuth(nextPath);

  if (!hasAllowedRole(session.profile.role, allowed)) {
    const locale = await getLocale();
    redirect({ href: "/unauthorized", locale });
    throw new Error("Forbidden");
  }

  return session;
}

/** Staff gate for admin CRM (owner bypass included). */
export async function requireStaff(
  nextPath = "/admin",
): Promise<AuthSession> {
  return requireRole(STAFF_ROLES, nextPath);
}

export async function requireStaffSession(): Promise<AuthSession | null> {
  const session = await getAuthSession();
  if (!session || !isStaff(session.profile.role)) return null;
  return session;
}
