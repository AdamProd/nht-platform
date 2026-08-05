import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { requireStaff, isAdminOrAbove } from "@/lib/auth";
import PermissionsMatrix from "@/features/staff/components/PermissionsMatrix";
import { STAFF_EMPLOYEE_ROLES } from "@/features/staff/types";
import { PERMISSION_ACTIONS, PERMISSION_MODULES } from "@/features/staff/permissions";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminStaffPermissionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireStaff();
  if (!isAdminOrAbove(session.profile.role)) {
    redirect({ href: "/admin/staff", locale });
  }

  const t = await getTranslations("admin.staff");
  const tRoles = await getTranslations("admin.roles");

  const roleLabels = Object.fromEntries(
    STAFF_EMPLOYEE_ROLES.map((value) => [value, tRoles(value as never)]),
  );
  const moduleLabels = Object.fromEntries(
    PERMISSION_MODULES.map((value) => [
      value,
      t(`permissions.modules.${value}`),
    ]),
  );
  const actionLabels = Object.fromEntries(
    PERMISSION_ACTIONS.map((value) => [
      value,
      t(`permissions.actions.${value}`),
    ]),
  );

  return (
    <div className="space-y-6">
      <Link
        href="/admin/staff"
        className="text-sm text-[var(--nht-gold)] hover:text-white"
      >
        {t("detail.back")}
      </Link>
      <PermissionsMatrix
        labels={{
          title: t("permissions.title"),
          description: t("permissions.description"),
          module: t("permissions.module"),
          role: t("permissions.role"),
        }}
        roleLabels={roleLabels}
        moduleLabels={moduleLabels}
        actionLabels={actionLabels}
      />
    </div>
  );
}
