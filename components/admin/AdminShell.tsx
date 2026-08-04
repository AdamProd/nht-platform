"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

type AdminShellProps = {
  userName: string;
  userRole: string;
  userEmail?: string | null;
  children: React.ReactNode;
};

export default function AdminShell({
  userName,
  userRole,
  userEmail,
  children,
}: AdminShellProps) {
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
          aria-label="Close menu overlay"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="flex min-h-full flex-col lg:pl-64">
        <AdminHeader
          userName={userName}
          userRole={userRole}
          userEmail={userEmail}
          onMenuOpen={() => setMobileOpen(true)}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
