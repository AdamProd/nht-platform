"use client";

import { useRouter } from "@/i18n/navigation";
import { useTransition } from "react";

type Option = { value: string; label: string };

type Props = {
  month: string;
  year: string;
  creator: string;
  platform: string;
  creators: Option[];
  platforms: Option[];
  labels: {
    month: string;
    year: string;
    creator: string;
    platform: string;
    all: string;
    apply: string;
  };
};

export default function ReportFilters({
  month,
  year,
  creator,
  platform,
  creators,
  platforms,
  labels,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className={`grid gap-3 rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-4 sm:grid-cols-4 ${
        isPending ? "opacity-70" : ""
      }`}
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const params = new URLSearchParams();
        params.set("tab", "reports");
        for (const key of ["month", "year", "creator", "platform"]) {
          const value = String(form.get(key) ?? "");
          if (value) params.set(key, value);
        }
        startTransition(() => {
          router.push(`/admin/finance?${params.toString()}`);
        });
      }}
    >
      <label className="space-y-1.5">
        <span className="text-xs text-[var(--nht-text-tertiary)]">{labels.month}</span>
        <select name="month" defaultValue={month} className="nht-input">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1.5">
        <span className="text-xs text-[var(--nht-text-tertiary)]">{labels.year}</span>
        <input name="year" type="number" defaultValue={year} className="nht-input" />
      </label>
      <label className="space-y-1.5">
        <span className="text-xs text-[var(--nht-text-tertiary)]">{labels.creator}</span>
        <select name="creator" defaultValue={creator} className="nht-input">
          <option value="">{labels.all}</option>
          {creators.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1.5">
        <span className="text-xs text-[var(--nht-text-tertiary)]">{labels.platform}</span>
        <select name="platform" defaultValue={platform} className="nht-input">
          <option value="">{labels.all}</option>
          {platforms.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <div className="sm:col-span-4">
        <button
          type="submit"
          className="rounded-full bg-[var(--nht-accent)] px-4 py-2 text-xs text-white"
        >
          {labels.apply}
        </button>
      </div>
    </form>
  );
}
