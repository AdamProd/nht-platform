import { Link } from "@/i18n/navigation";
import DebouncedSearchInput from "@/shared/ui/DebouncedSearchInput";
import { locales } from "@/i18n/routing";
import { blogStatuses } from "@/features/blog/posts/types";

type BlogFiltersProps = {
  q: string;
  status: string;
  localeFilter: string;
  labels: {
    search: string;
    searchPlaceholder: string;
    status: string;
    locale: string;
    all: string;
    apply: string;
    clear: string;
  };
  statusLabels: Record<string, string>;
};

export default function BlogFilters({
  q,
  status,
  localeFilter,
  labels,
  statusLabels,
}: BlogFiltersProps) {
  return (
    <form
      method="get"
      className="grid gap-3 rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div className="sm:col-span-2 lg:col-span-1">
        <DebouncedSearchInput
          defaultValue={q}
          label={labels.search}
          placeholder={labels.searchPlaceholder}
          clearLabel={labels.clear}
        />
      </div>

      <label className="block">
        <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
          {labels.status}
        </span>
        <select name="status" defaultValue={status} className="nht-input">
          <option value="">{labels.all}</option>
          {blogStatuses.map((value) => (
            <option key={value} value={value}>
              {statusLabels[value] ?? value}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
          {labels.locale}
        </span>
        <select name="locale" defaultValue={localeFilter} className="nht-input">
          <option value="">{labels.all}</option>
          {locales.map((value) => (
            <option key={value} value={value}>
              {value.toUpperCase()}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
        <button
          type="submit"
          className="accent-gradient-bg flex-1 rounded-full py-3 text-sm font-semibold text-white"
        >
          {labels.apply}
        </button>
        <Link
          href="/admin/blog"
          className="rounded-full border border-white/10 px-4 py-3 text-sm text-white transition-colors hover:bg-white/[0.05]"
        >
          {labels.clear}
        </Link>
      </div>
    </form>
  );
}
