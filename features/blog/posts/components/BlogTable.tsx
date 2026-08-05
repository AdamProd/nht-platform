import { Link } from "@/i18n/navigation";
import type { BlogPostListItem } from "@/features/blog/posts/types";
import { formatDateTime } from "@/features/blog/posts/lib/format";

type BlogTableProps = {
  items: BlogPostListItem[];
  locale: string;
  labels: {
    title: string;
    status: string;
    locales: string;
    author: string;
    updated: string;
    published: string;
    actions: string;
    edit: string;
    empty: string;
    untitled: string;
  };
  statusLabels: Record<string, string>;
};

function primaryTitle(item: BlogPostListItem, locale: string, untitled: string) {
  const preferred =
    item.translations.find((t) => t.locale === locale) ??
    item.translations[0];
  return preferred?.title || untitled;
}

export default function BlogTable({
  items,
  locale,
  labels,
  statusLabels,
}: BlogTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-[var(--nht-radius-xl)] border border-dashed border-white/[0.1] px-6 py-16 text-center">
        <p className="text-sm text-[var(--nht-text-secondary)]">{labels.empty}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[var(--nht-radius-xl)] border border-white/[0.06]">
      <table className="min-w-full text-left text-sm" aria-label={labels.title}>
        <thead className="border-b border-white/[0.06] bg-white/[0.02]">
          <tr className="text-overline text-[var(--nht-text-tertiary)]">
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.title}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.status}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.locales}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.author}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.updated}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.published}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.actions}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
            >
              <td className="px-4 py-3 text-white">
                <Link
                  href={`/admin/blog/${item.id}`}
                  className="hover:text-[var(--nht-accent-warm)]"
                >
                  {primaryTitle(item, locale, labels.untitled)}
                </Link>
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-white/[0.04] px-2.5 py-1 text-xs text-[var(--nht-accent-warm)]">
                  {statusLabels[item.status] ?? item.status}
                </span>
              </td>
              <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                {item.translations.map((t) => t.locale.toUpperCase()).join(", ") ||
                  "—"}
              </td>
              <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                {item.author?.full_name ?? "—"}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-[var(--nht-text-tertiary)]">
                {formatDateTime(item.updated_at, locale)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-[var(--nht-text-tertiary)]">
                {formatDateTime(item.published_at, locale)}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/blog/${item.id}`}
                  className="text-xs font-medium text-[var(--nht-accent-warm)] hover:text-white"
                >
                  {labels.edit}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
