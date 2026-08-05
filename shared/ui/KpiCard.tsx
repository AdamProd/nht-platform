import type { LucideIcon } from "lucide-react";

type KpiCardProps = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: string;
  tone?: "default" | "accent" | "muted";
};

export default function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  tone = "default",
}: KpiCardProps) {
  const valueClass =
    tone === "accent"
      ? "text-[var(--nht-accent)]"
      : tone === "muted"
        ? "text-[var(--nht-text-secondary)]"
        : "text-white";

  return (
    <div className="group rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--nht-border-hover)] hover:bg-white/[0.035] hover:shadow-[var(--nht-shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-overline text-[var(--nht-text-tertiary)]">{label}</p>
          <p className={`mt-3 text-3xl font-semibold tracking-tight ${valueClass}`}>
            {value}
          </p>
          {trend ? (
            <p className="mt-2 text-[11px] text-[var(--nht-text-tertiary)] transition group-hover:text-[var(--nht-text-secondary)]">
              {trend}
            </p>
          ) : null}
        </div>
        {Icon ? (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--nht-accent-muted)] text-[var(--nht-accent)]">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        ) : null}
      </div>
    </div>
  );
}
