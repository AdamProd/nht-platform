import { Link } from "@/i18n/navigation";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
};

export default function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  actionHref,
  actionLabel,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[var(--nht-radius-xl)] border border-dashed border-white/[0.1] bg-white/[0.015] px-6 py-16 text-center ${className}`}
      role="status"
    >
      <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--nht-accent)]/25 bg-[var(--nht-accent-muted)] text-[var(--nht-accent)]">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <p className="text-sm font-medium text-white">{title}</p>
      {description ? (
        <p className="mt-2 max-w-sm text-xs leading-relaxed text-[var(--nht-text-tertiary)]">
          {description}
        </p>
      ) : null}
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="focus-ring mt-6 inline-flex rounded-full border border-[var(--nht-accent)]/40 bg-[var(--nht-accent-muted)] px-4 py-2 text-xs font-medium text-[var(--nht-accent)] transition hover:border-[var(--nht-accent)]/60 hover:text-white"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
