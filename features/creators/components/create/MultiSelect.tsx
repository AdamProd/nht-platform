"use client";

import { useId } from "react";
import { Check } from "lucide-react";

export type MultiSelectOption = {
  value: string;
  label: string;
};

type MultiSelectProps = {
  label: string;
  values: string[];
  options: MultiSelectOption[];
  disabled?: boolean;
  describedBy?: string;
  onChange: (values: string[]) => void;
};

export default function MultiSelect({
  label,
  values,
  options,
  disabled,
  describedBy,
  onChange,
}: MultiSelectProps) {
  const groupId = useId();

  function toggle(value: string) {
    if (values.includes(value)) {
      onChange(values.filter((item) => item !== value));
    } else {
      onChange([...values, value]);
    }
  }

  return (
    <fieldset disabled={disabled} aria-describedby={describedBy}>
      <legend className="text-overline mb-2 text-[var(--nht-text-tertiary)]">
        {label}
      </legend>
      <div
        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
        role="group"
        aria-labelledby={groupId}
      >
        <span id={groupId} className="sr-only">
          {label}
        </span>
        {options.map((option) => {
          const checked = values.includes(option.value);
          const id = `${groupId}-${option.value}`;
          return (
            <label
              key={option.value}
              htmlFor={id}
              className={`flex cursor-pointer items-center gap-3 rounded-[var(--nht-radius-lg)] border px-3 py-2.5 text-sm transition ${
                checked
                  ? "border-[var(--nht-accent)]/50 bg-[var(--nht-accent-muted)] text-white shadow-[var(--nht-shadow-glow)]"
                  : "border-white/[0.08] bg-black/20 text-white hover:border-[var(--nht-accent)]/30"
              }`}
            >
              <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={() => toggle(option.value)}
                className="sr-only"
                aria-label={option.label}
              />
              <span
                aria-hidden
                className={`flex h-4 w-4 items-center justify-center rounded border ${
                  checked
                    ? "border-[var(--nht-accent)] bg-[var(--nht-accent)] text-white"
                    : "border-white/20 bg-black/40"
                }`}
              >
                {checked ? <Check className="h-3 w-3" /> : null}
              </span>
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
