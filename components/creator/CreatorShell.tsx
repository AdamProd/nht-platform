"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import CreatorSidebar from "@/components/creator/CreatorSidebar";
import CreatorHeader from "@/components/creator/CreatorHeader";

type CreatorShellProps = {
  userName: string;
  userRole: string;
  userEmail?: string | null;
  impersonating?: boolean;
  stopImpersonationAction?: () => Promise<void>;
  children: React.ReactNode;
};

export default function CreatorShell({
  userName,
  userRole,
  userEmail,
  impersonating,
  stopImpersonationAction,
  children,
}: CreatorShellProps) {
  const t = useTranslations("creator");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-full bg-[var(--nht-black)]">
      <CreatorSidebar
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
        {impersonating ? (
          <div
            role="status"
            className="border-b border-[var(--nht-gold)]/30 bg-[var(--nht-gold-muted)] px-4 py-2 text-center text-xs text-[var(--nht-gold)] sm:px-6"
          >
            {t("impersonationBanner")}
          </div>
        ) : null}
        <CreatorHeader
          userName={userName}
          userRole={userRole}
          userEmail={userEmail}
          menuOpen={mobileOpen}
          onMenuOpen={() => setMobileOpen(true)}
          impersonating={impersonating}
          stopImpersonationAction={stopImpersonationAction}
        />
        <main
          id="creator-main"
          className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
