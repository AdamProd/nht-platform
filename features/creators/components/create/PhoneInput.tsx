"use client";

import { useId } from "react";
import { PHONE_DIAL_OPTIONS } from "@/features/creators/lib/create-options";

type PhoneInputProps = {
  label: string;
  dial: string;
  national: string;
  dialLabel: string;
  numberLabel: string;
  disabled?: boolean;
  describedBy?: string;
  onDialChange: (dial: string) => void;
  onNationalChange: (national: string) => void;
};

export default function PhoneInput({
  label,
  dial,
  national,
  dialLabel,
  numberLabel,
  disabled,
  describedBy,
  onDialChange,
  onNationalChange,
}: PhoneInputProps) {
  const dialId = useId();
  const numberId = useId();

  return (
    <fieldset aria-describedby={describedBy}>
      <legend className="text-overline mb-2 text-[var(--nht-text-tertiary)]">
        {label}
      </legend>
      <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-2">
        <div>
          <label htmlFor={dialId} className="sr-only">
            {dialLabel}
          </label>
          <select
            id={dialId}
            value={dial}
            disabled={disabled}
            aria-label={dialLabel}
            onChange={(event) => onDialChange(event.target.value)}
            className="nht-input"
          >
            {PHONE_DIAL_OPTIONS.map((option) => (
              <option key={`${option.iso}-${option.dial}`} value={option.dial}>
                {option.dial}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={numberId} className="sr-only">
            {numberLabel}
          </label>
          <input
            id={numberId}
            type="tel"
            inputMode="tel"
            disabled={disabled}
            value={national}
            aria-label={numberLabel}
            onChange={(event) =>
              onNationalChange(event.target.value.replace(/[^\d\s-]/g, ""))
            }
            className="nht-input"
          />
        </div>
      </div>
    </fieldset>
  );
}
