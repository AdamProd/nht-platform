import { Link } from "@/i18n/navigation";
import type { CreatorListItem } from "@/features/creators/types";
import CreatorStatusBadge from "@/features/creators/components/CreatorStatusBadge";
import {
  displayNameOf,
  formatDateTime,
  formatList,
  formatMoney,
  initials,
} from "@/features/creators/lib/format";

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
  };
  statusLabels: Record<string, string>;
};

export default function CreatorTable({
  items,
  locale,
  labels,
  statusLabels,
}: CreatorTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-[var(--nht-radius-xl)] border border-dashed border-white/[0.1] px-6 py-16 text-center">
        <p className="text-sm text-[var(--nht-text-secondary)]">{labels.empty}</p>
        <p className="mt-2 text-xs text-[var(--nht-text-tertiary)]">
          {labels.emptyHint}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[var(--nht-radius-xl)] border border-white/[0.06]">
      <table className="min-w-full text-left text-sm" aria-label={labels.name}>
        <thead className="border-b border-white/[0.06] bg-white/[0.02]">
          <tr className="text-overline text-[var(--nht-text-tertiary)]">
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.avatar}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.name}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.email}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.country}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.platforms}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.manager}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.status}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.revenue}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.lastActivity}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.actions}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const name = displayNameOf(item);
            return (
              <tr
                key={item.id}
                className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.04] text-[10px] font-medium text-[var(--nht-gold)]">
                    {item.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.avatar_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials(name)
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-white">
                  <Link
                    href={`/admin/creators/${item.id}`}
                    className="hover:text-[var(--nht-gold)]"
                  >
                    {name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                  {item.email}
                </td>
                <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                  {item.country ?? "—"}
                </td>
                <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                  {formatList(item.platforms)}
                </td>
                <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                  {item.manager?.full_name ?? labels.unassigned}
                </td>
                <td className="px-4 py-3">
                  <CreatorStatusBadge
                    status={item.status}
                    label={statusLabels[item.status] ?? item.status}
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-[var(--nht-text-secondary)]">
                  {formatMoney(item.revenue_current_month, locale)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-[var(--nht-text-tertiary)]">
                  {formatDateTime(item.last_activity_at, locale)}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/creators/${item.id}`}
                    className="text-xs font-medium text-[var(--nht-gold)] hover:text-white"
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
