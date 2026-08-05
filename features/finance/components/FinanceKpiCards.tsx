import type { FinanceDashboardKpis } from "@/features/finance/types";
import MoneyCell from "@/features/finance/components/MoneyCell";

type Labels = {
  totalRevenue: string;
  agencyRevenue: string;
  creatorRevenue: string;
  pendingPayouts: string;
  paidThisMonth: string;
  activeCreators: string;
  revenueToday: string;
  revenueThisWeek: string;
  revenueThisMonth: string;
  revenueThisYear: string;
  countPending: string;
  countApproved: string;
  countRejected: string;
  countPaid: string;
};

/** Revenue / status summary cards (RevenueCard pattern). */
export default function FinanceKpiCards({
  kpis,
  locale,
  labels,
}: {
  kpis: FinanceDashboardKpis;
  locale: string;
  labels: Labels;
}) {
  const moneyCards: Array<{ key: keyof Labels; value: number }> = [
    { key: "totalRevenue", value: kpis.totalRevenue },
    { key: "agencyRevenue", value: kpis.agencyRevenue },
    { key: "creatorRevenue", value: kpis.creatorRevenue },
    { key: "pendingPayouts", value: kpis.pendingPayouts },
    { key: "paidThisMonth", value: kpis.paidThisMonth },
    { key: "revenueToday", value: kpis.revenueToday },
    { key: "revenueThisWeek", value: kpis.revenueThisWeek },
    { key: "revenueThisMonth", value: kpis.revenueThisMonth },
    { key: "revenueThisYear", value: kpis.revenueThisYear },
  ];

  const countCards: Array<{ key: keyof Labels; value: number }> = [
    { key: "activeCreators", value: kpis.activeCreators },
    { key: "countPending", value: kpis.countPending },
    { key: "countApproved", value: kpis.countApproved },
    { key: "countRejected", value: kpis.countRejected },
    { key: "countPaid", value: kpis.countPaid },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {moneyCards.map((card) => (
        <div
          key={card.key}
          className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] px-4 py-3"
        >
          <p className="text-overline text-[var(--nht-text-tertiary)]">
            {labels[card.key]}
          </p>
          <p className="mt-2 text-xl font-semibold text-white">
            <MoneyCell value={card.value} locale={locale} />
          </p>
        </div>
      ))}
      {countCards.map((card) => (
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
