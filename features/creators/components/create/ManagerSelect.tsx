"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import type { StaffManagerOption } from "@/features/applications/types";
import UserAvatar, { roleTone } from "@/shared/ui/UserAvatar";

type ManagerSelectProps = {
  label: string;
  value: string;
  managers: StaffManagerOption[];
  unassignedLabel: string;
  roleLabels: Record<string, string>;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export default function ManagerSelect({
  label,
  value,
  managers,
  unassignedLabel,
  roleLabels,
  disabled,
  onChange,
}: ManagerSelectProps) {
  const id = useId();
  const listId = `${id}-list`;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = managers.find((manager) => manager.id === value);
  const selectedName = selected?.full_name?.trim() || unassignedLabel;

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
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
      <label htmlFor={id} className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
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
        onClick={() => setOpen((prev) => !prev)}
        className="nht-input flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="flex min-w-0 items-center gap-3">
          {selected ? (
            <UserAvatar
              name={selectedName}
              src={selected.avatar_url}
              tone={roleTone(selected.role)}
            />
          ) : (
            <UserAvatar name="?" tone="default" />
          )}
          <span className="min-w-0">
            <span className="block truncate text-sm text-white">{selectedName}</span>
            {selected ? (
              <span className="block truncate text-xs text-[var(--nht-text-tertiary)]">
                {roleLabels[selected.role] ?? selected.role}
              </span>
            ) : null}
          </span>
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-[var(--nht-text-tertiary)]" />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-[var(--nht-radius-lg)] border border-white/[0.08] bg-[var(--nht-black-elevated)] py-1 shadow-[var(--nht-shadow-lg)]"
        >
          <li role="option" aria-selected={!value}>
            <button
              type="button"
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-white hover:bg-white/[0.04]"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              <UserAvatar name="?" tone="default" />
              <span>{unassignedLabel}</span>
            </button>
          </li>
          {managers.map((manager) => {
            const name = manager.full_name?.trim() || manager.id;
            const active = manager.id === value;
            return (
              <li key={manager.id} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-white/[0.04] ${
                    active ? "bg-[var(--nht-accent-muted)]" : ""
                  }`}
                  onClick={() => {
                    onChange(manager.id);
                    setOpen(false);
                  }}
                >
                  <UserAvatar
                    name={name}
                    src={manager.avatar_url}
                    tone={roleTone(manager.role)}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-white">{name}</span>
                    <span className="block truncate text-xs text-[var(--nht-text-tertiary)]">
                      {roleLabels[manager.role] ?? manager.role}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
