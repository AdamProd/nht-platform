"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import type { NotificationRow } from "@/features/core/events/types";

type AdminShellProps = {
  userName: string;
  userRole: string;
  userEmail?: string | null;
  unreadCount: number;
  recentNotifications: NotificationRow[];
  children: React.ReactNode;
};

export default function AdminShell({
  userName,
  userRole,
  userEmail,
  unreadCount,
  recentNotifications,
  children,
}: AdminShellProps) {
  const t = useTranslations("admin");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-full bg-[var(--nht-black)]">
      <AdminSidebar
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
      />

      {mobileOpen ? (
        <button
          type="button"
          aria-label={t("closeOverlay")}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="flex min-h-full flex-col lg:pl-64">
        <AdminHeader
          userName={userName}
          userRole={userRole}
          userEmail={userEmail}
          menuOpen={mobileOpen}
          onMenuOpen={() => setMobileOpen(true)}
          unreadCount={unreadCount}
          recentNotifications={recentNotifications}
        />
        <main
          id="admin-main"
          className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
