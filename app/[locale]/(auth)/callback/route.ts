import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isCreatorRole, isStaff } from "@/lib/auth";
import { routing } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

function isSafeRelativePath(next: string | null): next is string {
  return Boolean(next && next.startsWith("/") && !next.startsWith("//"));
}

async function defaultPathForSession(
  locale: string,
): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return `/${locale}/login`;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role;

  if (isCreatorRole(role)) {
    return `/${locale}/creator`;
  }

  if (isStaff(role)) {
    return `/${locale}/admin`;
  }

  return `/${locale}`;
}

/**
 * OAuth / magic-link / invite callback — the only Route Handler used for auth.
 */
export async function GET(request: Request, { params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = routing.locales.includes(
    rawLocale as (typeof routing.locales)[number],
  )
    ? rawLocale
    : routing.defaultLocale;

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[auth.callback]", error.message);
      return NextResponse.redirect(
        `${origin}/${locale}/login?error=callback`,
      );
    }
  }

  const next = isSafeRelativePath(nextParam)
    ? nextParam
    : await defaultPathForSession(locale);

  return NextResponse.redirect(`${origin}${next}`);
}
