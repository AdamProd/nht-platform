import {
  Users,
  UserCog,
  Sparkles,
  Building2,
  Activity,
} from "lucide-react";
import KpiCard from "@/shared/ui/KpiCard";

type Props = {
  stats: {
    employees: number;
    managers: number;
    creators: number;
    departments: number;
    activeToday: number;
  };
  labels: {
    employees: string;
    managers: string;
    creators: string;
    departments: string;
    activeToday: string;
  };
};

export default function StaffStatsCards({ stats, labels }: Props) {
  const cards = [
    {
      label: labels.employees,
      value: stats.employees,
      icon: Users,
      tone: "accent" as const,
    },
    {
      label: labels.managers,
      value: stats.managers,
      icon: UserCog,
      tone: "default" as const,
    },
    {
      label: labels.creators,
      value: stats.creators,
      icon: Sparkles,
      tone: "default" as const,
    },
    {
      label: labels.departments,
      value: stats.departments,
      icon: Building2,
      tone: "muted" as const,
    },
    {
      label: labels.activeToday,
      value: stats.activeToday,
      icon: Activity,
      tone: "accent" as const,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <KpiCard
          key={card.label}
          label={card.label}
          value={card.value}
          icon={card.icon}
          tone={card.tone}
        />
      ))}
    </div>
  );
}
