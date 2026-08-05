import CreatorCard from "@/features/creators/components/CreatorCard";
import type { CreatorListItem } from "@/features/creators/types";
import { Link } from "@/i18n/navigation";
import {
  displayName,
  formatDateTime,
  formatMoney,
} from "@/features/creators/lib/format";

type DashboardCreatorsSectionProps = {
  items: CreatorListItem[];
  locale: string;
  variant?: "cards" | "registrations";
  labels: {
    title: string;
    empty: string;
    viewAll: string;
    unassigned: string;
    registered?: string;
    revenue?: string;
  };
  statusLabels: Record<string, string>;
};

export default function DashboardCreatorsSection({
  items,
  locale,
  variant = "cards",
  labels,
  statusLabels,
}: DashboardCreatorsSectionProps) {
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
      ) : variant === "registrations" ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/[0.06] bg-white/[0.02]">
              <tr className="text-overline text-[var(--nht-text-tertiary)]">
                <th scope="col" className="px-5 py-3 font-medium">
                  {labels.title}
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  {labels.registered ?? ""}
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((creator) => (
                <tr
                  key={creator.id}
                  className="border-b border-white/[0.04] last:border-0"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/creators/${creator.id}`}
                      className="text-white hover:text-[var(--nht-gold)]"
                    >
                      {displayName(creator)}
                    </Link>
                    <p className="mt-1 text-xs text-[var(--nht-text-tertiary)]">
                      {creator.email}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-[var(--nht-text-secondary)]">
                    {formatDateTime(creator.created_at, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5">
          {items.map((creator) => (
            <div key={creator.id} className="space-y-2">
              <CreatorCard
                creator={creator}
                statusLabel={statusLabels[creator.status] ?? creator.status}
                unassigned={labels.unassigned}
                locale={locale}
              />
              {labels.revenue ? (
                <p className="px-1 text-xs text-[var(--nht-text-tertiary)]">
                  {labels.revenue}:{" "}
                  {formatMoney(creator.revenue_current_month, locale)}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
