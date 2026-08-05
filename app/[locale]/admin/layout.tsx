import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireStaff } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import {
  getUnreadNotificationCount,
  listRecentNotifications,
} from "@/features/events";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await requireStaff();
  const t = await getTranslations("admin");
  const userName =
    session.profile.full_name?.trim() ||
    session.user.email?.split("@")[0] ||
    t("staffFallback");

  const [unreadCount, recentNotifications] = await Promise.all([
    getUnreadNotificationCount(),
    listRecentNotifications(10),
  ]);

  return (
    <AdminShell
      userName={userName}
      userRole={session.profile.role}
      userEmail={session.user.email}
      unreadCount={unreadCount}
      recentNotifications={recentNotifications}
    >
      {children}
    </AdminShell>
  );
}
