import { Link } from "@/i18n/navigation";
import { Users } from "lucide-react";
import type { StaffListItem } from "@/features/staff/types";
import {
  formatStaffDate,
  formatStaffDateTime,
  staffDisplayName,
} from "@/features/staff/lib/format";
import EmptyState from "@/shared/ui/EmptyState";
import UserAvatar, { roleTone } from "@/shared/ui/UserAvatar";
import Badge from "@/shared/ui/Badge";

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
    emptyTitle?: string;
    emptyDescription?: string;
    emptyAction?: string;
    never: string;
  };
  roleLabels: Record<string, string>;
  departmentLabels: Record<string, string>;
  statusLabels: Record<string, string>;
  canCreate?: boolean;
};

function statusTone(status: string | null | undefined) {
  switch (status) {
    case "active":
      return "success" as const;
    case "invited":
      return "info" as const;
    case "vacation":
      return "warning" as const;
    case "suspended":
    case "disabled":
    case "archived":
      return "danger" as const;
    default:
      return "neutral" as const;
  }
}

export default function StaffTable({
  items,
  locale,
  labels,
  roleLabels,
  departmentLabels,
  statusLabels,
  canCreate = false,
}: Props) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title={labels.emptyTitle ?? labels.empty}
        description={labels.emptyDescription ?? labels.emptyHint}
        actionHref={canCreate ? "/admin/staff" : undefined}
        actionLabel={canCreate ? labels.emptyAction : undefined}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-[var(--nht-radius-xl)] border border-white/[0.06]">
      <table className="min-w-full text-left text-sm" aria-label={labels.name}>
        <thead className="sticky top-0 z-10 border-b border-white/[0.06] bg-[var(--nht-black-elevated)]/95 backdrop-blur">
          <tr className="text-overline text-[var(--nht-text-tertiary)]">
            <th className="px-4 py-3 font-medium">{labels.avatar}</th>
            <th className="px-4 py-3 font-medium">{labels.name}</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">
              {labels.email}
            </th>
            <th className="px-4 py-3 font-medium">{labels.role}</th>
            <th className="hidden px-4 py-3 font-medium lg:table-cell">
              {labels.department}
            </th>
            <th className="px-4 py-3 font-medium">{labels.status}</th>
            <th className="hidden px-4 py-3 text-right font-medium xl:table-cell">
              {labels.managedCreators}
            </th>
            <th className="hidden px-4 py-3 font-medium xl:table-cell">
              {labels.created}
            </th>
            <th className="hidden px-4 py-3 font-medium 2xl:table-cell">
              {labels.lastLogin}
            </th>
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
                  ? (departmentLabels[item.department] ?? item.department)
                  : "—";
            return (
              <tr
                key={item.id}
                className="group border-b border-white/[0.04] transition-colors hover:bg-white/[0.03]"
              >
                <td className="px-4 py-3">
                  <UserAvatar
                    name={name}
                    src={item.avatar_url}
                    tone={roleTone(item.role)}
                  />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/staff/${item.id}`}
                    className="font-medium text-white group-hover:text-[var(--nht-accent)]"
                  >
                    {name}
                  </Link>
                </td>
                <td className="hidden px-4 py-3 text-[var(--nht-text-secondary)] md:table-cell">
                  {item.email || "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge tone="accent">
                    {roleLabels[item.role] ?? item.role}
                  </Badge>
                </td>
                <td className="hidden px-4 py-3 text-[var(--nht-text-secondary)] lg:table-cell">
                  {dept}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(item.status)}>
                    {item.status
                      ? (statusLabels[item.status] ?? item.status)
                      : "—"}
                  </Badge>
                </td>
                <td className="hidden px-4 py-3 text-right text-[var(--nht-text-secondary)] xl:table-cell">
                  {item.managed_creators_count}
                </td>
                <td className="hidden px-4 py-3 text-[var(--nht-text-secondary)] xl:table-cell">
                  {formatStaffDate(item.created_at, locale)}
                </td>
                <td className="hidden px-4 py-3 text-[var(--nht-text-secondary)] 2xl:table-cell">
                  {formatStaffDateTime(
                    item.last_login_at,
                    locale,
                    labels.never,
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/staff/${item.id}`}
                    className="text-xs font-medium text-[var(--nht-accent)] hover:text-white"
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
