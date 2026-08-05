"use client";

import { useEffect, useId, useRef } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  tone?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={cancelLabel}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md rounded-[var(--nht-radius-2xl)] border border-white/[0.08] bg-[var(--nht-black-elevated)] p-6 shadow-[var(--nht-shadow-lg)]"
      >
        <h2 id={titleId} className="text-lg font-medium text-white">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-[var(--nht-text-secondary)]">
            {description}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="focus-ring rounded-full border border-white/10 px-4 py-2.5 text-sm text-[var(--nht-text-secondary)] hover:text-white"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`focus-ring rounded-full px-4 py-2.5 text-sm font-medium ${
              tone === "danger"
                ? "border border-red-400/40 bg-red-500/15 text-red-100 hover:bg-red-500/25"
                : "border border-[var(--nht-accent)]/40 bg-[var(--nht-accent-muted)] text-[var(--nht-accent)]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
