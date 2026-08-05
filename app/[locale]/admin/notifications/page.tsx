import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireStaff } from "@/lib/auth";
import { listNotifications } from "@/features/core/notifications";
import {
  NotificationsFilters,
  NotificationsList,
  EventsPagination,
} from "@/features/core/notifications/ui";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function AdminNotificationsPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaff();
  const t = await getTranslations("admin.notifications");
  const tUx = await getTranslations("common.ux");
  const sp = await searchParams;

  const q = first(sp.q);
  const status = first(sp.status);
  const page = first(sp.page) || "1";

  let loadError: string | null = null;
  let list: Awaited<ReturnType<typeof listNotifications>>;

  try {
    list = await listNotifications({ q, status, page });
  } catch (error) {
    console.error(error);
    loadError = t("errors.load");
    list = { items: [], total: 0, page: 1, pageSize: 20, totalPages: 1 };
  }

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

      <NotificationsFilters
        q={q}
        status={status}
        labels={{
          search: t("filters.search"),
          searchPlaceholder: t("filters.searchPlaceholder"),
          status: t("filters.status"),
          all: t("filters.all"),
          unread: t("filters.unread"),
          read: t("filters.read"),
          archived: t("filters.archived"),
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
          <NotificationsList
            items={list.items}
            labels={{
              empty: t("empty"),
              emptyTitle: t("emptyTitle"),
              emptyDescription: t("emptyDescription"),
              markRead: t("actions.markRead"),
              archive: t("actions.archive"),
              delete: t("actions.delete"),
              markAll: t("actions.markAll"),
              unreadBadge: t("unreadBadge"),
              cancel: tUx("cancel"),
              confirmArchive: t("actions.confirmArchive"),
              confirmDelete: t("actions.confirmDelete"),
            }}
          />
          <EventsPagination
            basePath="/admin/notifications"
            page={list.page}
            totalPages={list.totalPages}
            total={list.total}
            searchParams={{ q, status }}
            labels={{
              previous: t("pagination.previous"),
              next: t("pagination.next"),
              pageOf: t("pagination.pageOf", {
                page: list.page,
                totalPages: list.totalPages,
                total: list.total,
              }),
            }}
          />
        </>
      )}
    </div>
  );
}
