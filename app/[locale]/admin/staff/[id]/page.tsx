import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireStaff, isAdminOrAbove, isOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getStaff } from "@/features/staff/queries/get-staff";
import { listStaffActivity } from "@/features/staff/queries/list-staff-activity";
import StaffProfilePanel from "@/features/staff/components/StaffProfilePanel";
import {
  STAFF_DEPARTMENTS,
  STAFF_EMPLOYEE_ROLES,
  STAFF_STATUSES,
} from "@/features/staff/types";
import { canManageTargetStaff } from "@/features/staff/lib/access";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function AdminStaffDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const session = await requireStaff();
  const t = await getTranslations("admin.staff");
  const tRoles = await getTranslations("admin.roles");
  const tUx = await getTranslations("common.ux");

  const staff = await getStaff(id);
  if (!staff) notFound();

  const canEdit =
    isAdminOrAbove(session.profile.role) &&
    canManageTargetStaff(session.profile.role, staff.role);

  const activity = await listStaffActivity(id);
  const supabase = await createClient();

  const [creators, applications] = canEdit
    ? await Promise.all([
        supabase
          .from("creators")
          .select("id, display_name")
          .is("manager_id", null)
          .order("display_name", { ascending: true })
          .limit(40),
        supabase
          .from("applications")
          .select("id, full_name")
          .is("assigned_manager", null)
          .order("created_at", { ascending: false })
          .limit(40),
      ])
    : [{ data: [] }, { data: [] }];

  const roleLabels = Object.fromEntries(
    [...STAFF_EMPLOYEE_ROLES, "creator", "guest"].map((value) => [
      value,
      tRoles.has(value as never) ? tRoles(value as never) : value,
    ]),
  );
  const departmentLabels = Object.fromEntries(
    STAFF_DEPARTMENTS.map((value) => [value, t(`departments.${value}`)]),
  );
  const statusLabels = Object.fromEntries(
    STAFF_STATUSES.map((value) => [value, t(`status.${value}`)]),
  );

  return (
    <StaffProfilePanel
      staff={staff}
      activity={activity}
      locale={locale}
      canEdit={canEdit}
      isOwnerActor={isOwner(session.profile.role)}
      unassignedCreators={creators.data ?? []}
      unassignedApplications={applications.data ?? []}
      labels={{
        back: t("detail.back"),
        save: t("detail.save"),
        saving: t("detail.saving"),
        saved: t("detail.saved"),
        confirmDelete: t("detail.confirmDelete"),
        confirmTransfer: t("detail.confirmTransfer"),
        cancel: tUx("cancel"),
        delete: t("detail.delete"),
        transferOwnership: t("detail.transferOwnership"),
        sections: {
          profile: t("detail.sections.profile"),
          assignments: t("detail.sections.assignments"),
          activity: t("detail.sections.activity"),
          danger: t("detail.sections.danger"),
        },
        fields: {
          fullName: t("fields.fullName"),
          email: t("fields.email"),
          phone: t("fields.phone"),
          department: t("fields.department"),
          departmentCustom: t("fields.departmentCustom"),
          timezone: t("fields.timezone"),
          language: t("fields.language"),
          created: t("fields.created"),
          updated: t("fields.updated"),
          lastLogin: t("fields.lastLogin"),
          biography: t("fields.biography"),
          notes: t("fields.notes"),
          role: t("fields.role"),
          status: t("fields.status"),
          managedCreators: t("fields.managedCreators"),
          assignedApplications: t("fields.assignedApplications"),
          assignedTasks: t("fields.assignedTasks"),
        },
        emptyAssignments: t("detail.emptyAssignments"),
        emptyActivity: t("detail.emptyActivity"),
        unassign: t("detail.unassign"),
        assignCreator: t("detail.assignCreator"),
        assignApplication: t("detail.assignApplication"),
        expandPayload: t("detail.expandPayload"),
        collapsePayload: t("detail.collapsePayload"),
      }}
      roleLabels={roleLabels}
      departmentLabels={departmentLabels}
      statusLabels={statusLabels}
    />
  );
}
