import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { logoutAction } from "@/features/auth";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function UnauthorizedPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.unauthorized");

  return (
    <div className="relative flex min-h-full items-center justify-center px-6 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,var(--nht-gold-subtle),transparent_60%)]" />
      <div className="glass-strong premium-border relative w-full max-w-md rounded-[var(--nht-radius-3xl)] p-8 text-center sm:p-10">
        <p className="text-overline text-[var(--nht-gold)]">403</p>
        <h1 className="mt-4 text-2xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-3 text-sm text-[var(--nht-text-secondary)]">
          {t("description")}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-full border border-white/10 px-5 py-3 text-sm text-white hover:bg-white/[0.05]"
          >
            {t("home")}
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="gold-gradient-bg w-full rounded-full px-5 py-3 text-sm font-semibold text-[#090909] sm:w-auto"
            >
              {t("signOut")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
