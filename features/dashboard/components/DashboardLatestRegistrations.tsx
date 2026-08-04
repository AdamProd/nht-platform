import { Link } from "@/i18n/navigation";
import type { CreatorListItem } from "@/features/creators/types";
import {
  displayNameOf,
  formatDateTime,
} from "@/features/creators/lib/format";
import CreatorStatusBadge from "@/features/creators/components/CreatorStatusBadge";

type DashboardLatestRegistrationsProps = {
  items: CreatorListItem[];
  locale: string;
  labels: {
    title: string;
    empty: string;
    viewAll: string;
    name: string;
    email: string;
    registered: string;
    status: string;
  };
  statusLabels: Record<string, string>;
};

export default function DashboardLatestRegistrations({
  items,
  locale,
  labels,
  statusLabels,
}: DashboardLatestRegistrationsProps) {
  return (
    <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02]">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
        <h2 className="text-sm font-medium text-white">{labels.title}</h2>
        <Link
          href="/admin/creators"
          className="text-xs text-[var(--nht-gold)] hover:text-white"
        >
          {labels.viewAll}
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-[var(--nht-text-secondary)]">
          {labels.empty}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/[0.06] bg-white/[0.02]">
              <tr className="text-overline text-[var(--nht-text-tertiary)]">
                <th scope="col" className="px-5 py-3 font-medium">
                  {labels.name}
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  {labels.email}
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  {labels.status}
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  {labels.registered}
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-white/[0.04] last:border-0"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/creators/${item.id}`}
                      className="text-white hover:text-[var(--nht-gold)]"
                    >
                      {displayNameOf(item)}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-[var(--nht-text-secondary)]">
                    {item.email}
                  </td>
                  <td className="px-5 py-3">
                    <CreatorStatusBadge
                      status={item.status}
                      label={statusLabels[item.status] ?? item.status}
                    />
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-[var(--nht-text-tertiary)]">
                    {formatDateTime(item.created_at, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
