import { Link } from "@/i18n/navigation";
import DebouncedSearchInput from "@/shared/ui/DebouncedSearchInput";

type Props = {
  q: string;
  status: string;
  labels: {
    search: string;
    searchPlaceholder: string;
    status: string;
    all: string;
    unread: string;
    read: string;
    archived: string;
    apply: string;
    clear: string;
  };
};

export default function NotificationsFilters({ q, status, labels }: Props) {
  return (
    <form
      method="get"
      className="grid gap-3 rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-4 sm:grid-cols-[1fr_auto_auto_auto]"
    >
      <DebouncedSearchInput
        defaultValue={q}
        label={labels.search}
        placeholder={labels.searchPlaceholder}
        clearLabel={labels.clear}
        className="w-full rounded-[var(--nht-radius-lg)] border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-[var(--nht-text-tertiary)]"
      />
      <label className="block">
        <span className="mb-1.5 block text-xs text-[var(--nht-text-tertiary)]">
          {labels.status}
        </span>
        <select
          name="status"
          defaultValue={status}
          className="w-full rounded-[var(--nht-radius-lg)] border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nht-gold)]"
        >
          <option value="">{labels.all}</option>
          <option value="unread">{labels.unread}</option>
          <option value="read">{labels.read}</option>
          <option value="archived">{labels.archived}</option>
        </select>
      </label>
      <div className="flex items-end gap-2">
        <button
          type="submit"
          className="focus-ring rounded-full border border-[var(--nht-gold)]/40 bg-[var(--nht-gold-muted)] px-4 py-2 text-xs font-medium text-[var(--nht-gold)] hover:border-[var(--nht-gold)]"
        >
          {labels.apply}
        </button>
        <Link
          href="/admin/notifications"
          className="focus-ring rounded-full border border-white/10 px-4 py-2 text-xs text-[var(--nht-text-secondary)] hover:text-white"
        >
          {labels.clear}
        </Link>
      </div>
    </form>
  );
}
