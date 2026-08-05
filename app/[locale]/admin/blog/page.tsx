import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { listPosts } from "@/features/blog/posts/queries/list-posts";
import BlogFilters from "@/features/blog/posts/components/BlogFilters";
import BlogTable from "@/features/blog/posts/components/BlogTable";
import BlogPagination from "@/features/blog/posts/components/BlogPagination";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function AdminBlogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.blog");
  const sp = await searchParams;

  const q = first(sp.q);
  const status = first(sp.status);
  const localeFilter = first(sp.locale);
  const page = first(sp.page) || "1";

  let result;
  let loadError: string | null = null;

  try {
    result = await listPosts({ q, status, locale: localeFilter, page });
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

  const statusLabels = {
    draft: t("statuses.draft"),
    published: t("statuses.published"),
    archived: t("statuses.archived"),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-overline text-[var(--nht-accent-warm)]">{t("label")}</p>
          <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-[var(--nht-text-secondary)]">
            {t("description")}
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="accent-gradient-bg inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white shadow-[var(--nht-shadow-glow)]"
        >
          {t("newPost")}
        </Link>
      </div>

      <BlogFilters
        q={q}
        status={status}
        localeFilter={localeFilter}
        statusLabels={statusLabels}
        labels={{
          search: t("filters.search"),
          searchPlaceholder: t("filters.searchPlaceholder"),
          status: t("filters.status"),
          locale: t("filters.locale"),
          all: t("filters.all"),
          apply: t("filters.apply"),
          clear: t("filters.clear"),
        }}
      />

      {loadError ? (
        <p className="text-sm text-[var(--nht-text-secondary)]" role="alert">
          {loadError}
        </p>
      ) : null}

      <BlogTable
        items={result.items}
        locale={locale}
        statusLabels={statusLabels}
        labels={{
          title: t("table.title"),
          status: t("table.status"),
          locales: t("table.locales"),
          author: t("table.author"),
          updated: t("table.updated"),
          published: t("table.published"),
          actions: t("table.actions"),
          edit: t("table.edit"),
          empty: t("empty"),
          untitled: t("untitled"),
        }}
      />

      <BlogPagination
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
        query={{ q, status, locale: localeFilter }}
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
    </div>
  );
}
