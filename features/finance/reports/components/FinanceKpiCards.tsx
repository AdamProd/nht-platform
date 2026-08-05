import {
  Banknote,
  CircleDollarSign,
  Clock3,
  Scale,
  TrendingUp,
  Users,
} from "lucide-react";
import KpiCard from "@/shared/ui/KpiCard";
import { formatFinanceMoney } from "@/features/finance/lib/format";
import type { FinanceDashboardKpis } from "@/features/finance/types";

type Labels = {
  totalRevenue: string;
  agencyRevenue: string;
  pendingPayouts: string;
  paidThisMonth: string;
  outstandingBalance: string;
  averageRevenuePerCreator: string;
};

/** Phase 14 primary KPI row — uses shared KpiCard. */
export default function FinanceKpiCards({
  kpis,
  locale,
  labels,
}: {
  kpis: FinanceDashboardKpis;
  locale: string;
  labels: Labels;
}) {
  const cards = [
    {
      key: "totalRevenue" as const,
      value: kpis.totalRevenue,
      icon: CircleDollarSign,
      tone: "accent" as const,
    },
    {
      key: "agencyRevenue" as const,
      value: kpis.agencyRevenue,
      icon: TrendingUp,
      tone: "default" as const,
    },
    {
      key: "pendingPayouts" as const,
      value: kpis.pendingPayouts,
      icon: Clock3,
      tone: "default" as const,
    },
    {
      key: "paidThisMonth" as const,
      value: kpis.paidThisMonth,
      icon: Banknote,
      tone: "default" as const,
    },
    {
      key: "outstandingBalance" as const,
      value: kpis.outstandingBalance,
      icon: Scale,
      tone: "muted" as const,
    },
    {
      key: "averageRevenuePerCreator" as const,
      value: kpis.averageRevenuePerCreator,
      icon: Users,
      tone: "default" as const,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <KpiCard
          key={card.key}
          label={labels[card.key]}
          value={formatFinanceMoney(card.value, locale)}
          icon={card.icon}
          tone={card.tone}
        />
      ))}
    </div>
  );
}
