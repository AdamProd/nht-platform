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
    { label: labels.employees, value: stats.employees },
    { label: labels.managers, value: stats.managers },
    { label: labels.creators, value: stats.creators },
    { label: labels.departments, value: stats.departments },
    { label: labels.activeToday, value: stats.activeToday },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] px-4 py-4"
        >
          <p className="text-xs text-[var(--nht-text-tertiary)]">{card.label}</p>
          <p className="mt-2 text-2xl font-medium text-white">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
