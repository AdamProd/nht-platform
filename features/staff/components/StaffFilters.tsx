import { Link } from "@/i18n/navigation";

type Props = {
  q: string;
  role: string;
  department: string;
  status: string;
  sort: string;
  labels: {
    search: string;
    searchPlaceholder: string;
    role: string;
    department: string;
    status: string;
    sort: string;
    all: string;
    newest: string;
    oldest: string;
    name: string;
    apply: string;
    clear: string;
  };
  roleOptions: { value: string; label: string }[];
  departmentOptions: { value: string; label: string }[];
  statusOptions: { value: string; label: string }[];
};

export default function StaffFilters({
  q,
  role,
  department,
  status,
  sort,
  labels,
  roleOptions,
  departmentOptions,
  statusOptions,
}: Props) {
  return (
    <form
      method="get"
      className="grid gap-3 rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-4 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))_auto]"
    >
      <label className="block min-w-0">
        <span className="mb-1.5 block text-xs text-[var(--nht-text-tertiary)]">
          {labels.search}
        </span>
        <input
          name="q"
          defaultValue={q}
          placeholder={labels.searchPlaceholder}
          className="w-full rounded-[var(--nht-radius-lg)] border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-[var(--nht-text-tertiary)]"
        />
      </label>
      <Select
        name="role"
        label={labels.role}
        value={role}
        allLabel={labels.all}
        options={roleOptions}
      />
      <Select
        name="department"
        label={labels.department}
        value={department}
        allLabel={labels.all}
        options={departmentOptions}
      />
      <Select
        name="status"
        label={labels.status}
        value={status}
        allLabel={labels.all}
        options={statusOptions}
      />
      <label className="block">
        <span className="mb-1.5 block text-xs text-[var(--nht-text-tertiary)]">
          {labels.sort}
        </span>
        <select
          name="sort"
          defaultValue={sort}
          className="w-full rounded-[var(--nht-radius-lg)] border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white"
        >
          <option value="newest">{labels.newest}</option>
          <option value="oldest">{labels.oldest}</option>
          <option value="name">{labels.name}</option>
        </select>
      </label>
      <div className="flex items-end gap-2">
        <button
          type="submit"
          className="rounded-full border border-[var(--nht-gold)]/40 bg-[var(--nht-gold-muted)] px-4 py-2 text-xs font-medium text-[var(--nht-gold)]"
        >
          {labels.apply}
        </button>
        <Link
          href="/admin/staff"
          className="rounded-full border border-white/10 px-4 py-2 text-xs text-[var(--nht-text-secondary)] hover:text-white"
        >
          {labels.clear}
        </Link>
      </div>
    </form>
  );
}

function Select({
  name,
  label,
  value,
  allLabel,
  options,
}: {
  name: string;
  label: string;
  value: string;
  allLabel: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-[var(--nht-text-tertiary)]">
        {label}
      </span>
      <select
        name={name}
        defaultValue={value}
        className="w-full rounded-[var(--nht-radius-lg)] border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white"
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
