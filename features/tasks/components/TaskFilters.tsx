"use client";

import { useRouter } from "@/i18n/navigation";
import { useTransition } from "react";

type Option = { value: string; label: string };

type Props = {
  values: {
    q: string;
    status: string;
    priority: string;
    type: string;
    assignee: string;
    creator: string;
    sort: string;
    scope: string;
    view?: string;
  };
  labels: {
    search: string;
    status: string;
    priority: string;
    type: string;
    assignee: string;
    creator: string;
    sort: string;
    all: string;
    unassigned: string;
    clear: string;
  };
  statusOptions: Option[];
  priorityOptions: Option[];
  typeOptions: Option[];
  assigneeOptions: Option[];
  creatorOptions: Option[];
  sortOptions: Option[];
};

function buildHref(params: Record<string, string>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `/admin/tasks?${qs}` : "/admin/tasks";
}

export default function TaskFilters({
  values,
  labels,
  statusOptions,
  priorityOptions,
  typeOptions,
  assigneeOptions,
  creatorOptions,
  sortOptions,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function update(patch: Partial<Props["values"]>) {
    const next = { ...values, ...patch, page: "" };
    startTransition(() => {
      router.push(
        buildHref({
          q: next.q,
          status: next.status,
          priority: next.priority,
          type: next.type,
          assignee: next.assignee,
          creator: next.creator,
          sort: next.sort === "newest" ? "" : next.sort,
          scope: next.scope,
          view: next.view === "kanban" ? "kanban" : "",
        }),
      );
    });
  }

  return (
    <div
      className={`grid gap-3 rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-4 lg:grid-cols-6 ${
        isPending ? "opacity-70" : ""
      }`}
    >
      <input
        type="search"
        defaultValue={values.q}
        placeholder={labels.search}
        className="nht-input lg:col-span-2"
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            update({ q: (event.target as HTMLInputElement).value });
          }
        }}
        onBlur={(event) => update({ q: event.target.value })}
      />

      <select
        className="nht-input"
        value={values.status}
        onChange={(event) => update({ status: event.target.value })}
        aria-label={labels.status}
      >
        <option value="">{labels.all}</option>
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        className="nht-input"
        value={values.priority}
        onChange={(event) => update({ priority: event.target.value })}
        aria-label={labels.priority}
      >
        <option value="">{labels.all}</option>
        {priorityOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        className="nht-input"
        value={values.type}
        onChange={(event) => update({ type: event.target.value })}
        aria-label={labels.type}
      >
        <option value="">{labels.all}</option>
        {typeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        className="nht-input"
        value={values.assignee}
        onChange={(event) => update({ assignee: event.target.value })}
        aria-label={labels.assignee}
      >
        <option value="">{labels.all}</option>
        <option value="unassigned">{labels.unassigned}</option>
        {assigneeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        className="nht-input lg:col-span-2"
        value={values.creator}
        onChange={(event) => update({ creator: event.target.value })}
        aria-label={labels.creator}
      >
        <option value="">{labels.all}</option>
        {creatorOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        className="nht-input"
        value={values.sort}
        onChange={(event) => update({ sort: event.target.value })}
        aria-label={labels.sort}
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() =>
          startTransition(() => {
            router.push(
              buildHref({
                view: values.view === "kanban" ? "kanban" : "",
              }),
            );
          })
        }
        className="rounded-full border border-white/10 px-3 py-2 text-xs text-[var(--nht-text-secondary)] transition hover:text-white"
      >
        {labels.clear}
      </button>
    </div>
  );
}
