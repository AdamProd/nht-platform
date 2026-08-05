"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function FinanceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("admin.finance.errors");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-[var(--nht-radius-xl)] border border-white/[0.08] bg-white/[0.03] px-5 py-6">
      <p className="text-sm text-[var(--nht-text-secondary)]">{t("boundary")}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-full border border-white/10 px-4 py-2 text-xs text-white hover:border-[var(--nht-border-hover)]"
      >
        {t("retry")}
      </button>
    </div>
  );
}
