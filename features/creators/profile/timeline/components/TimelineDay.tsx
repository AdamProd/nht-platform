"use client";

import TimelineItem from "@/features/creators/profile/timeline/components/TimelineItem";
import type { CreatorTimelineItem } from "@/features/creators/profile/timeline/types/timeline";

export default function TimelineDay({
  label,
  items,
  locale,
  byLabel,
  roleLabels,
}: {
  label: string;
  items: CreatorTimelineItem[];
  locale: string;
  byLabel: string;
  roleLabels: Record<string, string>;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--nht-text-tertiary)]">
        {label}
      </h3>
      <ol className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] px-4 py-4">
        {items.map((item, index) => (
          <TimelineItem
            key={item.id}
            item={item}
            locale={locale}
            byLabel={byLabel}
            roleLabels={roleLabels}
            isLast={index === items.length - 1}
          />
        ))}
      </ol>
    </section>
  );
}
