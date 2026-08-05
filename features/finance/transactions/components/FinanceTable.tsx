import { Link } from "@/i18n/navigation";
import { Wallet } from "lucide-react";
import type {
  FinancePlatform,
  FinanceTransactionListItem,
  FinanceTransactionStatus,
} from "@/features/finance/types";
import { formatFinanceDate } from "@/features/finance/lib/format";
import FinanceStatusBadge from "@/features/finance/transactions/components/FinanceStatusBadge";
import MoneyCell from "@/features/finance/transactions/components/MoneyCell";
import EmptyState from "@/shared/ui/EmptyState";
import Badge from "@/shared/ui/Badge";

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
    emptyTitle?: string;
    emptyDescription?: string;
    emptyAction?: string;
  };
  statusLabels: Record<FinanceTransactionStatus, string>;
  platformLabels: Record<string, string>;
  canCreate?: boolean;
};

export default function FinanceTable({
  items,
  locale,
  labels,
  statusLabels,
  platformLabels,
  canCreate = false,
}: Props) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title={labels.emptyTitle ?? labels.empty}
        description={labels.emptyDescription}
        actionHref={canCreate ? "/admin/finance" : undefined}
        actionLabel={canCreate ? labels.emptyAction : undefined}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-[var(--nht-radius-xl)] border border-white/[0.06]">
      <table className="min-w-full text-left text-sm">
        <thead className="sticky top-0 z-10 border-b border-white/[0.06] bg-[var(--nht-black-elevated)]/95 text-overline text-[var(--nht-text-tertiary)] backdrop-blur">
          <tr>
            <th className="px-4 py-3 font-medium">{labels.date}</th>
            <th className="px-4 py-3 font-medium">{labels.creator}</th>
            <th className="px-4 py-3 font-medium">{labels.platform}</th>
            <th className="px-4 py-3 text-right font-medium">{labels.gross}</th>
            <th className="hidden px-4 py-3 text-right font-medium lg:table-cell">
              {labels.agencyPercent}
            </th>
            <th className="hidden px-4 py-3 text-right font-medium lg:table-cell">
              {labels.agencyAmount}
            </th>
            <th className="hidden px-4 py-3 text-right font-medium xl:table-cell">
              {labels.creatorPercent}
            </th>
            <th className="px-4 py-3 text-right font-medium">
              {labels.creatorAmount}
            </th>
            <th className="px-4 py-3 font-medium">{labels.status}</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">
              {labels.manager}
            </th>
            <th className="px-4 py-3 font-medium">{labels.actions}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {items.map((item) => (
            <tr
              key={item.id}
              className="group transition-colors hover:bg-white/[0.03]"
            >
              <td className="px-4 py-3 text-white">
                <Link
                  href={`/admin/finance/${item.id}`}
                  className="group-hover:text-[var(--nht-accent)]"
                >
                  {formatFinanceDate(item.transaction_date, locale)}
                </Link>
              </td>
              <td className="px-4 py-3 text-white">
                {item.creator?.display_name ||
                  item.creator?.full_name ||
                  "—"}
              </td>
              <td className="px-4 py-3">
                <Badge tone="info">
                  {platformLabels[item.platform as FinancePlatform] ??
                    item.platform}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right">
                <MoneyCell
                  value={item.gross_revenue}
                  locale={locale}
                  currency={item.currency}
                />
              </td>
              <td className="hidden px-4 py-3 text-right text-[var(--nht-text-secondary)] lg:table-cell">
                {Number(item.agency_percent).toFixed(0)}%
              </td>
              <td className="hidden px-4 py-3 text-right lg:table-cell">
                <MoneyCell
                  value={item.agency_amount}
                  locale={locale}
                  currency={item.currency}
                />
              </td>
              <td className="hidden px-4 py-3 text-right text-[var(--nht-text-secondary)] xl:table-cell">
                {Number(item.creator_percent).toFixed(0)}%
              </td>
              <td className="px-4 py-3 text-right">
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
              <td className="hidden px-4 py-3 text-[var(--nht-text-secondary)] md:table-cell">
                {item.manager?.full_name ?? labels.unassigned}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/finance/${item.id}`}
                  className="text-xs font-medium text-[var(--nht-accent)] hover:text-white"
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
