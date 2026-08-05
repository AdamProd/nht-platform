import { Link } from "@/i18n/navigation";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  searchParams: Record<string, string>;
  labels: {
    previous: string;
    next: string;
    pageOf: string;
  };
};

function hrefFor(page: number, searchParams: Record<string, string>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value) params.set(key, value);
  }
  params.set("page", String(page));
  const query = params.toString();
  return `/admin/finance${query ? `?${query}` : ""}`;
}

export default function FinancePagination({
  page,
  totalPages,
  total,
  searchParams,
  labels,
}: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-[var(--nht-text-tertiary)]">
        {labels.pageOf
          .replace("{page}", String(page))
          .replace("{totalPages}", String(totalPages))
          .replace("{total}", String(total))}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            href={hrefFor(page - 1, searchParams)}
            className="rounded-full border border-white/10 px-4 py-2 text-xs text-white hover:border-[var(--nht-border-hover)]"
          >
            {labels.previous}
          </Link>
        ) : null}
        {page < totalPages ? (
          <Link
            href={hrefFor(page + 1, searchParams)}
            className="rounded-full border border-white/10 px-4 py-2 text-xs text-white hover:border-[var(--nht-border-hover)]"
          >
            {labels.next}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
