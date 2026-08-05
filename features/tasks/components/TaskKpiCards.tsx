import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ListTodo,
  Flame,
  type LucideIcon,
} from "lucide-react";
import type { TaskStats } from "@/features/tasks/types";
import KpiCard from "@/shared/ui/KpiCard";
import { Link } from "@/i18n/navigation";

type Props = {
  stats: TaskStats;
  labels: {
    myTasks: string;
    overdue: string;
    today: string;
    completed: string;
    highPriority: string;
  };
};

const cards: Array<{
  key: keyof TaskStats;
  scope: string;
  icon: LucideIcon;
  tone: "default" | "accent" | "muted";
}> = [
  { key: "myTasks", scope: "mine", icon: ListTodo, tone: "accent" },
  { key: "overdue", scope: "overdue", icon: AlertTriangle, tone: "muted" },
  { key: "today", scope: "today", icon: Clock3, tone: "default" },
  { key: "completed", scope: "completed", icon: CheckCircle2, tone: "default" },
  { key: "highPriority", scope: "high", icon: Flame, tone: "accent" },
];

export default function TaskKpiCards({ stats, labels }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <Link
          key={card.key}
          href={`/admin/tasks?scope=${card.scope}`}
          className="block transition hover:opacity-95"
        >
          <KpiCard
            label={labels[card.key]}
            value={stats[card.key]}
            icon={card.icon}
            tone={card.tone}
          />
        </Link>
      ))}
    </div>
  );
}
