"use client";

import { useId } from "react";
import { Check } from "lucide-react";
import { CREATOR_PLATFORMS } from "@/features/creators/types";
import { PLATFORM_ICON_HINT } from "@/features/creators/lib/create-options";

type PlatformPickerProps = {
  label: string;
  values: string[];
  platformLabels: Record<string, string>;
  platformDescriptions: Record<string, string>;
  disabled?: boolean;
  onChange: (values: string[]) => void;
};

export default function PlatformPicker({
  label,
  values,
  platformLabels,
  platformDescriptions,
  disabled,
  onChange,
}: PlatformPickerProps) {
  const groupId = useId();

  function toggle(platform: string) {
    if (values.includes(platform)) {
      onChange(values.filter((item) => item !== platform));
    } else {
      onChange([...values, platform]);
    }
  }

  return (
    <fieldset disabled={disabled}>
      <legend className="sr-only">{label}</legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CREATOR_PLATFORMS.map((platform) => {
          const checked = values.includes(platform);
          const id = `${groupId}-${platform}`;
          const title = platformLabels[platform] ?? platform;
          const description = platformDescriptions[platform] ?? "";
          return (
            <label
              key={platform}
              htmlFor={id}
              className={`relative flex min-h-[7.5rem] cursor-pointer flex-col rounded-[var(--nht-radius-xl)] border p-4 transition ${
                checked
                  ? "border-[var(--nht-accent)] bg-[var(--nht-accent-muted)] shadow-[var(--nht-shadow-glow)]"
                  : "border-white/[0.08] bg-black/20 hover:border-[var(--nht-accent)]/35"
              }`}
            >
              <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={() => toggle(platform)}
                className="sr-only"
                aria-label={title}
                aria-describedby={`${id}-desc`}
              />
              {checked ? (
                <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--nht-accent)] text-white">
                  <Check className="h-3 w-3" aria-hidden />
                </span>
              ) : null}
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                    checked
                      ? "border-[var(--nht-accent)] bg-[var(--nht-accent)]/20 text-[var(--nht-accent)]"
                      : "border-white/20 text-[var(--nht-text-tertiary)]"
                  }`}
                >
                  {checked ? <Check className="h-3 w-3" /> : null}
                </span>
                <span className="text-sm font-medium text-white">{title}</span>
              </div>
              <div className="mt-4 flex flex-1 flex-col justify-between gap-3">
                <span
                  aria-hidden
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--nht-radius-lg)] border border-white/[0.08] bg-white/[0.03] text-[10px] font-semibold tracking-wide text-[var(--nht-text-secondary)]"
                >
                  {PLATFORM_ICON_HINT[platform]}
                </span>
                <p
                  id={`${id}-desc`}
                  className="text-xs leading-relaxed text-[var(--nht-text-tertiary)]"
                >
                  {description}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
