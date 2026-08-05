import {
  FileText,
  Inbox,
  Search,
  CircleCheck,
  CircleX,
  type LucideIcon,
} from "lucide-react";
import type { DashboardKpis } from "@/features/dashboard/types";
import KpiCard from "@/shared/ui/KpiCard";

type KpiKey = keyof DashboardKpis;

type DashboardKpiCardsProps = {
  kpis: DashboardKpis;
  labels: Record<KpiKey, string>;
  trendLabel?: string;
};

const kpiConfig: Record<
  KpiKey,
  { icon: LucideIcon; tone: "default" | "accent" | "muted" }
> = {
  total: { icon: FileText, tone: "default" },
  new: { icon: Inbox, tone: "accent" },
  reviewing: { icon: Search, tone: "accent" },
  active: { icon: CircleCheck, tone: "default" },
  rejected: { icon: CircleX, tone: "muted" },
};

const order: KpiKey[] = ["total", "new", "reviewing", "active", "rejected"];

export default function DashboardKpiCards({
  kpis,
  labels,
  trendLabel,
}: DashboardKpiCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {order.map((key) => {
        const config = kpiConfig[key];
        return (
          <KpiCard
            key={key}
            label={labels[key]}
            value={kpis[key]}
            icon={config.icon}
            tone={config.tone}
            trend={trendLabel}
          />
        );
      })}
    </div>
  );
}
