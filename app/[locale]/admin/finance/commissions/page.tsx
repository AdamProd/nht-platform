import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireStaff } from "@/lib/auth";
import { hasPermission } from "@/features/core/permissions";
import { redirect } from "@/i18n/navigation";
import { getCommissionSettings } from "@/features/finance/commissions";
import FinanceTabs from "@/features/finance/components/FinanceTabs";
import CommissionSettingsForm from "@/features/finance/commissions/components/CommissionSettingsForm";
import ErrorState from "@/shared/ui/ErrorState";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminFinanceCommissionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireStaff();
  const t = await getTranslations("admin.finance");

  if (!hasPermission(session.profile.role, "finance.read")) {
    redirect({ href: "/admin", locale });
  }

  let loadError: string | null = null;
  let settings = null;
  let history: Awaited<ReturnType<typeof getCommissionSettings>>["history"] = [];

  try {
    const result = await getCommissionSettings();
    settings = result.settings;
    history = result.history;
  } catch (error) {
    console.error(error);
    loadError = t("errors.load");
  }

  const canEdit =
    hasPermission(session.profile.role, "finance.update") &&
    (session.profile.role === "owner" ||
      session.profile.role === "admin" ||
      session.profile.role === "finance");

  return (
    <div className="space-y-8">
      <div>
        <p className="text-overline text-[var(--nht-gold)]">{t("label")}</p>
        <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          {t("commissions.title")}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-[var(--nht-text-secondary)]">
          {t("commissions.description")}
        </p>
      </div>

      <FinanceTabs
        active="commissions"
        labels={{
          overview: t("tabs.overview"),
          transactions: t("tabs.transactions"),
          payouts: t("tabs.payouts"),
          reports: t("tabs.reports"),
          commissions: t("tabs.commissions"),
        }}
      />

      {loadError ? (
        <ErrorState title={loadError} retryHref="/admin/finance/commissions" />
      ) : (
        <CommissionSettingsForm
          settings={settings}
          history={history}
          canEdit={canEdit}
          locale={locale}
          labels={{
            agency: t("commissions.agency"),
            manager: t("commissions.manager"),
            referral: t("commissions.referral"),
            bonus: t("commissions.bonus"),
            note: t("commissions.note"),
            save: t("commissions.save"),
            saving: t("commissions.saving"),
            history: t("commissions.history"),
            emptyHistory: t("commissions.emptyHistory"),
            by: t("commissions.by"),
            error: t("actionErrors.save"),
          }}
        />
      )}
    </div>
  );
}
