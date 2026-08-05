"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Activity } from "lucide-react";
import type { ActivityLogRow } from "@/features/core/events/types";
import EmptyState from "@/shared/ui/EmptyState";
import UserAvatar, { roleTone } from "@/shared/ui/UserAvatar";
import Badge from "@/shared/ui/Badge";

type Labels = {
  empty: string;
  emptyTitle?: string;
  emptyDescription?: string;
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
      <EmptyState
        icon={Activity}
        title={labels.emptyTitle ?? labels.empty}
        description={labels.emptyDescription}
      />
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

  return (
    <li className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-white/[0.1]">
      <div className="flex gap-3">
        <UserAvatar
          name={name}
          src={item.actor?.avatar_url}
          size="md"
          tone={roleTone(role)}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-white">{name}</p>
            {role ? (
              <Badge tone="accent">{roleLabels[role] ?? role}</Badge>
            ) : null}
            <Badge tone="info">
              {moduleLabels[item.module] ?? item.module}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-[var(--nht-text-secondary)]">
            {item.description}
          </p>
          {href ? (
            <Link
              href={href}
              className="mt-2 inline-block text-xs text-[var(--nht-accent)] hover:text-white"
            >
              {href}
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="focus-ring mt-3 text-xs text-[var(--nht-text-tertiary)] hover:text-white"
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
