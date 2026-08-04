import CreatorCard from "@/features/creators/components/CreatorCard";
import type { CreatorListItem } from "@/features/creators/types";
import { Link } from "@/i18n/navigation";

type DashboardCreatorsSectionProps = {
  items: CreatorListItem[];
  locale?: string;
  showRevenue?: boolean;
  labels: {
    title: string;
    empty: string;
    viewAll: string;
    unassigned: string;
  };
  statusLabels: Record<string, string>;
};

export default function DashboardCreatorsSection({
  items,
  locale = "en",
  showRevenue = false,
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
      ) : (
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5">
          {items.map((creator) => (
            <CreatorCard
              key={creator.id}
              creator={creator}
              locale={locale}
              showRevenue={showRevenue}
              statusLabel={statusLabels[creator.status] ?? creator.status}
              unassigned={labels.unassigned}
            />
          ))}
        </div>
      )}
    </section>
  );
}
