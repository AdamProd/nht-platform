"use client";

import { useTranslations } from "next-intl";

export default function CreatorError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("creator.errors");

  return (
    <div className="rounded-[var(--nht-radius-xl)] border border-white/[0.08] bg-white/[0.03] px-5 py-8 text-center">
      <p className="text-sm text-[var(--nht-text-secondary)]">{t("boundary")}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-full border border-white/10 px-4 py-2 text-xs text-white hover:bg-white/[0.05]"
      >
        {t("retry")}
      </button>
    </div>
  );
}
