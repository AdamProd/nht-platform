import type {
  FinanceAgencySummary,
  FinanceCreatorSummary,
} from "@/features/finance/types";
import { formatFinanceMoney } from "@/features/finance/lib/format";

export default function FinanceSummaries({
  creator,
  agency,
  locale,
  labels,
}: {
  creator: FinanceCreatorSummary;
  agency: FinanceAgencySummary;
  locale: string;
  labels: {
    creatorTitle: string;
    agencyTitle: string;
    lifetimeRevenue: string;
    thisMonth: string;
    pendingPayout: string;
    lastPayout: string;
    averageMonthly: string;
    monthlyRevenue: string;
    quarterRevenue: string;
    yearRevenue: string;
    none: string;
  };
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="text-sm font-medium text-white">{labels.creatorTitle}</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <SummaryItem
            label={labels.lifetimeRevenue}
            value={formatFinanceMoney(creator.lifetimeRevenue, locale)}
          />
          <SummaryItem
            label={labels.thisMonth}
            value={formatFinanceMoney(creator.thisMonth, locale)}
          />
          <SummaryItem
            label={labels.pendingPayout}
            value={formatFinanceMoney(creator.pendingPayout, locale)}
          />
          <SummaryItem
            label={labels.lastPayout}
            value={
              creator.lastPayout == null
                ? labels.none
                : formatFinanceMoney(creator.lastPayout, locale)
            }
          />
          <SummaryItem
            label={labels.averageMonthly}
            value={formatFinanceMoney(creator.averageMonthlyRevenue, locale)}
          />
        </dl>
      </section>

      <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="text-sm font-medium text-white">{labels.agencyTitle}</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <SummaryItem
            label={labels.monthlyRevenue}
            value={formatFinanceMoney(agency.monthlyRevenue, locale)}
          />
          <SummaryItem
            label={labels.quarterRevenue}
            value={formatFinanceMoney(agency.quarterRevenue, locale)}
          />
          <SummaryItem
            label={labels.yearRevenue}
            value={formatFinanceMoney(agency.yearRevenue, locale)}
          />
        </dl>
      </section>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-overline text-[var(--nht-text-tertiary)]">{label}</dt>
      <dd className="mt-2 text-sm text-white">{value}</dd>
    </div>
  );
}
