import { Link } from "@/i18n/navigation";
import type { ApplicationListItem } from "@/features/applications/types";
import { formatDateTime } from "@/features/applications/lib/format";

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
  };
};

export default function ApplicationsTable({
  items,
  locale,
  labels,
}: ApplicationsTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-[var(--nht-radius-xl)] border border-dashed border-white/[0.1] px-6 py-16 text-center">
        <p className="text-sm text-[var(--nht-text-secondary)]">{labels.empty}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[var(--nht-radius-xl)] border border-white/[0.06]">
      <table className="min-w-full text-left text-sm" aria-label={labels.name}>
        <thead className="border-b border-white/[0.06] bg-white/[0.02]">
          <tr className="text-overline text-[var(--nht-text-tertiary)]">
            <th scope="col" className="px-4 py-3 font-medium">{labels.name}</th>
            <th scope="col" className="px-4 py-3 font-medium">{labels.email}</th>
            <th scope="col" className="px-4 py-3 font-medium">{labels.platform}</th>
            <th scope="col" className="px-4 py-3 font-medium">{labels.status}</th>
            <th scope="col" className="px-4 py-3 font-medium">{labels.priority}</th>
            <th scope="col" className="px-4 py-3 font-medium">{labels.manager}</th>
            <th scope="col" className="px-4 py-3 font-medium">{labels.created}</th>
            <th scope="col" className="px-4 py-3 font-medium">{labels.actions}</th>
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
                  href={`/admin/applications/${item.id}`}
                  className="hover:text-[var(--nht-gold)]"
                >
                  {item.full_name}
                </Link>
              </td>
              <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                {item.email}
              </td>
              <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                {item.platform ?? "—"}
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-white/[0.04] px-2.5 py-1 text-xs text-[var(--nht-gold)]">
                  {item.status}
                </span>
              </td>
              <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                {item.priority}
              </td>
              <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                {item.manager?.full_name ?? labels.unassigned}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-[var(--nht-text-tertiary)]">
                {formatDateTime(item.created_at, locale)}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/applications/${item.id}`}
                  className="text-xs font-medium text-[var(--nht-gold)] hover:text-white"
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
