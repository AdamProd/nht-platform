import { Link } from "@/i18n/navigation";
import {
  applicationPriorities,
  applicationStatuses,
} from "@/features/applications/schemas/crm.schema";

type ApplicationsFiltersProps = {
  q: string;
  status: string;
  priority: string;
  labels: {
    search: string;
    searchPlaceholder: string;
    status: string;
    priority: string;
    all: string;
    apply: string;
    clear: string;
  };
};

export default function ApplicationsFilters({
  q,
  status,
  priority,
  labels,
}: ApplicationsFiltersProps) {
  return (
    <form
      method="get"
      className="grid gap-3 rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <label className="block sm:col-span-2 lg:col-span-1">
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
          {applicationStatuses.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
          {labels.priority}
        </span>
        <select name="priority" defaultValue={priority} className="nht-input">
          <option value="">{labels.all}</option>
          {applicationPriorities.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
        <button
          type="submit"
          className="gold-gradient-bg flex-1 rounded-full py-3 text-sm font-semibold text-[#090909]"
        >
          {labels.apply}
        </button>
        <Link
          href="/admin/applications"
          className="rounded-full border border-white/10 px-4 py-3 text-sm text-white transition-colors hover:bg-white/[0.05]"
        >
          {labels.clear}
        </Link>
      </div>
    </form>
  );
}
