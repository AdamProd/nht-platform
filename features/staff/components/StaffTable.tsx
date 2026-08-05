import { Link } from "@/i18n/navigation";
import type { StaffListItem } from "@/features/staff/types";
import {
  formatStaffDate,
  formatStaffDateTime,
  staffDisplayName,
  staffInitials,
} from "@/features/staff/lib/format";

type Props = {
  items: StaffListItem[];
  locale: string;
  labels: {
    avatar: string;
    name: string;
    email: string;
    role: string;
    department: string;
    status: string;
    managedCreators: string;
    created: string;
    lastLogin: string;
    actions: string;
    view: string;
    empty: string;
    emptyHint: string;
  };
  roleLabels: Record<string, string>;
  departmentLabels: Record<string, string>;
  statusLabels: Record<string, string>;
};

export default function StaffTable({
  items,
  locale,
  labels,
  roleLabels,
  departmentLabels,
  statusLabels,
}: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-[var(--nht-radius-xl)] border border-dashed border-white/[0.1] px-6 py-16 text-center">
        <p className="text-sm text-[var(--nht-text-secondary)]">{labels.empty}</p>
        <p className="mt-2 text-xs text-[var(--nht-text-tertiary)]">
          {labels.emptyHint}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[var(--nht-radius-xl)] border border-white/[0.06]">
      <table className="min-w-full text-left text-sm" aria-label={labels.name}>
        <thead className="border-b border-white/[0.06] bg-white/[0.02]">
          <tr className="text-overline text-[var(--nht-text-tertiary)]">
            <th className="px-4 py-3 font-medium">{labels.avatar}</th>
            <th className="px-4 py-3 font-medium">{labels.name}</th>
            <th className="px-4 py-3 font-medium">{labels.email}</th>
            <th className="px-4 py-3 font-medium">{labels.role}</th>
            <th className="px-4 py-3 font-medium">{labels.department}</th>
            <th className="px-4 py-3 font-medium">{labels.status}</th>
            <th className="px-4 py-3 font-medium">{labels.managedCreators}</th>
            <th className="px-4 py-3 font-medium">{labels.created}</th>
            <th className="px-4 py-3 font-medium">{labels.lastLogin}</th>
            <th className="px-4 py-3 font-medium">{labels.actions}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const name = staffDisplayName(item);
            const dept =
              item.department === "custom"
                ? item.department_custom || departmentLabels.custom
                : item.department
                  ? departmentLabels[item.department] ?? item.department
                  : "—";
            return (
              <tr
                key={item.id}
                className="border-b border-white/[0.04] hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.04] text-[10px] font-medium text-[var(--nht-gold)]">
                    {item.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.avatar_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      staffInitials(name)
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-white">{name}</td>
                <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                  {item.email || "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-[var(--nht-gold)]">
                    {roleLabels[item.role] ?? item.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                  {dept}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-[var(--nht-text-secondary)]">
                    {item.status
                      ? (statusLabels[item.status] ?? item.status)
                      : "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                  {item.managed_creators_count}
                </td>
                <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                  {formatStaffDate(item.created_at, locale)}
                </td>
                <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                  {formatStaffDateTime(item.last_login_at, locale)}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/staff/${item.id}`}
                    className="text-xs text-[var(--nht-gold)] hover:text-white"
                  >
                    {labels.view}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
