import { Link } from "@/i18n/navigation";
import {
  FileText,
  Users,
  Newspaper,
  ChartColumn,
  Settings,
  type LucideIcon,
} from "lucide-react";

type QuickAction = {
  href: "/admin/applications" | "/admin/creators" | "/admin/blog" | "/admin/analytics" | "/admin/settings";
  labelKey: "applications" | "creators" | "blog" | "analytics" | "settings";
  icon: LucideIcon;
};

const actions: QuickAction[] = [
  { href: "/admin/applications", labelKey: "applications", icon: FileText },
  { href: "/admin/creators", labelKey: "creators", icon: Users },
  { href: "/admin/blog", labelKey: "blog", icon: Newspaper },
  { href: "/admin/analytics", labelKey: "analytics", icon: ChartColumn },
  { href: "/admin/settings", labelKey: "settings", icon: Settings },
];

type DashboardQuickActionsProps = {
  labels: Record<QuickAction["labelKey"], string> & { title: string };
};

export default function DashboardQuickActions({
  labels,
}: DashboardQuickActionsProps) {
  return (
    <section>
      <h2 className="mb-4 text-sm font-medium text-white">{labels.title}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] px-4 py-4 transition-colors hover:border-[var(--nht-border-hover)] hover:bg-white/[0.04]"
            >
              <Icon
                className="h-4 w-4 text-[var(--nht-gold)] transition-colors group-hover:text-white"
                aria-hidden
              />
              <p className="mt-3 text-sm text-[var(--nht-text-secondary)] group-hover:text-white">
                {labels[action.labelKey]}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
