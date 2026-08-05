"use client";

import { useTranslations } from "next-intl";
import { logoutAction } from "@/features/auth";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import NotificationBell from "@/features/events/components/NotificationBell";
import type { NotificationRow } from "@/features/events/types";

type AdminHeaderProps = {
  userName: string;
  userRole: string;
  userEmail?: string | null;
  menuOpen: boolean;
  onMenuOpen: () => void;
  unreadCount: number;
  recentNotifications: NotificationRow[];
};

export default function AdminHeader({
  userName,
  userRole,
  userEmail,
  menuOpen,
  onMenuOpen,
  unreadCount,
  recentNotifications,
}: AdminHeaderProps) {
  const t = useTranslations("admin");
  const tn = useTranslations("admin.notifications");
  const roleKey = `roles.${userRole}` as
    | "roles.owner"
    | "roles.admin"
    | "roles.manager"
    | "roles.creator"
    | "roles.guest";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-white/[0.06] bg-[var(--nht-black)]/90 px-4 backdrop-blur-md sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuOpen}
          aria-label={t("openMenu")}
          aria-expanded={menuOpen}
          aria-controls="admin-mobile-nav"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nht-gold)] lg:hidden"
        >
          <span className="block h-0.5 w-4 bg-white" />
          <span className="block h-0.5 w-4 bg-white" />
          <span className="block h-0.5 w-4 bg-white" />
        </button>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{userName}</p>
          <p className="truncate text-xs text-[var(--nht-text-tertiary)]">
            <span className="text-[var(--nht-gold)]">
              {t.has(roleKey) ? t(roleKey) : userRole}
            </span>
            {userEmail ? ` · ${userEmail}` : null}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <NotificationBell
          unreadCount={unreadCount}
          recent={recentNotifications}
          labels={{
            title: tn("bellTitle"),
            empty: tn("empty"),
            viewAll: tn("viewAll"),
            markAll: tn("actions.markAll"),
            unread: tn("unreadBadge"),
          }}
        />
        <LanguageSwitcher variant="desktop" />
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-white transition-colors hover:border-[var(--nht-border-hover)] hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nht-gold)] sm:text-sm"
          >
            {t("logout")}
          </button>
        </form>
      </div>
    </header>
  );
}
