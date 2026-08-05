import { Link } from "@/i18n/navigation";
import { Sparkles } from "lucide-react";
import type { CreatorListItem } from "@/features/creators/types";
import CreatorStatusBadge from "@/features/creators/components/CreatorStatusBadge";
import {
  displayName,
  formatDateTime,
  formatList,
  formatMoney,
} from "@/features/creators/lib/format";
import EmptyState from "@/shared/ui/EmptyState";
import UserAvatar from "@/shared/ui/UserAvatar";
import Badge from "@/shared/ui/Badge";

type CreatorTableProps = {
  items: CreatorListItem[];
  locale: string;
  labels: {
    avatar: string;
    name: string;
    email: string;
    country: string;
    platforms: string;
    manager: string;
    status: string;
    revenue: string;
    lastActivity: string;
    actions: string;
    view: string;
    empty: string;
    emptyHint: string;
    unassigned: string;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyAction?: string;
  };
  statusLabels: Record<string, string>;
  canCreate?: boolean;
};

export default function CreatorTable({
  items,
  locale,
  labels,
  statusLabels,
  canCreate = false,
}: CreatorTableProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title={labels.emptyTitle ?? labels.empty}
        description={labels.emptyDescription ?? labels.emptyHint}
        actionHref={canCreate ? "/admin/creators" : undefined}
        actionLabel={canCreate ? labels.emptyAction : undefined}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-[var(--nht-radius-xl)] border border-white/[0.06]">
      <table className="min-w-full text-left text-sm" aria-label={labels.name}>
        <thead className="sticky top-0 z-10 border-b border-white/[0.06] bg-[var(--nht-black-elevated)]/95 backdrop-blur">
          <tr className="text-overline text-[var(--nht-text-tertiary)]">
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.avatar}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.name}
            </th>
            <th
              scope="col"
              className="hidden px-4 py-3 font-medium md:table-cell"
            >
              {labels.email}
            </th>
            <th
              scope="col"
              className="hidden px-4 py-3 font-medium lg:table-cell"
            >
              {labels.country}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.platforms}
            </th>
            <th
              scope="col"
              className="hidden px-4 py-3 font-medium xl:table-cell"
            >
              {labels.manager}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.status}
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              {labels.revenue}
            </th>
            <th
              scope="col"
              className="hidden px-4 py-3 font-medium xl:table-cell"
            >
              {labels.lastActivity}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.actions}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const name = displayName(item);
            return (
              <tr
                key={item.id}
                className="group border-b border-white/[0.04] transition-colors hover:bg-white/[0.03]"
              >
                <td className="px-4 py-3">
                  <UserAvatar name={name} src={item.avatar_url} tone="creator" />
                </td>
                <td className="px-4 py-3 text-white">
                  <Link
                    href={`/admin/creators/${item.id}`}
                    className="font-medium group-hover:text-[var(--nht-accent)]"
                  >
                    {name}
                  </Link>
                </td>
                <td className="hidden px-4 py-3 text-[var(--nht-text-secondary)] md:table-cell">
                  {item.email}
                </td>
                <td className="hidden px-4 py-3 text-[var(--nht-text-secondary)] lg:table-cell">
                  {item.country ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge tone="info">{formatList(item.platforms)}</Badge>
                </td>
                <td className="hidden px-4 py-3 text-[var(--nht-text-secondary)] xl:table-cell">
                  {item.manager?.full_name ?? labels.unassigned}
                </td>
                <td className="px-4 py-3">
                  <CreatorStatusBadge
                    status={item.status}
                    label={statusLabels[item.status] ?? item.status}
                  />
                </td>
                <td className="px-4 py-3 text-right text-white">
                  {formatMoney(item.revenue_current_month, locale)}
                </td>
                <td className="hidden px-4 py-3 text-[var(--nht-text-secondary)] xl:table-cell">
                  {formatDateTime(item.last_activity_at, locale)}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/creators/${item.id}`}
                    className="text-xs font-medium text-[var(--nht-accent)] hover:text-white"
                  >
                    {labels.view}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
