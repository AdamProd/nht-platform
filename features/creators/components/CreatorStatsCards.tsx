import type { CreatorStats } from "@/features/creators/types";
import { formatMoney } from "@/features/creators/lib/format";

type CreatorStatsCardsProps = {
  stats: CreatorStats;
  locale: string;
  labels: {
    total: string;
    active: string;
    vacation: string;
    inactive: string;
    revenueCurrent: string;
    revenueAverage: string;
  };
};

export default function CreatorStatsCards({
  stats,
  locale,
  labels,
}: CreatorStatsCardsProps) {
  const cards = [
    { label: labels.total, value: String(stats.total) },
    { label: labels.active, value: String(stats.active) },
    { label: labels.vacation, value: String(stats.vacation) },
    { label: labels.inactive, value: String(stats.inactive) },
    {
      label: labels.revenueCurrent,
      value: formatMoney(stats.revenueCurrent, locale),
    },
    {
      label: labels.revenueAverage,
      value: formatMoney(stats.revenueAverage, locale),
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] px-4 py-4"
        >
          <p className="text-overline text-[var(--nht-text-tertiary)]">
            {card.label}
          </p>
          <p className="mt-3 text-2xl font-semibold text-white">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
