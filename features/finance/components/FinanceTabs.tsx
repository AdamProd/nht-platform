import { Link } from "@/i18n/navigation";
import type { FinanceTab } from "@/features/finance/types";

type Props = {
  active: FinanceTab;
  labels: Record<FinanceTab, string>;
  query?: Record<string, string>;
};

const TABS: FinanceTab[] = [
  "overview",
  "transactions",
  "payouts",
  "reports",
  "commissions",
];

export default function FinanceTabs({ active, labels, query = {} }: Props) {
  return (
    <div
      role="tablist"
      className="flex flex-wrap gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1"
    >
      {TABS.map((tab) => {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(query)) {
          if (value && key !== "tab" && key !== "page") params.set(key, value);
        }
        if (tab === "commissions") {
          return (
            <Link
              key={tab}
              href="/admin/finance/commissions"
              role="tab"
              aria-selected={active === tab}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                active === tab
                  ? "bg-[var(--nht-accent)] text-white"
                  : "text-[var(--nht-text-secondary)] hover:text-white"
              }`}
            >
              {labels[tab]}
            </Link>
          );
        }
        if (tab !== "overview") params.set("tab", tab);
        const qs = params.toString();
        return (
          <Link
            key={tab}
            href={qs ? `/admin/finance?${qs}` : "/admin/finance"}
            role="tab"
            aria-selected={active === tab}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              active === tab
                ? "bg-[var(--nht-accent)] text-white"
                : "text-[var(--nht-text-secondary)] hover:text-white"
            }`}
          >
            {labels[tab]}
          </Link>
        );
      })}
    </div>
  );
}
