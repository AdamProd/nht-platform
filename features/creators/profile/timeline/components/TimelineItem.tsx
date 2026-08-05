"use client";

import type { CreatorTimelineItem } from "@/features/creators/profile/timeline/types/timeline";
import {
  TIMELINE_ICON_MAP,
  timelineAccentClasses,
} from "@/features/creators/profile/timeline/lib/timeline-ui";

export default function TimelineItem({
  item,
  locale,
  byLabel,
  roleLabels,
  isLast,
}: {
  item: CreatorTimelineItem;
  locale: string;
  byLabel: string;
  roleLabels: Record<string, string>;
  isLast: boolean;
}) {
  const Icon = TIMELINE_ICON_MAP[item.icon];
  const accent = timelineAccentClasses(item.color);
  const role =
    item.actor.role && roleLabels[item.actor.role]
      ? roleLabels[item.actor.role]
      : item.actor.role;
  const when = formatTimelineWhen(item.created_at, locale);

  return (
    <li className="relative flex gap-3 pb-5 last:pb-0">
      {!isLast ? (
        <span
          aria-hidden
          className={`absolute left-[15px] top-8 bottom-0 w-px ${accent.rail}`}
        />
      ) : null}
      <div
        className={`relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${accent.iconWrap}`}
      >
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h4 className="text-sm font-medium text-white">{item.title}</h4>
          <time
            dateTime={item.created_at}
            className="shrink-0 text-[11px] text-[var(--nht-text-tertiary)]"
          >
            {when}
          </time>
        </div>
        {item.description ? (
          <p className="mt-0.5 text-xs text-[var(--nht-text-secondary)]">
            {item.description}
          </p>
        ) : null}
        <p className="mt-1 text-[11px] text-[var(--nht-text-tertiary)]">
          {byLabel} {item.actor.name}
          {role ? ` · ${role}` : null}
        </p>
      </div>
    </li>
  );
}

function formatTimelineWhen(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  const time = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  if (sameDay || isYesterday) return time;

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
