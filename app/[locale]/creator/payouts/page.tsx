import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { listPayouts } from "@/features/cabinet/queries/cabinet";
import { formatMoney } from "@/features/creators/lib/format";

type Props = { params: Promise<{ locale: string }> };

export default async function CreatorPayoutsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("creator.payouts");
  const { payouts, pending, completed } = await listPayouts();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-overline text-[var(--nht-gold)]">{t("label")}</p>
        <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-[var(--nht-text-secondary)]">
          {t("description")}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-overline text-[var(--nht-text-tertiary)]">
            {t("summary.pending")}
          </p>
          <p className="mt-3 text-2xl font-semibold text-white">
            {formatMoney(pending, locale)}
          </p>
        </div>
        <div className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-overline text-[var(--nht-text-tertiary)]">
            {t("summary.completed")}
          </p>
          <p className="mt-3 text-2xl font-semibold text-white">
            {formatMoney(completed, locale)}
          </p>
        </div>
      </div>

      {payouts.length === 0 ? (
        <div className="rounded-[var(--nht-radius-xl)] border border-dashed border-white/[0.1] px-6 py-16 text-center text-sm text-[var(--nht-text-secondary)]">
          {t("empty")}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[var(--nht-radius-xl)] border border-white/[0.06]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/[0.06] bg-white/[0.02]">
              <tr className="text-overline text-[var(--nht-text-tertiary)]">
                <th className="px-4 py-3 font-medium">{t("table.period")}</th>
                <th className="px-4 py-3 font-medium">{t("table.amount")}</th>
                <th className="px-4 py-3 font-medium">{t("table.status")}</th>
                <th className="px-4 py-3 font-medium">{t("table.method")}</th>
                <th className="px-4 py-3 font-medium">{t("table.paidDate")}</th>
                <th className="px-4 py-3 font-medium">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr key={payout.id} className="border-b border-white/[0.04]">
                  <td className="px-4 py-3 text-white">
                    {payout.period_start} → {payout.period_end}
                  </td>
                  <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                    {formatMoney(payout.amount, locale, payout.currency)}
                  </td>
                  <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                    {t(`status.${payout.status}`)}
                  </td>
                  <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                    {t(`method.${payout.method}`)}
                  </td>
                  <td className="px-4 py-3 text-[var(--nht-text-tertiary)]">
                    {payout.paid_at
                      ? new Intl.DateTimeFormat(locale, {
                          dateStyle: "medium",
                        }).format(new Date(payout.paid_at))
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/creator/payouts/${payout.id}/receipt`}
                      className="text-xs text-[var(--nht-gold)] hover:text-white"
                    >
                      {t("actions.exportPdf")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
