import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import type { Database, UserRole } from "@/types/database.types";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { isStaff } from "@/lib/auth/roles";

export type SessionSnapshot = {
  response: NextResponse;
  user: User | null;
  role: UserRole | null;
  isStaff: boolean;
  impersonatingCreatorId: string | null;
};

/**
 * Refreshes the Supabase auth session and resolves staff role for route guards.
 */
export async function updateSession(
  request: NextRequest,
  response: NextResponse,
): Promise<SessionSnapshot> {
  if (!hasSupabaseEnv()) {
    return {
      response,
      user: null,
      role: null,
      isStaff: false,
      impersonatingCreatorId: null,
    };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      response,
      user: null,
      role: null,
      isStaff: false,
      impersonatingCreatorId: null,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, impersonating_creator_id")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role ?? null;

  return {
    response,
    user,
    role,
    isStaff: isStaff(role),
    impersonatingCreatorId: profile?.impersonating_creator_id ?? null,
  };
}
