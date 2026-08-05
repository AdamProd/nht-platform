import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireStaff, isAdminOrAbove } from "@/lib/auth";
import { listStaff } from "@/features/staff/queries/list-staff";
import { getStaffStats } from "@/features/staff/queries/get-staff-stats";
import StaffFilters from "@/features/staff/components/StaffFilters";
import StaffTable from "@/features/staff/components/StaffTable";
import StaffPagination from "@/features/staff/components/StaffPagination";
import StaffStatsCards from "@/features/staff/components/StaffStatsCards";
import StaffCreateForm from "@/features/staff/components/StaffCreateForm";
import {
  STAFF_DEPARTMENTS,
  STAFF_EMPLOYEE_ROLES,
  STAFF_STATUSES,
  type StaffListResult,
  type StaffStats,
} from "@/features/staff/types";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function AdminStaffPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireStaff();
  const t = await getTranslations("admin.staff");
  const tRoles = await getTranslations("admin.roles");
  const sp = await searchParams;

  const q = first(sp.q);
  const role = first(sp.role);
  const department = first(sp.department);
  const status = first(sp.status);
  const sort = first(sp.sort) || "newest";
  const page = first(sp.page) || "1";
  const canManage = isAdminOrAbove(session.profile.role);

  let result: StaffListResult;
  let stats: StaffStats;
  let loadError: string | null = null;

  try {
    [result, stats] = await Promise.all([
      listStaff({ q, role, department, status, sort, page }),
      getStaffStats(),
    ]);
  } catch (error) {
    console.error(error);
    loadError = t("errors.load");
    result = { items: [], total: 0, page: 1, pageSize: 20, totalPages: 1 };
    stats = {
      employees: 0,
      managers: 0,
      creators: 0,
      departments: 0,
      activeToday: 0,
    };
  }

  const roleLabels = Object.fromEntries(
    STAFF_EMPLOYEE_ROLES.map((value) => [value, tRoles(value as never)]),
  );
  const departmentLabels = Object.fromEntries(
    STAFF_DEPARTMENTS.map((value) => [value, t(`departments.${value}`)]),
  );
  const statusLabels = Object.fromEntries(
    STAFF_STATUSES.map((value) => [value, t(`status.${value}`)]),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-overline text-[var(--nht-gold)]">{t("label")}</p>
          <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-[var(--nht-text-secondary)]">
            {t("description")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManage ? (
            <>
              <Link
                href="/admin/staff/permissions"
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:border-[var(--nht-border-hover)]"
              >
                {t("permissionsLink")}
              </Link>
              <StaffCreateForm
                labels={{
                  create: t("create"),
                  title: t("form.title"),
                  email: t("fields.email"),
                  fullName: t("fields.fullName"),
                  role: t("fields.role"),
                  department: t("fields.department"),
                  departmentCustom: t("fields.departmentCustom"),
                  language: t("fields.language"),
                  timezone: t("fields.timezone"),
                  temporaryPassword: t("fields.temporaryPassword"),
                  phone: t("fields.phone"),
                  cancel: t("form.cancel"),
                  submit: t("form.submit"),
                  submitting: t("form.submitting"),
                  created: t("form.created"),
                }}
                roleLabels={roleLabels}
                departmentLabels={departmentLabels}
              />
            </>
          ) : null}
        </div>
      </div>

      <StaffStatsCards
        stats={stats}
        labels={{
          employees: t("stats.employees"),
          managers: t("stats.managers"),
          creators: t("stats.creators"),
          departments: t("stats.departments"),
          activeToday: t("stats.activeToday"),
        }}
      />

      <StaffFilters
        q={q}
        role={role}
        department={department}
        status={status}
        sort={sort}
        labels={{
          search: t("filters.search"),
          searchPlaceholder: t("filters.searchPlaceholder"),
          role: t("filters.role"),
          department: t("filters.department"),
          status: t("filters.status"),
          sort: t("filters.sort"),
          all: t("filters.all"),
          newest: t("filters.newest"),
          oldest: t("filters.oldest"),
          name: t("filters.name"),
          apply: t("filters.apply"),
          clear: t("filters.clear"),
        }}
        roleOptions={STAFF_EMPLOYEE_ROLES.map((value) => ({
          value,
          label: roleLabels[value] ?? value,
        }))}
        departmentOptions={STAFF_DEPARTMENTS.map((value) => ({
          value,
          label: departmentLabels[value] ?? value,
        }))}
        statusOptions={STAFF_STATUSES.map((value) => ({
          value,
          label: statusLabels[value] ?? value,
        }))}
      />

      {loadError ? (
        <div
          role="alert"
          className="rounded-[var(--nht-radius-xl)] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          {loadError}
        </div>
      ) : (
        <>
          <StaffTable
            items={result.items}
            locale={locale}
            labels={{
              avatar: t("table.avatar"),
              name: t("table.name"),
              email: t("table.email"),
              role: t("table.role"),
              department: t("table.department"),
              status: t("table.status"),
              managedCreators: t("table.managedCreators"),
              created: t("table.created"),
              lastLogin: t("table.lastLogin"),
              actions: t("table.actions"),
              view: t("table.view"),
              empty: t("empty"),
              emptyHint: t("emptyHint"),
            }}
            roleLabels={roleLabels}
            departmentLabels={departmentLabels}
            statusLabels={statusLabels}
          />
          <StaffPagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            searchParams={{ q, role, department, status, sort }}
            labels={{
              previous: t("pagination.previous"),
              next: t("pagination.next"),
              pageOf: t("pagination.pageOf"),
            }}
          />
        </>
      )}
    </div>
  );
}
