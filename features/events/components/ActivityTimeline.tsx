"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import type { ActivityLogRow } from "@/features/events/types";

type Labels = {
  empty: string;
  expand: string;
  collapse: string;
  unknownActor: string;
};

function entityHref(item: ActivityLogRow): string | null {
  if (!item.entity_id) return null;
  if (item.entity_type === "application") {
    return `/admin/applications/${item.entity_id}`;
  }
  if (item.entity_type === "creator") {
    return `/admin/creators/${item.entity_id}`;
  }
  return null;
}

export default function ActivityTimeline({
  items,
  labels,
  moduleLabels,
  roleLabels,
}: {
  items: ActivityLogRow[];
  labels: Labels;
  moduleLabels: Record<string, string>;
  roleLabels: Record<string, string>;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-[var(--nht-radius-xl)] border border-dashed border-white/[0.08] bg-white/[0.02] px-5 py-12 text-center text-sm text-[var(--nht-text-secondary)]">
        {labels.empty}
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {items.map((item) => (
        <ActivityItem
          key={item.id}
          item={item}
          labels={labels}
          moduleLabels={moduleLabels}
          roleLabels={roleLabels}
        />
      ))}
    </ol>
  );
}

function ActivityItem({
  item,
  labels,
  moduleLabels,
  roleLabels,
}: {
  item: ActivityLogRow;
  labels: Labels;
  moduleLabels: Record<string, string>;
  roleLabels: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const href = entityHref(item);
  const name = item.actor?.full_name?.trim() || labels.unknownActor;
  const role = item.actor_role || item.actor?.role;
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <li className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.04] text-xs font-medium text-[var(--nht-gold)]">
          {item.actor?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.actor.avatar_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-white">{name}</p>
            {role ? (
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-[var(--nht-text-tertiary)]">
                {roleLabels[role] ?? role}
              </span>
            ) : null}
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-[var(--nht-gold)]">
              {moduleLabels[item.module] ?? item.module}
            </span>
          </div>
          <p className="mt-2 text-sm text-[var(--nht-text-secondary)]">
            {item.description}
          </p>
          {href ? (
            <Link
              href={href}
              className="mt-2 inline-block text-xs text-[var(--nht-gold)] hover:text-white"
            >
              {href}
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="mt-3 text-xs text-[var(--nht-text-tertiary)] hover:text-white"
            aria-expanded={open}
          >
            {open ? labels.collapse : labels.expand}
          </button>
          {open ? (
            <pre className="mt-3 overflow-x-auto rounded-[var(--nht-radius-lg)] border border-white/[0.06] bg-black/40 p-3 text-[11px] text-[var(--nht-text-secondary)]">
              {JSON.stringify(item.payload ?? {}, null, 2)}
            </pre>
          ) : null}
        </div>
      </div>
    </li>
  );
}
