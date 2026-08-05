import {
  Users,
  CircleCheck,
  Plane,
  CirclePause,
  DollarSign,
  ChartColumn,
  type LucideIcon,
} from "lucide-react";
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
    currentRevenue: string;
    averageRevenue: string;
  };
};

const order = [
  "total",
  "active",
  "vacation",
  "inactive",
  "currentRevenue",
  "averageRevenue",
] as const;

const config: Record<
  (typeof order)[number],
  { icon: LucideIcon; money?: boolean }
> = {
  total: { icon: Users },
  active: { icon: CircleCheck },
  vacation: { icon: Plane },
  inactive: { icon: CirclePause },
  currentRevenue: { icon: DollarSign, money: true },
  averageRevenue: { icon: ChartColumn, money: true },
};

export default function CreatorStatsCards({
  stats,
  locale,
  labels,
}: CreatorStatsCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {order.map((key) => {
        const Icon = config[key].icon;
        const raw = stats[key];
        const value = config[key].money
          ? formatMoney(raw, locale)
          : String(raw);
        return (
          <div
            key={key}
            className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-overline text-[var(--nht-text-tertiary)]">
                  {labels[key]}
                </p>
                <p className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                  {value}
                </p>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--nht-gold-muted)] text-[var(--nht-gold)]">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
