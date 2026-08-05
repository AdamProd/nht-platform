"use client";

import { useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import {
  archiveNotification,
  deleteNotification,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/core/notifications/actions/notifications";
import type { NotificationRow } from "@/features/core/events/types";
import EmptyState from "@/shared/ui/EmptyState";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import { Bell } from "lucide-react";

type Labels = {
  empty: string;
  emptyTitle?: string;
  emptyDescription?: string;
  markRead: string;
  archive: string;
  delete: string;
  markAll: string;
  unreadBadge: string;
  cancel: string;
  confirmArchive?: string;
  confirmDelete?: string;
};

export default function NotificationsList({
  items,
  labels,
}: {
  items: NotificationRow[];
  labels: Labels;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<null | {
    id: string;
    action: "archive" | "delete";
  }>(null);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title={labels.emptyTitle ?? labels.empty}
        description={labels.emptyDescription}
      />
    );
  }

  return (
    <div className="space-y-3">
      <form
        action={() => {
          startTransition(async () => {
            await markAllNotificationsRead();
          });
        }}
      >
        <button
          type="submit"
          disabled={isPending}
          className="focus-ring rounded-full border border-white/10 px-4 py-2 text-xs text-white hover:border-[var(--nht-border-hover)] disabled:opacity-60"
        >
          {labels.markAll}
        </button>
      </form>

      <ul className="divide-y divide-white/[0.04] overflow-hidden rounded-[var(--nht-radius-xl)] border border-white/[0.06]">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-3 bg-white/[0.02] px-4 py-4 transition hover:bg-white/[0.035] sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-white">{item.title}</p>
                {!item.read_at && !item.archived_at ? (
                  <span className="rounded-full border border-[var(--nht-accent)]/30 px-2 py-0.5 text-[10px] text-[var(--nht-accent)]">
                    {labels.unreadBadge}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-[var(--nht-text-secondary)]">
                {item.message}
              </p>
              {item.link ? (
                <Link
                  href={item.link}
                  className="mt-2 inline-block text-xs text-[var(--nht-accent)] hover:text-white"
                >
                  {item.link}
                </Link>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {!item.read_at ? (
                <ActionButton
                  label={labels.markRead}
                  disabled={isPending}
                  onAction={() => {
                    const body = new FormData();
                    body.set("id", item.id);
                    return markNotificationRead(body);
                  }}
                />
              ) : null}
              {!item.archived_at ? (
                <ActionButton
                  label={labels.archive}
                  disabled={isPending}
                  onAction={() => {
                    setConfirm({ id: item.id, action: "archive" });
                    return Promise.resolve();
                  }}
                />
              ) : null}
              <ActionButton
                label={labels.delete}
                disabled={isPending}
                onAction={() => {
                  setConfirm({ id: item.id, action: "delete" });
                  return Promise.resolve();
                }}
              />
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={confirm !== null}
        title={
          confirm?.action === "archive" ? labels.archive : labels.delete
        }
        description={
          confirm?.action === "archive"
            ? labels.confirmArchive
            : labels.confirmDelete
        }
        confirmLabel={
          confirm?.action === "archive" ? labels.archive : labels.delete
        }
        cancelLabel={labels.cancel}
        tone={confirm?.action === "delete" ? "danger" : "default"}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          const current = confirm;
          setConfirm(null);
          if (!current) return;
          startTransition(async () => {
            const body = new FormData();
            body.set("id", current.id);
            if (current.action === "archive") {
              await archiveNotification(body);
            } else {
              await deleteNotification(body);
            }
          });
        }}
      />
    </div>
  );
}

function ActionButton({
  label,
  disabled,
  onAction,
}: {
  label: string;
  disabled: boolean;
  onAction: () => Promise<unknown>;
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={disabled || isPending}
      onClick={() => startTransition(() => void onAction())}
      className="focus-ring rounded-full border border-white/10 px-3 py-1.5 text-xs text-[var(--nht-text-secondary)] hover:text-white disabled:opacity-60"
    >
      {label}
    </button>
  );
}
