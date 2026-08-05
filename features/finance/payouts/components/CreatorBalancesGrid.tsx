import { Link } from "@/i18n/navigation";
import { formatFinanceMoney } from "@/features/finance/lib/format";
import type { CreatorBalanceRow } from "@/features/finance/payouts/queries/list-creator-balances";

type Props = {
  items: CreatorBalanceRow[];
  locale: string;
  labels: {
    title: string;
    empty: string;
    currentBalance: string;
    pending: string;
    paid: string;
    lifetimeRevenue: string;
  };
};

export default function CreatorBalancesGrid({ items, locale, labels }: Props) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-white">{labels.title}</h2>
      {items.length === 0 ? (
        <p className="rounded-[var(--nht-radius-xl)] border border-dashed border-white/10 px-6 py-10 text-center text-sm text-[var(--nht-text-secondary)]">
          {labels.empty}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.creatorId}
              href={`/admin/creators/${item.creatorId}?tab=finance`}
              className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <p className="truncate text-sm font-medium text-white">
                {item.creatorName}
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-3">
                <BalanceItem
                  label={labels.currentBalance}
                  value={formatFinanceMoney(item.currentBalance, locale)}
                />
                <BalanceItem
                  label={labels.pending}
                  value={formatFinanceMoney(item.pending, locale)}
                />
                <BalanceItem
                  label={labels.paid}
                  value={formatFinanceMoney(item.paid, locale)}
                />
                <BalanceItem
                  label={labels.lifetimeRevenue}
                  value={formatFinanceMoney(item.lifetimeRevenue, locale)}
                />
              </dl>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function BalanceItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-overline text-[var(--nht-text-tertiary)]">{label}</dt>
      <dd className="mt-1 text-sm text-white">{value}</dd>
    </div>
  );
}
