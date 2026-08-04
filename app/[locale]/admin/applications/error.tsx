"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function ApplicationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("admin.applications.errors");

  useEffect(() => {
    console.error("[applications]", error);
  }, [error]);

  return (
    <div className="rounded-[var(--nht-radius-xl)] border border-white/[0.08] bg-white/[0.03] px-6 py-10 text-center">
      <p className="text-sm text-[var(--nht-text-secondary)]">{t("boundary")}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-full border border-white/10 px-4 py-2 text-xs text-white hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nht-gold)]"
      >
        {t("retry")}
      </button>
    </div>
  );
}
