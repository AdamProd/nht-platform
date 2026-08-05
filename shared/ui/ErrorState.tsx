import { AlertTriangle } from "lucide-react";

type ErrorStateProps = {
  title: string;
  description?: string;
  retryHref?: string;
  retryLabel?: string;
  className?: string;
};

export default function ErrorState({
  title,
  description,
  retryHref,
  retryLabel,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`rounded-[var(--nht-radius-xl)] border border-red-500/25 bg-red-500/[0.08] px-5 py-5 ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-200">
          <AlertTriangle className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-red-100">{title}</p>
          {description ? (
            <p className="mt-1 text-xs text-red-100/70">{description}</p>
          ) : null}
          {retryHref && retryLabel ? (
            <a
              href={retryHref}
              className="focus-ring mt-3 inline-flex rounded-full border border-red-300/30 px-3 py-1.5 text-xs font-medium text-red-100 transition hover:bg-red-500/10"
            >
              {retryLabel}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
