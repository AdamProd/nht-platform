"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";

export type SearchableOption = {
  value: string;
  label: string;
  keywords?: string;
};

type SearchableSelectProps = {
  id?: string;
  label: string;
  value: string;
  options: SearchableOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  disabled?: boolean;
  describedBy?: string;
  onChange: (value: string) => void;
};

export default function SearchableSelect({
  id: idProp,
  label,
  value,
  options,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  disabled,
  describedBy,
  onChange,
}: SearchableSelectProps) {
  const reactId = useId();
  const id = idProp ?? reactId;
  const listId = `${id}-listbox`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((option) => option.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => {
      const hay = `${option.label} ${option.keywords ?? ""} ${option.value}`.toLowerCase();
      return hay.includes(q);
    });
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative block">
      <label
        htmlFor={id}
        className="text-overline mb-2 block text-[var(--nht-text-tertiary)]"
      >
        {label}
      </label>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label}
        aria-describedby={describedBy}
        onClick={() => setOpen((prev) => !prev)}
        className="nht-input flex w-full items-center justify-between gap-2 text-left"
      >
        <span className={selected ? "text-white" : "text-[var(--nht-text-tertiary)]"}>
          {selected?.label ?? placeholder ?? label}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-[var(--nht-text-tertiary)]" />
      </button>

      {open ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-[var(--nht-radius-lg)] border border-white/[0.08] bg-[var(--nht-black-elevated)] shadow-[var(--nht-shadow-lg)]">
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2">
            <Search className="h-4 w-4 text-[var(--nht-text-tertiary)]" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder ?? label}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[var(--nht-text-tertiary)]"
            />
          </div>
          <ul
            id={listId}
            role="listbox"
            aria-label={label}
            className="max-h-56 overflow-y-auto py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-[var(--nht-text-tertiary)]">
                {emptyLabel}
              </li>
            ) : (
              filtered.map((option) => {
                const active = option.value === value;
                return (
                  <li key={option.value} role="option" aria-selected={active}>
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition hover:bg-white/[0.04] ${
                        active ? "text-[var(--nht-accent)]" : "text-white"
                      }`}
                      onClick={() => {
                        onChange(option.value);
                        setOpen(false);
                        setQuery("");
                      }}
                    >
                      <span>{option.label}</span>
                      {active ? <Check className="h-4 w-4" /> : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
