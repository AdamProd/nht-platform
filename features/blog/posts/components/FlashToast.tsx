"use client";

import { useEffect, useState } from "react";

type FlashToastProps = {
  message: string | null;
  tone?: "success" | "error";
};

export default function FlashToast({
  message,
  tone = "success",
}: FlashToastProps) {
  const [dismissedMessage, setDismissedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;

    const timer = window.setTimeout(() => {
      setDismissedMessage(message);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [message]);

  if (!message || dismissedMessage === message) return null;

  const isError = tone === "error";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed right-4 bottom-4 z-50 max-w-sm rounded-[var(--nht-radius-lg)] border px-4 py-3 text-sm text-white shadow-[var(--nht-shadow-md)] ${
        isError
          ? "border-white/15 bg-[var(--nht-black-elevated)]"
          : "border-[var(--nht-border-hover)] bg-[var(--nht-black-elevated)]"
      }`}
    >
      <span
        className={
          isError
            ? "text-[var(--nht-text-secondary)]"
            : "text-[var(--nht-accent-warm)]"
        }
      >
        {isError ? "!" : "✓"}
      </span>{" "}
      <span className="text-[var(--nht-text-secondary)]">{message}</span>
    </div>
  );
}
