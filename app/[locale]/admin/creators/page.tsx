import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireStaff } from "@/lib/auth";
import { listStaffManagers } from "@/features/applications/queries/list-managers";
import type { StaffManagerOption } from "@/features/applications/types";
import { listCreators } from "@/features/creators/queries/list-creators";
import { getCreatorStats } from "@/features/creators/queries/get-creator-stats";
import type {
  CreatorStats,
  CreatorsListResult,
} from "@/features/creators/types";
import CreatorFilters from "@/features/creators/components/CreatorFilters";
import CreatorTable from "@/features/creators/components/CreatorTable";
import CreatorPagination from "@/features/creators/components/CreatorPagination";
import CreatorForm from "@/features/creators/components/CreatorForm";
import CreatorStatsCards from "@/features/creators/components/CreatorStatsCards";

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
  let stats: CreatorStats;
  let managers: StaffManagerOption[] = [];
  let loadError: string | null = null;

  try {
    [result, stats, managers] = await Promise.all([
      listCreators({ q, status, manager, country, platform, sort, page }),
      getCreatorStats(),
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
    stats = {
      total: 0,
      active: 0,
      vacation: 0,
      inactive: 0,
      currentRevenue: 0,
      averageRevenue: 0,
    };
    managers = [];
  }

  const statusLabels = {
    new: t("status.new"),
    invited: t("status.invited"),
    active: t("status.active"),
    paused: t("status.paused"),
    vacation: t("status.vacation"),
    inactive: t("status.inactive"),
    banned: t("status.banned"),
  };

  const platformLabels = {
    onlyfans: t("platforms.onlyfans"),
    fansly: t("platforms.fansly"),
    chaturbate: t("platforms.chaturbate"),
    instagram: t("platforms.instagram"),
    tiktok: t("platforms.tiktok"),
    twitter: t("platforms.twitter"),
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
            displayName: t("fields.displayName"),
            legalName: t("fields.legalName"),
            email: t("fields.email"),
            telegram: t("fields.telegram"),
            phone: t("fields.phone"),
            country: t("fields.country"),
            languages: t("fields.languages"),
            languagesPlaceholder: t("fields.languagesPlaceholder"),
            timezone: t("fields.timezone"),
            platforms: t("fields.platforms"),
            manager: t("fields.manager"),
            notes: t("fields.notes"),
            unassigned: t("unassigned"),
            cancel: t("form.cancel"),
            submit: t("form.submitInvite"),
            submitting: t("form.submittingInvite"),
            invited: t("toast.invited"),
          }}
          platformLabels={platformLabels}
        />
      </div>

      {!loadError ? (
        <CreatorStatsCards
          stats={stats}
          locale={locale}
          labels={{
            total: t("stats.total"),
            active: t("stats.active"),
            vacation: t("stats.vacation"),
            inactive: t("stats.inactive"),
            currentRevenue: t("stats.currentRevenue"),
            averageRevenue: t("stats.averageRevenue"),
          }}
        />
      ) : null}

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
          sortRevenue: t("sort.revenue"),
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
              revenue: t("table.revenue"),
              lastActivity: t("table.lastActivity"),
              actions: t("table.actions"),
              view: t("actions.view"),
              empty: t("empty.title"),
              emptyHint: t("empty.description"),
              emptyTitle: t("emptyTitle"),
              emptyDescription: t("emptyDescription"),
              emptyAction: t("emptyAction"),
              unassigned: t("unassigned"),
            }}
            statusLabels={statusLabels}
            canCreate
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
