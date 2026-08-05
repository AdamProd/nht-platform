import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireStaff } from "@/lib/auth";
import { listActivityLogs } from "@/features/core/activity";
import {
  ActivityFilters,
  ActivityTimeline,
} from "@/features/core/activity/ui";
import { EventsPagination } from "@/features/core/notifications/ui";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function AdminActivityPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaff();
  const t = await getTranslations("admin.activity");
  const tRoles = await getTranslations("admin.roles");
  const sp = await searchParams;

  const q = first(sp.q);
  const moduleFilter = first(sp.module);
  const page = first(sp.page) || "1";

  let loadError: string | null = null;
  let list: Awaited<ReturnType<typeof listActivityLogs>>;

  try {
    list = await listActivityLogs({ q, module: moduleFilter, page });
  } catch (error) {
    console.error(error);
    loadError = t("errors.load");
    list = { items: [], total: 0, page: 1, pageSize: 30, totalPages: 1 };
  }

  const moduleLabels = {
    applications: t("modules.applications"),
    creators: t("modules.creators"),
    cabinet: t("modules.cabinet"),
    finance: t("modules.finance"),
    admin: t("modules.admin"),
    auth: t("modules.auth"),
    blog: t("modules.blog"),
    analytics: t("modules.analytics"),
    settings: t("modules.settings"),
    tasks: t("modules.tasks"),
    calendar: t("modules.calendar"),
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="space-y-2">
        <p className="text-overline text-[var(--nht-gold)]">{t("label")}</p>
        <h1 className="text-3xl font-medium tracking-tight text-white sm:text-4xl">
          {t("title")}
        </h1>
        <p className="max-w-2xl text-sm text-[var(--nht-text-secondary)]">
          {t("description")}
        </p>
      </header>

      <ActivityFilters
        q={q}
        module={moduleFilter}
        modules={Object.entries(moduleLabels).map(([value, label]) => ({
          value,
          label,
        }))}
        labels={{
          search: t("filters.search"),
          searchPlaceholder: t("filters.searchPlaceholder"),
          module: t("filters.module"),
          all: t("filters.all"),
          apply: t("filters.apply"),
          clear: t("filters.clear"),
        }}
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
          <ActivityTimeline
            items={list.items}
            labels={{
              empty: t("empty"),
              expand: t("expandPayload"),
              collapse: t("collapsePayload"),
              unknownActor: t("unknownActor"),
            }}
            moduleLabels={moduleLabels}
            roleLabels={{
              owner: tRoles("owner"),
              admin: tRoles("admin"),
              manager: tRoles("manager"),
              creator: tRoles("creator"),
              guest: tRoles("guest"),
            }}
          />
          <EventsPagination
            basePath="/admin/activity"
            page={list.page}
            totalPages={list.totalPages}
            total={list.total}
            searchParams={{ q, module: moduleFilter }}
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
