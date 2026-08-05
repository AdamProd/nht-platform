"use client";

import { useMemo, useState, useTransition } from "react";
import { History } from "lucide-react";
import EmptyState from "@/shared/ui/EmptyState";
import { loadCreatorTimelinePage } from "@/features/creators/profile/timeline/actions/load-creator-timeline";
import TimelineDay from "@/features/creators/profile/timeline/components/TimelineDay";
import { groupTimelineByDay } from "@/features/creators/profile/timeline/lib/timeline-ui";
import type {
  CreatorTimelineItem,
  CreatorTimelinePage,
} from "@/features/creators/profile/timeline/types/timeline";

type TimelineLabels = {
  emptyTitle: string;
  emptyDescription: string;
  loadMore: string;
  loading: string;
  today: string;
  yesterday: string;
  by: string;
};

export default function CreatorTimeline({
  creatorId,
  initial,
  locale,
  labels,
  roleLabels,
}: {
  creatorId: string;
  initial: CreatorTimelinePage;
  locale: string;
  labels: TimelineLabels;
  roleLabels: Record<string, string>;
}) {
  const [items, setItems] = useState<CreatorTimelineItem[]>(initial.items);
  const [page, setPage] = useState(initial.page);
  const [hasMore, setHasMore] = useState(initial.hasMore);
  const [isPending, startTransition] = useTransition();

  const groups = useMemo(
    () =>
      groupTimelineByDay(items, locale, {
        today: labels.today,
        yesterday: labels.yesterday,
      }),
    [items, locale, labels.today, labels.yesterday],
  );

  function handleLoadMore() {
    if (!hasMore || isPending) return;
    const nextPage = page + 1;
    startTransition(async () => {
      const result = await loadCreatorTimelinePage(creatorId, nextPage, initial.limit);
      setItems((prev) => {
        const seen = new Set(prev.map((item) => item.id));
        const merged = [...prev];
        for (const item of result.items) {
          if (!seen.has(item.id)) merged.push(item);
        }
        return merged;
      });
      setPage(result.page);
      setHasMore(result.hasMore);
    });
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={History}
        title={labels.emptyTitle}
        description={labels.emptyDescription}
      />
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <TimelineDay
          key={group.key}
          label={group.label}
          items={group.indices.map((index) => items[index])}
          locale={locale}
          byLabel={labels.by}
          roleLabels={roleLabels}
        />
      ))}

      {hasMore ? (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isPending}
            className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs text-[var(--nht-text-secondary)] transition hover:border-[var(--nht-accent)]/40 hover:text-[var(--nht-accent)] disabled:opacity-60"
          >
            {isPending ? labels.loading : labels.loadMore}
          </button>
        </div>
      ) : null}
    </div>
  );
}
