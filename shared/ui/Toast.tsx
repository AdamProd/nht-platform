"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";

export type ToastTone = "success" | "error" | "warning" | "info";

type ToastProps = {
  message: string | null;
  tone?: ToastTone;
  durationMs?: number;
};

const toneStyles: Record<
  ToastTone,
  { box: string; icon: typeof CheckCircle2; iconClass: string }
> = {
  success: {
    box: "border-[var(--nht-accent)]/30 bg-[var(--nht-black-elevated)]",
    icon: CheckCircle2,
    iconClass: "text-[var(--nht-accent)]",
  },
  error: {
    box: "border-red-400/30 bg-[var(--nht-black-elevated)]",
    icon: AlertCircle,
    iconClass: "text-red-300",
  },
  warning: {
    box: "border-amber-400/30 bg-[var(--nht-black-elevated)]",
    icon: TriangleAlert,
    iconClass: "text-amber-300",
  },
  info: {
    box: "border-sky-400/30 bg-[var(--nht-black-elevated)]",
    icon: Info,
    iconClass: "text-sky-300",
  },
};

export default function Toast({
  message,
  tone = "success",
  durationMs = 3200,
}: ToastProps) {
  const [dismissedMessage, setDismissedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => {
      setDismissedMessage(message);
    }, durationMs);
    return () => window.clearTimeout(timer);
  }, [message, durationMs]);

  if (!message || dismissedMessage === message) return null;

  const config = toneStyles[tone];
  const Icon = config.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed right-4 bottom-4 z-50 flex max-w-sm items-start gap-3 rounded-[var(--nht-radius-lg)] border px-4 py-3 text-sm text-white shadow-[var(--nht-shadow-md)] ${config.box}`}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.iconClass}`} aria-hidden />
      <span className="text-[var(--nht-text-secondary)]">{message}</span>
    </div>
  );
}

/** Compatibility alias used across feature forms. */
export { Toast as FlashToast };
