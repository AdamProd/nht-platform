import { Link } from "@/i18n/navigation";
import { Newspaper } from "lucide-react";
import type { BlogPostListItem } from "@/features/blog/posts/types";
import { formatDateTime } from "@/features/blog/posts/lib/format";
import EmptyState from "@/shared/ui/EmptyState";
import Badge from "@/shared/ui/Badge";

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
    emptyTitle?: string;
    emptyDescription?: string;
    emptyAction?: string;
  };
  statusLabels: Record<string, string>;
};

function primaryTitle(item: BlogPostListItem, locale: string, untitled: string) {
  const preferred =
    item.translations.find((t) => t.locale === locale) ??
    item.translations[0];
  return preferred?.title || untitled;
}

function statusTone(status: string) {
  switch (status) {
    case "published":
      return "success" as const;
    case "draft":
      return "neutral" as const;
    case "scheduled":
      return "info" as const;
    case "archived":
      return "danger" as const;
    default:
      return "warning" as const;
  }
}

export default function BlogTable({
  items,
  locale,
  labels,
  statusLabels,
}: BlogTableProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Newspaper}
        title={labels.emptyTitle ?? labels.empty}
        description={labels.emptyDescription}
        actionHref="/admin/blog/new"
        actionLabel={labels.emptyAction}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-[var(--nht-radius-xl)] border border-white/[0.06]">
      <table className="min-w-full text-left text-sm" aria-label={labels.title}>
        <thead className="sticky top-0 z-10 border-b border-white/[0.06] bg-[var(--nht-black-elevated)]/95 backdrop-blur">
          <tr className="text-overline text-[var(--nht-text-tertiary)]">
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.title}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.status}
            </th>
            <th
              scope="col"
              className="hidden px-4 py-3 font-medium md:table-cell"
            >
              {labels.locales}
            </th>
            <th
              scope="col"
              className="hidden px-4 py-3 font-medium lg:table-cell"
            >
              {labels.author}
            </th>
            <th
              scope="col"
              className="hidden px-4 py-3 font-medium lg:table-cell"
            >
              {labels.updated}
            </th>
            <th
              scope="col"
              className="hidden px-4 py-3 font-medium xl:table-cell"
            >
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
              className="group border-b border-white/[0.04] transition-colors hover:bg-white/[0.03]"
            >
              <td className="px-4 py-3 text-white">
                <Link
                  href={`/admin/blog/${item.id}`}
                  className="font-medium group-hover:text-[var(--nht-accent)]"
                >
                  {primaryTitle(item, locale, labels.untitled)}
                </Link>
              </td>
              <td className="px-4 py-3">
                <Badge tone={statusTone(item.status)}>
                  {statusLabels[item.status] ?? item.status}
                </Badge>
              </td>
              <td className="hidden px-4 py-3 text-[var(--nht-text-secondary)] md:table-cell">
                {item.translations.map((t) => t.locale).join(", ") || "—"}
              </td>
              <td className="hidden px-4 py-3 text-[var(--nht-text-secondary)] lg:table-cell">
                {item.author?.full_name ?? "—"}
              </td>
              <td className="hidden px-4 py-3 text-[var(--nht-text-secondary)] lg:table-cell">
                {formatDateTime(item.updated_at, locale)}
              </td>
              <td className="hidden px-4 py-3 text-[var(--nht-text-secondary)] xl:table-cell">
                {item.published_at
                  ? formatDateTime(item.published_at, locale)
                  : "—"}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/blog/${item.id}`}
                  className="text-xs font-medium text-[var(--nht-accent)] hover:text-white"
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
