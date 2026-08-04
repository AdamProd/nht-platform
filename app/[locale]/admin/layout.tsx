import { setRequestLocale } from "next-intl/server";
import { requireStaff } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await requireStaff();
  const userName =
    session.profile.full_name?.trim() ||
    session.user.email?.split("@")[0] ||
    "Staff";

  return (
    <AdminShell
      userName={userName}
      userRole={session.profile.role}
      userEmail={session.user.email}
    >
      {children}
    </AdminShell>
  );
}
