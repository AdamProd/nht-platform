import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireAuth } from "@/lib/auth";
import SetPasswordForm from "@/features/auth/components/SetPasswordForm";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SetPasswordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAuth(`/${locale}/auth/set-password`);
  const t = await getTranslations("auth.setPassword");

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-[var(--nht-radius-xl)] border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8">
        <p className="text-overline text-[var(--nht-gold)]">{t("label")}</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-3 text-sm text-[var(--nht-text-secondary)]">
          {t("description")}
        </p>
        <SetPasswordForm
          labels={{
            title: t("title"),
            description: t("description"),
            password: t("password"),
            confirm: t("confirm"),
            submit: t("submit"),
            submitting: t("submitting"),
          }}
        />
      </div>
    </div>
  );
}
