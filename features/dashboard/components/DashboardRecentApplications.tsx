import { Link } from "@/i18n/navigation";
import type { DashboardRecentApplication } from "@/features/dashboard/types";
import { formatDateTime } from "@/features/applications/lib/format";

type DashboardRecentApplicationsProps = {
  items: DashboardRecentApplication[];
  locale: string;
  labels: {
    title: string;
    empty: string;
    name: string;
    platform: string;
    status: string;
    priority: string;
    created: string;
    viewAll: string;
  };
  statusLabels: Record<string, string>;
  priorityLabels: Record<string, string>;
};

export default function DashboardRecentApplications({
  items,
  locale,
  labels,
  statusLabels,
  priorityLabels,
}: DashboardRecentApplicationsProps) {
  return (
    <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02]">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
        <h2 className="text-sm font-medium text-white">{labels.title}</h2>
        <Link
          href="/admin/applications"
          className="text-xs text-[var(--nht-gold)] hover:text-white"
        >
          {labels.viewAll}
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-[var(--nht-text-secondary)]">
          {labels.empty}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm" aria-label={labels.title}>
            <thead>
              <tr className="text-overline text-[var(--nht-text-tertiary)]">
                <th scope="col" className="px-5 py-3 font-medium">{labels.name}</th>
                <th scope="col" className="px-5 py-3 font-medium">{labels.platform}</th>
                <th scope="col" className="px-5 py-3 font-medium">{labels.status}</th>
                <th scope="col" className="px-5 py-3 font-medium">{labels.priority}</th>
                <th scope="col" className="px-5 py-3 font-medium">{labels.created}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-white/[0.04] transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/applications/${item.id}`}
                      className="text-white hover:text-[var(--nht-gold)]"
                    >
                      {item.full_name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-[var(--nht-text-secondary)]">
                    {item.platform ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-[var(--nht-gold-muted)] px-2.5 py-1 text-xs text-[var(--nht-gold)]">
                      {statusLabels[item.status] ?? item.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[var(--nht-text-secondary)]">
                    {priorityLabels[item.priority] ?? item.priority}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-[var(--nht-text-tertiary)]">
                    {formatDateTime(item.created_at, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
