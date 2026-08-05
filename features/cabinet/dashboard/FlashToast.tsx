"use client";

import { useState, useTransition } from "react";

type FlashToastProps = {
  message: string | null;
  tone?: "success" | "error";
};

export function FlashToast({ message, tone = "success" }: FlashToastProps) {
  if (!message) return null;
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
      <span className={isError ? "text-[var(--nht-text-secondary)]" : "text-[var(--nht-gold)]"}>
        {isError ? "!" : "✓"}
      </span>{" "}
      <span className="text-[var(--nht-text-secondary)]">{message}</span>
    </div>
  );
}

export function useActionToast() {
  const [toast, setToast] = useState<string | null>(null);
  const [tone, setTone] = useState<"success" | "error">("success");
  const [isPending, startTransition] = useTransition();

  function run(
    action: () => Promise<{ success: boolean; error?: string }>,
    successMessage: string,
    errorFallback: string,
  ) {
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setTone("error");
        setToast(result.error ?? errorFallback);
        return;
      }
      setTone("success");
      setToast(successMessage);
    });
  }

  return { toast, tone, isPending, run, setToast };
}
