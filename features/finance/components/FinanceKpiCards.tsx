import type { FinanceDashboardKpis } from "@/features/finance/types";
import { formatFinanceMoney } from "@/features/finance/lib/format";

type Labels = {
  totalRevenue: string;
  agencyRevenue: string;
  creatorRevenue: string;
  pendingPayouts: string;
  paidThisMonth: string;
  activeCreators: string;
  revenueToday: string;
  revenueThisMonth: string;
  revenueThisYear: string;
};

export default function FinanceKpiCards({
  kpis,
  locale,
  labels,
}: {
  kpis: FinanceDashboardKpis;
  locale: string;
  labels: Labels;
}) {
  const cards: Array<{ key: keyof Labels; value: string }> = [
    { key: "totalRevenue", value: formatFinanceMoney(kpis.totalRevenue, locale) },
    { key: "agencyRevenue", value: formatFinanceMoney(kpis.agencyRevenue, locale) },
    { key: "creatorRevenue", value: formatFinanceMoney(kpis.creatorRevenue, locale) },
    {
      key: "pendingPayouts",
      value: formatFinanceMoney(kpis.pendingPayouts, locale),
    },
    {
      key: "paidThisMonth",
      value: formatFinanceMoney(kpis.paidThisMonth, locale),
    },
    { key: "activeCreators", value: String(kpis.activeCreators) },
    { key: "revenueToday", value: formatFinanceMoney(kpis.revenueToday, locale) },
    {
      key: "revenueThisMonth",
      value: formatFinanceMoney(kpis.revenueThisMonth, locale),
    },
    {
      key: "revenueThisYear",
      value: formatFinanceMoney(kpis.revenueThisYear, locale),
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.key}
          className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] px-4 py-3"
        >
          <p className="text-overline text-[var(--nht-text-tertiary)]">
            {labels[card.key]}
          </p>
          <p className="mt-2 text-xl font-semibold text-white">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
