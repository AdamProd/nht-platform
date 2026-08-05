"use client";

import { useState, useTransition } from "react";
import { Download } from "lucide-react";
import { exportFinanceData } from "@/features/finance/exports/export-finance";
import type {
  FinanceExportFormat,
  FinanceExportKind,
} from "@/features/finance/types";

type Props = {
  kind: FinanceExportKind;
  filters?: Record<string, string | number | undefined>;
  labels: {
    export: string;
    csv: string;
    excel: string;
    pdf: string;
    error: string;
  };
};

function downloadFile(filename: string, mime: string, content: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function ExportButtons({ kind, filters = {}, labels }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(format: FinanceExportFormat) {
    setError(null);
    startTransition(async () => {
      const result = await exportFinanceData({ kind, format, filters });
      if (!result.success) {
        setError(result.error ?? labels.error);
        return;
      }
      if (format === "pdf") {
        const win = window.open("", "_blank");
        if (win) {
          win.document.write(result.content);
          win.document.close();
          win.focus();
          win.print();
        }
        return;
      }
      downloadFile(result.filename, result.mime, result.content);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1 text-xs text-[var(--nht-text-tertiary)]">
        <Download className="h-3.5 w-3.5" aria-hidden />
        {labels.export}
      </span>
      {(["csv", "excel", "pdf"] as const).map((format) => (
        <button
          key={format}
          type="button"
          disabled={isPending}
          onClick={() => run(format)}
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white transition hover:border-[var(--nht-accent)]/40 hover:text-[var(--nht-accent)] disabled:opacity-60"
        >
          {labels[format]}
        </button>
      ))}
      {error ? <p className="w-full text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
