import { Link } from "@/i18n/navigation";
import type {
  FinanceCreatorOption,
  FinanceManagerOption,
  FinancePlatform,
  FinanceTransactionStatus,
} from "@/features/finance/types";
import { FINANCE_PLATFORMS } from "@/features/finance/types";
import { financeStatuses } from "@/features/finance/schemas/finance.schema";

type Props = {
  q: string;
  status: string;
  platform: string;
  creator: string;
  manager: string;
  from: string;
  to: string;
  creators: FinanceCreatorOption[];
  managers: FinanceManagerOption[];
  canFilterManager: boolean;
  labels: {
    search: string;
    searchPlaceholder: string;
    status: string;
    platform: string;
    creator: string;
    manager: string;
    from: string;
    to: string;
    all: string;
    apply: string;
    clear: string;
  };
  statusLabels: Record<FinanceTransactionStatus, string>;
  platformLabels: Record<FinancePlatform, string>;
};

export default function FinanceFilters({
  q,
  status,
  platform,
  creator,
  manager,
  from,
  to,
  creators,
  managers,
  canFilterManager,
  labels,
  statusLabels,
  platformLabels,
}: Props) {
  return (
    <form
      className="grid gap-3 rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-4 sm:grid-cols-2 lg:grid-cols-4"
      method="get"
    >
      <label className="block lg:col-span-2">
        <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
          {labels.search}
        </span>
        <input
          name="q"
          defaultValue={q}
          placeholder={labels.searchPlaceholder}
          className="nht-input"
        />
      </label>
      <label className="block">
        <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
          {labels.from}
        </span>
        <input name="from" type="date" defaultValue={from} className="nht-input" />
      </label>
      <label className="block">
        <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
          {labels.to}
        </span>
        <input name="to" type="date" defaultValue={to} className="nht-input" />
      </label>
      <label className="block">
        <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
          {labels.status}
        </span>
        <select name="status" defaultValue={status} className="nht-input">
          <option value="">{labels.all}</option>
          {financeStatuses.map((value) => (
            <option key={value} value={value}>
              {statusLabels[value]}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
          {labels.platform}
        </span>
        <select name="platform" defaultValue={platform} className="nht-input">
          <option value="">{labels.all}</option>
          {FINANCE_PLATFORMS.map((value) => (
            <option key={value} value={value}>
              {platformLabels[value]}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
          {labels.creator}
        </span>
        <select name="creator" defaultValue={creator} className="nht-input">
          <option value="">{labels.all}</option>
          {creators.map((item) => (
            <option key={item.id} value={item.id}>
              {item.display_name || item.full_name}
            </option>
          ))}
        </select>
      </label>
      {canFilterManager ? (
        <label className="block">
          <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
            {labels.manager}
          </span>
          <select name="manager" defaultValue={manager} className="nht-input">
            <option value="">{labels.all}</option>
            {managers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.full_name ?? item.id.slice(0, 8)}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-4">
        <button
          type="submit"
          className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-white transition-colors hover:border-[var(--nht-border-hover)] hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nht-gold)]"
        >
          {labels.apply}
        </button>
        <Link
          href="/admin/finance"
          className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-[var(--nht-text-secondary)] transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nht-gold)]"
        >
          {labels.clear}
        </Link>
      </div>
    </form>
  );
}
