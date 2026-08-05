"use client";

import { useEffect } from "react";

export default function FlashToast({
  message,
  tone = "success",
}: {
  message: string | null;
  tone?: "success" | "error";
}) {
  useEffect(() => {
    if (!message) return;
  }, [message]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-[var(--nht-radius-lg)] border px-4 py-3 text-sm shadow-lg ${
        tone === "error"
          ? "border-white/10 bg-[#1a1212] text-[var(--nht-text-secondary)]"
          : "border-white/10 bg-[#12161a] text-white"
      }`}
    >
      {message}
    </div>
  );
}
