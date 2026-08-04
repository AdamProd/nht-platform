import {
  FileText,
  Inbox,
  Search,
  CircleCheck,
  CircleX,
  type LucideIcon,
} from "lucide-react";
import type { DashboardKpis } from "@/features/dashboard/types";

type KpiKey = keyof DashboardKpis;

type DashboardKpiCardsProps = {
  kpis: DashboardKpis;
  labels: Record<KpiKey, string>;
};

const kpiConfig: Record<
  KpiKey,
  { icon: LucideIcon; accent: string; chip: string }
> = {
  total: {
    icon: FileText,
    accent: "text-white",
    chip: "bg-white/[0.06] text-white",
  },
  new: {
    icon: Inbox,
    accent: "text-[var(--nht-gold)]",
    chip: "bg-[var(--nht-gold-muted)] text-[var(--nht-gold)]",
  },
  reviewing: {
    icon: Search,
    accent: "text-[var(--nht-gold-warm)]",
    chip: "bg-[var(--nht-gold-subtle)] text-[var(--nht-gold-warm)]",
  },
  active: {
    icon: CircleCheck,
    accent: "text-white",
    chip: "bg-white/[0.08] text-white",
  },
  rejected: {
    icon: CircleX,
    accent: "text-[var(--nht-text-tertiary)]",
    chip: "bg-white/[0.04] text-[var(--nht-text-tertiary)]",
  },
};

const order: KpiKey[] = ["total", "new", "reviewing", "active", "rejected"];

export default function DashboardKpiCards({
  kpis,
  labels,
}: DashboardKpiCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {order.map((key) => {
        const config = kpiConfig[key];
        const Icon = config.icon;
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
                <p className={`mt-3 text-3xl font-semibold ${config.accent}`}>
                  {kpis[key]}
                </p>
              </div>
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${config.chip}`}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
