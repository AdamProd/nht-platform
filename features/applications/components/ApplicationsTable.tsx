import { Link } from "@/i18n/navigation";
import { FileText } from "lucide-react";
import type { ApplicationListItem } from "@/features/applications/types";
import { formatDateTime } from "@/features/applications/lib/format";
import EmptyState from "@/shared/ui/EmptyState";
import Badge from "@/shared/ui/Badge";

type ApplicationsTableProps = {
  items: ApplicationListItem[];
  locale: string;
  labels: {
    name: string;
    email: string;
    platform: string;
    status: string;
    priority: string;
    manager: string;
    created: string;
    actions: string;
    view: string;
    empty: string;
    unassigned: string;
    emptyTitle?: string;
    emptyDescription?: string;
  };
  statusLabels?: Record<string, string>;
  priorityLabels?: Record<string, string>;
};

function statusTone(status: string) {
  switch (status) {
    case "active":
      return "success" as const;
    case "new":
      return "accent" as const;
    case "rejected":
    case "archived":
      return "danger" as const;
    case "meeting":
    case "contacted":
      return "info" as const;
    default:
      return "warning" as const;
  }
}

export default function ApplicationsTable({
  items,
  locale,
  labels,
  statusLabels,
  priorityLabels,
}: ApplicationsTableProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={labels.emptyTitle ?? labels.empty}
        description={labels.emptyDescription}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-[var(--nht-radius-xl)] border border-white/[0.06]">
      <table className="min-w-full text-left text-sm" aria-label={labels.name}>
        <thead className="sticky top-0 z-10 border-b border-white/[0.06] bg-[var(--nht-black-elevated)]/95 backdrop-blur">
          <tr className="text-overline text-[var(--nht-text-tertiary)]">
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.name}
            </th>
            <th
              scope="col"
              className="hidden px-4 py-3 font-medium md:table-cell"
            >
              {labels.email}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.platform}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {labels.status}
            </th>
            <th
              scope="col"
              className="hidden px-4 py-3 font-medium lg:table-cell"
            >
              {labels.priority}
            </th>
            <th
              scope="col"
              className="hidden px-4 py-3 font-medium xl:table-cell"
            >
              {labels.manager}
            </th>
            <th
              scope="col"
              className="hidden px-4 py-3 font-medium lg:table-cell"
            >
              {labels.created}
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
                  href={`/admin/applications/${item.id}`}
                  className="font-medium group-hover:text-[var(--nht-accent)]"
                >
                  {item.full_name}
                </Link>
              </td>
              <td className="hidden px-4 py-3 text-[var(--nht-text-secondary)] md:table-cell">
                {item.email}
              </td>
              <td className="px-4 py-3">
                <Badge tone="info">{item.platform ?? "—"}</Badge>
              </td>
              <td className="px-4 py-3">
                <Badge tone={statusTone(item.status)}>
                  {statusLabels?.[item.status] ?? item.status}
                </Badge>
              </td>
              <td className="hidden px-4 py-3 text-[var(--nht-text-secondary)] lg:table-cell">
                {priorityLabels?.[item.priority] ?? item.priority}
              </td>
              <td className="hidden px-4 py-3 text-[var(--nht-text-secondary)] xl:table-cell">
                {item.manager?.full_name ?? labels.unassigned}
              </td>
              <td className="hidden whitespace-nowrap px-4 py-3 text-[var(--nht-text-tertiary)] lg:table-cell">
                {formatDateTime(item.created_at, locale)}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/applications/${item.id}`}
                  className="text-xs font-medium text-[var(--nht-accent)] hover:text-white"
                >
                  {labels.view}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
