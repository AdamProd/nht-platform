import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

function safeNextPath(next: string | null, locale: string): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return `/${locale}/creator`;
  }
  return next;
}

/**
 * OAuth / magic-link callback — the only Route Handler used for auth.
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
  const next = safeNextPath(searchParams.get("next"), locale);

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

  return NextResponse.redirect(`${origin}${next}`);
}
