"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/core/notifications/actions/notifications";
import type { NotificationRow } from "@/features/core/events/types";

type Labels = {
  title: string;
  empty: string;
  viewAll: string;
  markAll: string;
  unread: string;
};

export default function NotificationBell({
  unreadCount,
  recent,
  labels,
}: {
  unreadCount: number;
  recent: NotificationRow[];
  labels: Labels;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={labels.title}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] text-white transition-colors hover:border-[var(--nht-border-hover)] hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nht-gold)]"
      >
        <BellIcon />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--nht-gold)] px-1 text-[10px] font-semibold text-black">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-[var(--nht-radius-xl)] border border-white/[0.08] bg-[var(--nht-black)] shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <p className="text-sm font-medium text-white">{labels.title}</p>
            {unreadCount > 0 ? (
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    await markAllNotificationsRead();
                  });
                }}
                className="text-xs text-[var(--nht-gold)] hover:text-white disabled:opacity-60"
              >
                {labels.markAll}
              </button>
            ) : null}
          </div>

          <ul className="max-h-80 overflow-y-auto">
            {recent.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-[var(--nht-text-secondary)]">
                {labels.empty}
              </li>
            ) : (
              recent.map((item) => (
                <li key={item.id} className="border-b border-white/[0.04]">
                  <Link
                    href={item.link || "/admin/notifications"}
                    onClick={() => {
                      if (!item.read_at) {
                        const body = new FormData();
                        body.set("id", item.id);
                        startTransition(async () => {
                          await markNotificationRead(body);
                        });
                      }
                      setOpen(false);
                    }}
                    className="block px-4 py-3 hover:bg-white/[0.03]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-white">{item.title}</p>
                      {!item.read_at ? (
                        <span
                          className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--nht-gold)]"
                          aria-label={labels.unread}
                        />
                      ) : null}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-[var(--nht-text-secondary)]">
                      {item.message}
                    </p>
                  </Link>
                </li>
              ))
            )}
          </ul>

          <div className="border-t border-white/[0.06] px-4 py-3">
            <Link
              href="/admin/notifications"
              onClick={() => setOpen(false)}
              className="text-xs text-[var(--nht-gold)] hover:text-white"
            >
              {labels.viewAll}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BellIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3a6 6 0 0 0-6 6v2.3c0 .7-.2 1.4-.6 2L4 16h16l-1.4-2.7c-.4-.6-.6-1.3-.6-2V9a6 6 0 0 0-6-6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M10 19a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
