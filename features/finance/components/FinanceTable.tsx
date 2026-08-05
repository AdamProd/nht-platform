import { Link } from "@/i18n/navigation";
import type {
  FinancePlatform,
  FinanceTransactionListItem,
  FinanceTransactionStatus,
} from "@/features/finance/types";
import { formatFinanceDate } from "@/features/finance/lib/format";
import FinanceStatusBadge from "@/features/finance/components/FinanceStatusBadge";
import MoneyCell from "@/features/finance/components/MoneyCell";

type Props = {
  items: FinanceTransactionListItem[];
  locale: string;
  labels: {
    date: string;
    creator: string;
    platform: string;
    gross: string;
    agencyPercent: string;
    agencyAmount: string;
    creatorPercent: string;
    creatorAmount: string;
    status: string;
    manager: string;
    actions: string;
    view: string;
    empty: string;
    unassigned: string;
  };
  statusLabels: Record<FinanceTransactionStatus, string>;
  platformLabels: Record<string, string>;
};

export default function FinanceTable({
  items,
  locale,
  labels,
  statusLabels,
  platformLabels,
}: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-[var(--nht-radius-xl)] border border-dashed border-white/[0.08] bg-white/[0.02] px-5 py-12 text-center text-sm text-[var(--nht-text-secondary)]">
        {labels.empty}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[var(--nht-radius-xl)] border border-white/[0.06]">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-white/[0.06] bg-white/[0.02] text-overline text-[var(--nht-text-tertiary)]">
          <tr>
            <th className="px-4 py-3 font-medium">{labels.date}</th>
            <th className="px-4 py-3 font-medium">{labels.creator}</th>
            <th className="px-4 py-3 font-medium">{labels.platform}</th>
            <th className="px-4 py-3 font-medium">{labels.gross}</th>
            <th className="px-4 py-3 font-medium">{labels.agencyPercent}</th>
            <th className="px-4 py-3 font-medium">{labels.agencyAmount}</th>
            <th className="px-4 py-3 font-medium">{labels.creatorPercent}</th>
            <th className="px-4 py-3 font-medium">{labels.creatorAmount}</th>
            <th className="px-4 py-3 font-medium">{labels.status}</th>
            <th className="px-4 py-3 font-medium">{labels.manager}</th>
            <th className="px-4 py-3 font-medium">{labels.actions}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-white/[0.02]">
              <td className="px-4 py-3 text-white">
                {formatFinanceDate(item.transaction_date, locale)}
              </td>
              <td className="px-4 py-3 text-white">
                {item.creator?.display_name ||
                  item.creator?.full_name ||
                  "—"}
              </td>
              <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                {platformLabels[item.platform as FinancePlatform] ??
                  item.platform}
              </td>
              <td className="px-4 py-3">
                <MoneyCell
                  value={item.gross_revenue}
                  locale={locale}
                  currency={item.currency}
                />
              </td>
              <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                {Number(item.agency_percent).toFixed(0)}%
              </td>
              <td className="px-4 py-3">
                <MoneyCell
                  value={item.agency_amount}
                  locale={locale}
                  currency={item.currency}
                />
              </td>
              <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                {Number(item.creator_percent).toFixed(0)}%
              </td>
              <td className="px-4 py-3">
                <MoneyCell
                  value={item.creator_amount}
                  locale={locale}
                  currency={item.currency}
                />
              </td>
              <td className="px-4 py-3">
                <FinanceStatusBadge
                  status={item.status}
                  label={statusLabels[item.status] ?? item.status}
                />
              </td>
              <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                {item.manager?.full_name ?? labels.unassigned}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/finance/${item.id}`}
                  className="text-xs text-[var(--nht-gold)] hover:text-white"
                >
                  {labels.view}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
