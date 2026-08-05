import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";
import { canAccessCreatorCabinet, isCreatorRole } from "@/lib/auth/creator";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/database.types";

const handleI18nRouting = createMiddleware(routing);

function getLocaleFromPathname(pathname: string): string {
  const segment = pathname.split("/")[1];
  if (
    segment &&
    routing.locales.includes(segment as (typeof routing.locales)[number])
  ) {
    return segment;
  }
  return routing.defaultLocale;
}

function isAdminPath(pathname: string): boolean {
  return routing.locales.some(
    (locale) =>
      pathname === `/${locale}/admin` ||
      pathname.startsWith(`/${locale}/admin/`),
  );
}

function isCreatorPath(pathname: string): boolean {
  return routing.locales.some(
    (locale) =>
      pathname === `/${locale}/creator` ||
      pathname.startsWith(`/${locale}/creator/`),
  );
}

function isLoginPath(pathname: string): boolean {
  return routing.locales.some(
    (locale) =>
      pathname === `/${locale}/login` ||
      pathname.startsWith(`/${locale}/login/`),
  );
}

function isUnauthorizedPath(pathname: string): boolean {
  return routing.locales.some(
    (locale) =>
      pathname === `/${locale}/unauthorized` ||
      pathname.startsWith(`/${locale}/unauthorized/`),
  );
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value);
  });
}

function redirectWithCookies(
  request: NextRequest,
  source: NextResponse,
  pathname: string,
  search = "",
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = search;
  const redirectResponse = NextResponse.redirect(url);
  copyCookies(source, redirectResponse);
  return redirectResponse;
}

export default async function proxy(request: NextRequest) {
  const intlResponse = handleI18nRouting(request);
  const {
    response,
    user,
    role,
    isStaff: staff,
    impersonatingCreatorId,
  } = await updateSession(request, intlResponse);

  const { pathname } = request.nextUrl;
  const locale = getLocaleFromPathname(pathname);

  if (isAdminPath(pathname)) {
    if (!user) {
      return redirectWithCookies(
        request,
        response,
        `/${locale}/login`,
        `?next=${encodeURIComponent(pathname)}`,
      );
    }
    if (!staff) {
      return redirectWithCookies(
        request,
        response,
        `/${locale}/unauthorized`,
      );
    }
  }

  if (isCreatorPath(pathname)) {
    if (!user) {
      return redirectWithCookies(
        request,
        response,
        `/${locale}/login`,
        `?next=${encodeURIComponent(pathname)}`,
      );
    }
    if (!canAccessCreatorCabinet(role, impersonatingCreatorId)) {
      // Staff without active impersonation belong in admin, not on a 403 page.
      if (staff) {
        return redirectWithCookies(request, response, `/${locale}/admin`);
      }
      return redirectWithCookies(
        request,
        response,
        `/${locale}/unauthorized`,
      );
    }

    // First-login profile completion gate (skip onboarding itself)
    const isOnboarding =
      pathname === `/${locale}/creator/onboarding` ||
      pathname.startsWith(`/${locale}/creator/onboarding/`);

    if (!isOnboarding && role === "creator" && hasSupabaseEnv()) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createServerClient<Database>(url, anonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {},
        },
      });
      const { data: creator } = await supabase
        .from("creators")
        .select("profile_completed_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (creator && !creator.profile_completed_at) {
        return redirectWithCookies(
          request,
          response,
          `/${locale}/creator/onboarding`,
        );
      }
    }
  }

  if (isLoginPath(pathname) && user) {
    if (staff) {
      return redirectWithCookies(request, response, `/${locale}/admin`);
    }
    if (isCreatorRole(role)) {
      return redirectWithCookies(request, response, `/${locale}/creator`);
    }
  }

  if (isUnauthorizedPath(pathname) && !user) {
    return redirectWithCookies(request, response, `/${locale}/login`);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
