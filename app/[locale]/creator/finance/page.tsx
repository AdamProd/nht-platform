import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { listPayouts, getCabinetCreator } from "@/features/cabinet/queries/cabinet";
import { formatMoney } from "@/features/creators/lib/format";
import { startOfMonth } from "@/features/finance/lib/format";

type Props = { params: Promise<{ locale: string }> };

export default async function CreatorFinancePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("creator.finance");
  const tPayouts = await getTranslations("creator.payouts");
  const { creator } = await getCabinetCreator();
  const { payouts, pending, completed } = await listPayouts();

  const supabase = await createClient();
  const monthStart = startOfMonth();
  const { data: txs } = await supabase
    .from("finance_transactions")
    .select("creator_amount, status, transaction_date")
    .eq("creator_id", creator.id);

  const rows = txs ?? [];
  const lifetimeRevenue = rows
    .filter((row) => row.status !== "cancelled" && row.status !== "disputed")
    .reduce((sum, row) => sum + Number(row.creator_amount ?? 0), 0);
  const currentMonth = rows
    .filter((row) => row.transaction_date >= monthStart)
    .reduce((sum, row) => sum + Number(row.creator_amount ?? 0), 0);
  const currentBalance = Math.max(0, lifetimeRevenue - completed);

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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["balance", currentBalance],
          ["lifetime", lifetimeRevenue],
          ["currentMonth", currentMonth],
          ["pending", pending],
        ].map(([key, value]) => (
          <div
            key={String(key)}
            className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-4"
          >
            <p className="text-overline text-[var(--nht-text-tertiary)]">
              {t(`kpis.${key}`)}
            </p>
            <p className="mt-3 text-2xl font-semibold text-white">
              {formatMoney(Number(value), locale)}
            </p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-white">{t("historyTitle")}</h2>
          <Link
            href="/creator/payouts"
            className="text-xs text-[var(--nht-accent)] hover:underline"
          >
            {t("viewPayouts")}
          </Link>
        </div>

        {payouts.length === 0 ? (
          <div className="rounded-[var(--nht-radius-xl)] border border-dashed border-white/10 px-6 py-12 text-center text-sm text-[var(--nht-text-secondary)]">
            {t("empty")}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[var(--nht-radius-xl)] border border-white/[0.06]">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/[0.06] bg-white/[0.02] text-overline text-[var(--nht-text-tertiary)]">
                <tr>
                  <th className="px-4 py-3 font-medium">{t("table.period")}</th>
                  <th className="px-4 py-3 font-medium">{t("table.amount")}</th>
                  <th className="px-4 py-3 font-medium">{t("table.status")}</th>
                  <th className="px-4 py-3 font-medium">{t("table.paidDate")}</th>
                </tr>
              </thead>
              <tbody>
                {payouts.slice(0, 20).map((payout) => (
                  <tr key={payout.id} className="border-b border-white/[0.04]">
                    <td className="px-4 py-3 text-white">
                      {payout.period_start} → {payout.period_end}
                    </td>
                    <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                      {formatMoney(payout.amount, locale, payout.currency)}
                    </td>
                    <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                      {tPayouts(`status.${payout.status}`)}
                    </td>
                    <td className="px-4 py-3 text-[var(--nht-text-tertiary)]">
                      {payout.paid_at
                        ? new Intl.DateTimeFormat(locale, {
                            dateStyle: "medium",
                          }).format(new Date(payout.paid_at))
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
