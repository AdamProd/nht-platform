import { Link } from "@/i18n/navigation";
import {
  creatorSortValues,
  creatorStatuses,
} from "@/features/creators/schemas/creator.schema";
import { CREATOR_PLATFORMS } from "@/features/creators/types";
import type { StaffManagerOption } from "@/features/applications/types";

type CreatorFiltersProps = {
  q: string;
  status: string;
  manager: string;
  country: string;
  platform: string;
  sort: string;
  managers: StaffManagerOption[];
  canFilterManager: boolean;
  labels: {
    search: string;
    searchPlaceholder: string;
    status: string;
    manager: string;
    country: string;
    platform: string;
    sort: string;
    all: string;
    apply: string;
    clear: string;
    sortNewest: string;
    sortOldest: string;
    sortName: string;
    unassigned: string;
  };
  statusLabels: Record<string, string>;
  platformLabels: Record<string, string>;
};

export default function CreatorFilters({
  q,
  status,
  manager,
  country,
  platform,
  sort,
  managers,
  canFilterManager,
  labels,
  statusLabels,
  platformLabels,
}: CreatorFiltersProps) {
  return (
    <form
      method="get"
      className="grid gap-3 rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
    >
      <label className="block sm:col-span-2 xl:col-span-2">
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
          {labels.status}
        </span>
        <select name="status" defaultValue={status} className="nht-input">
          <option value="">{labels.all}</option>
          {creatorStatuses.map((value) => (
            <option key={value} value={value}>
              {statusLabels[value] ?? value}
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

      <label className="block">
        <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
          {labels.country}
        </span>
        <input
          name="country"
          defaultValue={country}
          className="nht-input"
        />
      </label>

      <label className="block">
        <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
          {labels.platform}
        </span>
        <select name="platform" defaultValue={platform} className="nht-input">
          <option value="">{labels.all}</option>
          {CREATOR_PLATFORMS.map((value) => (
            <option key={value} value={value}>
              {platformLabels[value] ?? value}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
          {labels.sort}
        </span>
        <select name="sort" defaultValue={sort || "newest"} className="nht-input">
          {creatorSortValues.map((value) => (
            <option key={value} value={value}>
              {value === "newest"
                ? labels.sortNewest
                : value === "oldest"
                  ? labels.sortOldest
                  : labels.sortName}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-end gap-2 sm:col-span-2 xl:col-span-6">
        <button
          type="submit"
          className="accent-gradient-bg flex-1 rounded-full py-3 text-sm font-semibold text-white sm:flex-none sm:px-8"
        >
          {labels.apply}
        </button>
        <Link
          href="/admin/creators"
          className="rounded-full border border-white/10 px-4 py-3 text-sm text-white transition-colors hover:bg-white/[0.05]"
        >
          {labels.clear}
        </Link>
      </div>
    </form>
  );
}
