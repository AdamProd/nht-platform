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

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value);
  });
}

export default async function proxy(request: NextRequest) {
  const intlResponse = handleI18nRouting(request);
  const { response, user } = await updateSession(request, intlResponse);

  const { pathname } = request.nextUrl;
  const locale = getLocaleFromPathname(pathname);

  if (isAdminPath(pathname) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${locale}/login`;
    loginUrl.searchParams.set("next", pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    copyCookies(response, redirectResponse);
    return redirectResponse;
  }

  if (isLoginPath(pathname) && user) {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = `/${locale}/admin`;
    adminUrl.search = "";
    const redirectResponse = NextResponse.redirect(adminUrl);
    copyCookies(response, redirectResponse);
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
