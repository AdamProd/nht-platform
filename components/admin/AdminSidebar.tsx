"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { adminNavItems, isAdminNavActive } from "@/components/admin/nav";

type AdminSidebarProps = {
  mobileOpen: boolean;
  onNavigate?: () => void;
};

export default function AdminSidebar({
  mobileOpen,
  onNavigate,
}: AdminSidebarProps) {
  const t = useTranslations("admin.nav");
  const tAdmin = useTranslations("admin");
  const pathname = usePathname();
  const sidebarTitle = tAdmin("sidebarTitle");

  const renderNav = (interactive: boolean) => (
    <nav aria-label={tAdmin("navLabel")} className="flex flex-1 flex-col gap-1 px-3 py-4">
      {adminNavItems.map((item) => {
        const active = isAdminNavActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            tabIndex={interactive ? 0 : -1}
            aria-current={active ? "page" : undefined}
            className={`rounded-[var(--nht-radius-lg)] px-3.5 py-2.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nht-gold)] ${
              active
                ? "bg-[var(--nht-gold-muted)] text-[var(--nht-gold)]"
                : "text-[var(--nht-text-secondary)] hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/[0.06] bg-[var(--nht-black-elevated)] lg:flex">
        <div className="flex h-16 items-center border-b border-white/[0.06] px-5">
          <Link href="/admin" className="text-overline text-[var(--nht-gold)]">
            {sidebarTitle}
          </Link>
        </div>
        {renderNav(true)}
      </aside>

      <aside
        id="admin-mobile-nav"
        role="dialog"
        aria-modal={mobileOpen}
        aria-label={tAdmin("navLabel")}
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-white/[0.06] bg-[var(--nht-black-elevated)] transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "pointer-events-none -translate-x-full"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-5">
          <Link
            href="/admin"
            onClick={onNavigate}
            tabIndex={mobileOpen ? 0 : -1}
            className="text-overline text-[var(--nht-gold)]"
          >
            {sidebarTitle}
          </Link>
          <button
            type="button"
            onClick={onNavigate}
            aria-label={tAdmin("closeMenu")}
            tabIndex={mobileOpen ? 0 : -1}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--nht-text-secondary)] hover:bg-white/[0.04] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nht-gold)]"
          >
            <span className="text-lg leading-none" aria-hidden>
              ×
            </span>
          </button>
        </div>
        {renderNav(mobileOpen)}
      </aside>
    </>
  );
}
