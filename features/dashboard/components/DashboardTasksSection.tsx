import {
  AlertTriangle,
  CheckCircle2,
  ListTodo,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import KpiCard from "@/shared/ui/KpiCard";

export type DashboardTaskStats = {
  openTasks: number;
  myTasks: number;
  overdue: number;
  completedToday: number;
};

type Props = {
  stats: DashboardTaskStats;
  labels: {
    title: string;
    openTasks: string;
    myTasks: string;
    overdue: string;
    completedToday: string;
    viewAll: string;
  };
};

const cards: Array<{
  key: keyof DashboardTaskStats;
  scope: string;
  icon: LucideIcon;
  tone: "default" | "accent" | "muted";
}> = [
  { key: "openTasks", scope: "", icon: ListTodo, tone: "default" },
  { key: "myTasks", scope: "mine", icon: UserRound, tone: "accent" },
  { key: "overdue", scope: "overdue", icon: AlertTriangle, tone: "muted" },
  { key: "completedToday", scope: "completed", icon: CheckCircle2, tone: "default" },
];

export default function DashboardTasksSection({ stats, labels }: Props) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-white">{labels.title}</h2>
        <Link
          href="/admin/tasks"
          className="text-xs text-[var(--nht-accent)] hover:underline"
        >
          {labels.viewAll}
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.key}
            href={card.scope ? `/admin/tasks?scope=${card.scope}` : "/admin/tasks"}
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
    </section>
  );
}
