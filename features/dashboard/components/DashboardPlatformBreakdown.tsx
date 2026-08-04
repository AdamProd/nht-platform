import type { PlatformBreakdownItem } from "@/features/dashboard/types";

type DashboardPlatformBreakdownProps = {
  items: PlatformBreakdownItem[];
  labels: {
    title: string;
    empty: string;
  };
  platformLabels: Record<string, string>;
};

export default function DashboardPlatformBreakdown({
  items,
  labels,
  platformLabels,
}: DashboardPlatformBreakdownProps) {
  const max = items.reduce((acc, item) => Math.max(acc, item.count), 0);

  return (
    <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
      <h2 className="text-sm font-medium text-white">{labels.title}</h2>

      {items.length === 0 ? (
        <p className="mt-8 text-center text-sm text-[var(--nht-text-secondary)]">
          {labels.empty}
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {items.map((item) => {
            const width = max > 0 ? Math.round((item.count / max) * 100) : 0;
            return (
              <li key={item.platform}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="text-sm text-white">
                    {platformLabels[item.platform] ?? item.label}
                  </span>
                  <span className="text-xs text-[var(--nht-text-tertiary)]">
                    {item.count}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-[var(--nht-gold)]"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
