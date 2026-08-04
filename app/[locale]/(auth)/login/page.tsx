import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/features/auth";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  return (
    <div className="glass-strong premium-border rounded-[var(--nht-radius-3xl)] p-8 sm:p-10">
      <div className="mb-10 text-center">
        <Link
          href="/"
          className="text-overline text-[var(--nht-gold)] transition-colors hover:text-white"
        >
          NHT
        </Link>
        <h1 className="mt-6 text-2xl font-semibold text-white sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-sm text-[var(--nht-text-secondary)]">
          {t("description")}
        </p>
      </div>

      <Suspense
        fallback={
          <div className="h-48 animate-pulse rounded-[var(--nht-radius-lg)] bg-white/[0.03]" />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
