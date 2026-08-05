type BadgeProps = {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "success" | "warning" | "danger" | "info";
  className?: string;
};

const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "border-white/10 bg-white/[0.04] text-[var(--nht-text-secondary)]",
  accent: "border-[var(--nht-accent)]/30 bg-[var(--nht-accent-muted)] text-[var(--nht-accent)]",
  success: "border-emerald-400/25 bg-emerald-500/10 text-emerald-200",
  warning: "border-amber-400/25 bg-amber-500/10 text-amber-200",
  danger: "border-red-400/25 bg-red-500/10 text-red-200",
  info: "border-sky-400/25 bg-sky-500/10 text-sky-200",
};

export default function Badge({
  children,
  tone = "neutral",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium tracking-wide ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
