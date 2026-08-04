"use client";

import { useEffect, useState } from "react";

type FlashToastProps = {
  message: string | null;
};

export default function FlashToast({ message }: FlashToastProps) {
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 3200);
    return () => window.clearTimeout(timer);
  }, [message]);

  if (!visible || !message) return null;

  return (
    <div
      role="status"
      className="fixed right-4 bottom-4 z-50 max-w-sm rounded-[var(--nht-radius-lg)] border border-[var(--nht-border-hover)] bg-[var(--nht-black-elevated)] px-4 py-3 text-sm text-white shadow-[var(--nht-shadow-md)]"
    >
      <span className="text-[var(--nht-gold)]">✓</span>{" "}
      <span className="text-[var(--nht-text-secondary)]">{message}</span>
    </div>
  );
}
