import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { listApplications } from "@/features/applications/queries/list-applications";
import ApplicationsFilters from "@/features/applications/components/ApplicationsFilters";
import ApplicationsTable from "@/features/applications/components/ApplicationsTable";
import ApplicationsPagination from "@/features/applications/components/ApplicationsPagination";
import ErrorState from "@/shared/ui/ErrorState";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function AdminApplicationsPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.applications");
  const sp = await searchParams;

  const q = first(sp.q);
  const status = first(sp.status);
  const priority = first(sp.priority);
  const page = first(sp.page) || "1";

  let result;
  let loadError: string | null = null;

  try {
    result = await listApplications({ q, status, priority, page });
  } catch (error) {
    console.error(error);
    loadError = t("errors.load");
    result = {
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    };
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-overline text-[var(--nht-gold)]">{t("label")}</p>
        <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-[var(--nht-text-secondary)]">
          {t("description")}
        </p>
      </div>

      <ApplicationsFilters
        q={q}
        status={status}
        priority={priority}
        labels={{
          search: t("filters.search"),
          searchPlaceholder: t("filters.searchPlaceholder"),
          status: t("filters.status"),
          priority: t("filters.priority"),
          all: t("filters.all"),
          apply: t("filters.apply"),
          clear: t("filters.clear"),
        }}
      />

      {loadError ? (
        <ErrorState
          title={loadError}
          retryHref="/admin/applications"
          retryLabel={t("filters.clear")}
        />
      ) : (
        <>
          <ApplicationsTable
            items={result.items}
            locale={locale}
            labels={{
              name: t("table.name"),
              email: t("table.email"),
              platform: t("table.platform"),
              status: t("table.status"),
              priority: t("table.priority"),
              manager: t("table.manager"),
              created: t("table.created"),
              actions: t("table.actions"),
              view: t("table.view"),
              empty: t("empty"),
              unassigned: t("unassigned"),
              emptyTitle: t("emptyTitle"),
              emptyDescription: t("emptyDescription"),
            }}
            statusLabels={{
              new: t("statusValues.new"),
              reviewing: t("statusValues.reviewing"),
              contacted: t("statusValues.contacted"),
              meeting: t("statusValues.meeting"),
              active: t("statusValues.active"),
              rejected: t("statusValues.rejected"),
              archived: t("statusValues.archived"),
            }}
            priorityLabels={{
              low: t("priorityValues.low"),
              normal: t("priorityValues.normal"),
              high: t("priorityValues.high"),
              urgent: t("priorityValues.urgent"),
            }}
          />

          <ApplicationsPagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            query={{ q, status, priority }}
            labels={{
              previous: t("pagination.previous"),
              next: t("pagination.next"),
              pageOf: t("pagination.pageOf", {
                page: result.page,
                totalPages: result.totalPages,
                total: result.total,
              }),
            }}
          />
        </>
      )}

      <Link
        href="/admin"
        className="inline-block text-xs text-[var(--nht-text-tertiary)] hover:text-[var(--nht-gold)]"
      >
        ← {t("backToDashboard")}
      </Link>
    </div>
  );
}
