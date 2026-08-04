import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

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
  const { response, user, isStaff: staff } = await updateSession(
    request,
    intlResponse,
  );

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

  // Only staff skip the login screen; creator/guest stay put (no admin loop).
  if (isLoginPath(pathname) && user && staff) {
    return redirectWithCookies(request, response, `/${locale}/admin`);
  }

  // Authenticated non-staff on unauthorized can remain; unauthenticated go login.
  if (isUnauthorizedPath(pathname) && !user) {
    return redirectWithCookies(request, response, `/${locale}/login`);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
