import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasAllowedRole, isStaff, STAFF_ROLES } from "@/lib/auth/roles";
import {
  canAccessCreatorCabinet,
  canImpersonateCreator,
} from "@/lib/auth/creator";
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
 * Creator cabinet gate. Creators access their linked row.
 * Owner/admin may access while impersonating a creator from CRM.
 * Staff without impersonation are blocked.
 */
export async function requireCreatorCabinet(
  nextPath = "/creator",
): Promise<CreatorCabinetSession> {
  const session = await requireAuth(nextPath);
  const locale = await getLocale();
  const supabase = await createClient();

  const impersonatingId =
    (session.profile as Tables<"profiles"> & {
      impersonating_creator_id?: string | null;
    }).impersonating_creator_id ?? null;

  if (!canAccessCreatorCabinet(session.profile.role, impersonatingId)) {
    // Staff without impersonation belong in admin, not unauthorized.
    if (isStaff(session.profile.role)) {
      redirect({ href: "/admin", locale });
      throw new Error("Forbidden");
    }
    redirect({ href: "/unauthorized", locale });
    throw new Error("Forbidden");
  }

  let creatorQuery = supabase.from("creators").select("*");

  if (session.profile.role === "creator") {
    creatorQuery = creatorQuery.eq("user_id", session.profile.id);
  } else if (canImpersonateCreator(session.profile.role) && impersonatingId) {
    creatorQuery = creatorQuery.eq("id", impersonatingId);
  } else {
    redirect({ href: "/unauthorized", locale });
    throw new Error("Forbidden");
  }

  const { data: creator, error } = await creatorQuery.maybeSingle();

  if (error || !creator) {
    console.error("[requireCreatorCabinet]", error?.message);
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

  const supabase = await createClient();
  let creatorQuery = supabase.from("creators").select("*");

  if (session.profile.role === "creator") {
    creatorQuery = creatorQuery.eq("user_id", session.profile.id);
  } else if (canImpersonateCreator(session.profile.role) && impersonatingId) {
    creatorQuery = creatorQuery.eq("id", impersonatingId);
  } else {
    return null;
  }

  const { data: creator, error } = await creatorQuery.maybeSingle();
  if (error || !creator) return null;

  return {
    ...session,
    creator,
    impersonating:
      canImpersonateCreator(session.profile.role) && Boolean(impersonatingId),
  };
}
