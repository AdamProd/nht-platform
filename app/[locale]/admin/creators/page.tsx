import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireStaff } from "@/lib/auth";
import { listStaffManagers } from "@/features/applications/queries/list-managers";
import type { StaffManagerOption } from "@/features/applications/types";
import { listCreators } from "@/features/creators/queries/list-creators";
import type { CreatorsListResult } from "@/features/creators/types";
import CreatorFilters from "@/features/creators/components/CreatorFilters";
import CreatorTable from "@/features/creators/components/CreatorTable";
import CreatorPagination from "@/features/creators/components/CreatorPagination";
import CreatorForm from "@/features/creators/components/CreatorForm";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function AdminCreatorsPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireStaff();
  const t = await getTranslations("admin.creators");
  const sp = await searchParams;

  const q = first(sp.q);
  const status = first(sp.status);
  const manager = first(sp.manager);
  const country = first(sp.country);
  const platform = first(sp.platform);
  const sort = first(sp.sort) || "newest";
  const page = first(sp.page) || "1";

  const canAssignManager =
    session.profile.role === "owner" || session.profile.role === "admin";

  let result: CreatorsListResult;
  let managers: StaffManagerOption[] = [];
  let loadError: string | null = null;

  try {
    [result, managers] = await Promise.all([
      listCreators({ q, status, manager, country, platform, sort, page }),
      listStaffManagers(),
    ]);
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
    managers = [];
  }

  const statusLabels = {
    new: t("status.new"),
    active: t("status.active"),
    paused: t("status.paused"),
    vacation: t("status.vacation"),
    inactive: t("status.inactive"),
    banned: t("status.banned"),
  };

  const platformLabels = {
    onlyfans: t("platforms.onlyfans"),
    fansly: t("platforms.fansly"),
    manyvids: t("platforms.manyvids"),
    multiple: t("platforms.multiple"),
    emerging: t("platforms.emerging"),
    other: t("platforms.other"),
  };

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
        <CreatorForm
          managers={managers}
          canAssignManager={canAssignManager}
          labels={{
            create: t("create"),
            title: t("form.title"),
            fullName: t("fields.fullName"),
            email: t("fields.email"),
            telegram: t("fields.telegram"),
            country: t("fields.country"),
            languages: t("fields.languages"),
            languagesPlaceholder: t("fields.languagesPlaceholder"),
            platforms: t("fields.platforms"),
            manager: t("fields.manager"),
            status: t("fields.status"),
            notes: t("fields.notes"),
            unassigned: t("unassigned"),
            cancel: t("form.cancel"),
            submit: t("form.submit"),
            submitting: t("form.submitting"),
            created: t("toast.created"),
          }}
          statusLabels={statusLabels}
          platformLabels={platformLabels}
        />
      </div>

      <CreatorFilters
        q={q}
        status={status}
        manager={manager}
        country={country}
        platform={platform}
        sort={sort}
        managers={managers}
        canFilterManager={canAssignManager}
        labels={{
          search: t("filters.search"),
          searchPlaceholder: t("filters.searchPlaceholder"),
          status: t("filters.status"),
          manager: t("filters.manager"),
          country: t("filters.country"),
          platform: t("filters.platform"),
          sort: t("filters.sort"),
          all: t("filters.all"),
          apply: t("filters.apply"),
          clear: t("filters.clear"),
          sortNewest: t("sort.newest"),
          sortOldest: t("sort.oldest"),
          sortName: t("sort.name"),
          unassigned: t("unassigned"),
        }}
        statusLabels={statusLabels}
        platformLabels={platformLabels}
      />

      {loadError ? (
        <div className="rounded-[var(--nht-radius-xl)] border border-white/[0.08] bg-white/[0.03] px-5 py-4 text-sm text-[var(--nht-text-secondary)]">
          {loadError}
        </div>
      ) : (
        <>
          <CreatorTable
            items={result.items}
            locale={locale}
            labels={{
              avatar: t("table.avatar"),
              name: t("table.name"),
              email: t("table.email"),
              country: t("table.country"),
              platforms: t("table.platforms"),
              manager: t("table.manager"),
              status: t("table.status"),
              created: t("table.created"),
              actions: t("table.actions"),
              view: t("actions.view"),
              empty: t("empty.title"),
              emptyHint: t("empty.description"),
              unassigned: t("unassigned"),
            }}
            statusLabels={statusLabels}
          />

          <CreatorPagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            query={{ q, status, manager, country, platform, sort }}
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
    </div>
  );
}
