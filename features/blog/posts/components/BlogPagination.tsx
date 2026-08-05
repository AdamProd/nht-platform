import { Link } from "@/i18n/navigation";

type BlogPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  query: Record<string, string | undefined>;
  labels: {
    previous: string;
    next: string;
    pageOf: string;
  };
};

function buildHref(
  page: number,
  query: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.status) params.set("status", query.status);
  if (query.locale) params.set("locale", query.locale);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/blog?${qs}` : "/admin/blog";
}

export default function BlogPagination({
  page,
  totalPages,
  total,
  query,
  labels,
}: BlogPaginationProps) {
  if (total === 0) return null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-[var(--nht-text-tertiary)]">{labels.pageOf}</p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            href={buildHref(page - 1, query)}
            className="rounded-full border border-white/10 px-4 py-2 text-xs text-white hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nht-accent)]"
          >
            {labels.previous}
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="rounded-full border border-white/[0.04] px-4 py-2 text-xs text-[var(--nht-text-muted)]"
          >
            {labels.previous}
          </span>
        )}
        {page < totalPages ? (
          <Link
            href={buildHref(page + 1, query)}
            className="rounded-full border border-white/10 px-4 py-2 text-xs text-white hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nht-accent)]"
          >
            {labels.next}
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="rounded-full border border-white/[0.04] px-4 py-2 text-xs text-[var(--nht-text-muted)]"
          >
            {labels.next}
          </span>
        )}
      </div>
    </div>
  );
}
