import { Link } from "@/i18n/navigation";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  labels: { previous: string; next: string; of: string };
  query: Record<string, string>;
};

function hrefFor(page: number, query: Record<string, string>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value && key !== "page") params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/tasks?${qs}` : "/admin/tasks";
}

export default function TaskPagination({
  page,
  totalPages,
  total,
  labels,
  query,
}: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--nht-text-tertiary)]">
      <span>
        {page} {labels.of} {totalPages} · {total}
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            href={hrefFor(page - 1, query)}
            className="rounded-full border border-white/10 px-3 py-1.5 text-white"
          >
            {labels.previous}
          </Link>
        ) : null}
        {page < totalPages ? (
          <Link
            href={hrefFor(page + 1, query)}
            className="rounded-full border border-white/10 px-3 py-1.5 text-white"
          >
            {labels.next}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
