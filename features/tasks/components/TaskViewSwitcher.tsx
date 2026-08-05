"use client";

import { useCallback, useEffect, useRef, useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Columns3, Table2 } from "lucide-react";
import type { TaskViewMode } from "@/features/tasks/types";

const STORAGE_KEY = "nht.tasks.view";

type Props = {
  value: TaskViewMode;
  labels: {
    table: string;
    kanban: string;
  };
  query: Record<string, string>;
};

export default function TaskViewSwitcher({ value, labels, query }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const restoredRef = useRef(false);

  const setView = useCallback(
    (next: TaskViewMode) => {
      if (next === value) return;
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      const params = new URLSearchParams();
      for (const [key, item] of Object.entries(query)) {
        if (key === "view") continue;
        if (item) params.set(key, item);
      }
      if (next === "kanban") params.set("view", "kanban");
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname);
      });
    },
    [pathname, query, router, value],
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  }, [value]);

  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    if (query.view) return;
    const stored = readStoredTaskView();
    if (stored === "kanban" && value !== "kanban") {
      setView("kanban");
    }
  }, [query.view, setView, value]);

  return (
    <div
      className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1"
      role="group"
      aria-label={`${labels.table} / ${labels.kanban}`}
    >
      <button
        type="button"
        onClick={() => setView("table")}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
          value === "table"
            ? "bg-[var(--nht-accent)] text-white shadow-sm"
            : "text-[var(--nht-text-secondary)] hover:text-white"
        }`}
        aria-pressed={value === "table"}
      >
        <Table2 className="h-3.5 w-3.5" aria-hidden />
        {labels.table}
      </button>
      <button
        type="button"
        onClick={() => setView("kanban")}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
          value === "kanban"
            ? "bg-[var(--nht-accent)] text-white shadow-sm"
            : "text-[var(--nht-text-secondary)] hover:text-white"
        }`}
        aria-pressed={value === "kanban"}
      >
        <Columns3 className="h-3.5 w-3.5" aria-hidden />
        {labels.kanban}
      </button>
    </div>
  );
}

export function readStoredTaskView(): TaskViewMode | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value === "table" || value === "kanban") return value;
  } catch {
    /* ignore */
  }
  return null;
}
