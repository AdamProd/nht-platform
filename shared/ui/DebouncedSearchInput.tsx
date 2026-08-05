"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";

type Props = {
  name?: string;
  defaultValue?: string;
  placeholder?: string;
  label?: string;
  clearLabel?: string;
  className?: string;
  debounceMs?: number;
  /** Auto-submit the parent GET form after debounce. */
  autoSubmit?: boolean;
};

export default function DebouncedSearchInput({
  name = "q",
  defaultValue = "",
  placeholder,
  label,
  clearLabel = "Clear",
  className = "nht-input",
  debounceMs = 350,
  autoSubmit = true,
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const [syncedDefault, setSyncedDefault] = useState(defaultValue);
  if (defaultValue !== syncedDefault) {
    setSyncedDefault(defaultValue);
    setValue(defaultValue);
  }

  const debounced = useDebouncedValue(value, debounceMs);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSubmitted = useRef(defaultValue);

  useEffect(() => {
    lastSubmitted.current = defaultValue;
  }, [defaultValue]);

  useEffect(() => {
    if (!autoSubmit) return;
    if (debounced === lastSubmitted.current) return;
    const form = inputRef.current?.form;
    if (!form) return;
    lastSubmitted.current = debounced;
    if (typeof form.requestSubmit === "function") {
      form.requestSubmit();
    } else {
      form.submit();
    }
  }, [debounced, autoSubmit]);

  return (
    <label className="block min-w-0">
      {label ? (
        <span className="mb-1.5 block text-xs text-[var(--nht-text-tertiary)]">
          {label}
        </span>
      ) : null}
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--nht-text-tertiary)]"
          aria-hidden
        />
        <input
          ref={inputRef}
          name={name}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className={`${className} pl-9 ${value ? "pr-9" : ""}`}
          aria-label={label ?? placeholder}
        />
        {value ? (
          <button
            type="button"
            onClick={() => {
              setValue("");
              inputRef.current?.focus();
            }}
            className="focus-ring absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 text-[var(--nht-text-tertiary)] hover:text-white"
            aria-label={clearLabel}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </label>
  );
}
