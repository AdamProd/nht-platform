import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasAllowedRole, isStaff, STAFF_ROLES } from "@/lib/auth/roles";
import {
  canAccessCreatorCabinet,
  canImpersonateCreator,
} from "@/lib/auth/creator";
import {
  findCreatorById,
  resolveCreatorForAuthUser,
} from "@/lib/auth/resolve-creator";
import type { Tables, UserRole } from "@/types/database.types";
import type { User } from "@supabase/supabase-js";

export type AuthSession = {
  user: User;
  profile: Tables<"profiles">;
};

export type CreatorCabinetSession = AuthSession & {
  creator: Tables<"creators">;
  impersonating: boolean;
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

/**
 * Creator cabinet gate.
 * Live link: auth user email ↔ creators.email (no creators.user_id).
 * Impersonation only when profiles.impersonating_creator_id is present.
 */
export async function requireCreatorCabinet(
  nextPath = "/creator",
): Promise<CreatorCabinetSession> {
  const session = await requireAuth(nextPath);
  const locale = await getLocale();

  const impersonatingId =
    (session.profile as Tables<"profiles"> & {
      impersonating_creator_id?: string | null;
    }).impersonating_creator_id ?? null;

  if (!canAccessCreatorCabinet(session.profile.role, impersonatingId)) {
    if (isStaff(session.profile.role)) {
      redirect({ href: "/admin", locale });
      throw new Error("Forbidden");
    }
    redirect({ href: "/unauthorized", locale });
    throw new Error("Forbidden");
  }

  let creator: Tables<"creators"> | null = null;

  if (session.profile.role === "creator") {
    creator = await resolveCreatorForAuthUser(
      session.user,
      session.profile.full_name,
    );
  } else if (canImpersonateCreator(session.profile.role) && impersonatingId) {
    creator = await findCreatorById(impersonatingId);
  } else {
    redirect({ href: "/unauthorized", locale });
    throw new Error("Forbidden");
  }

  if (!creator) {
    redirect({ href: "/unauthorized", locale });
    throw new Error("Creator not found");
  }

  return {
    ...session,
    creator,
    impersonating:
      canImpersonateCreator(session.profile.role) && Boolean(impersonatingId),
  };
}

export async function requireCreatorCabinetSession(): Promise<CreatorCabinetSession | null> {
  const session = await getAuthSession();
  if (!session) return null;

  const impersonatingId =
    (session.profile as Tables<"profiles"> & {
      impersonating_creator_id?: string | null;
    }).impersonating_creator_id ?? null;

  if (!canAccessCreatorCabinet(session.profile.role, impersonatingId)) {
    return null;
  }

  let creator: Tables<"creators"> | null = null;

  if (session.profile.role === "creator") {
    creator = await resolveCreatorForAuthUser(
      session.user,
      session.profile.full_name,
    );
  } else if (canImpersonateCreator(session.profile.role) && impersonatingId) {
    creator = await findCreatorById(impersonatingId);
  } else {
    return null;
  }

  if (!creator) return null;

  return {
    ...session,
    creator,
    impersonating:
      canImpersonateCreator(session.profile.role) && Boolean(impersonatingId),
  };
}
