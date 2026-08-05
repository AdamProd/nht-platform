"use client";

import { useId, useRef } from "react";
import { Camera } from "lucide-react";
import UserAvatar from "@/shared/ui/UserAvatar";

type AvatarUploadFieldProps = {
  label: string;
  hint: string;
  previewUrl: string | null;
  disabled?: boolean;
  onFile: (file: File | null) => void;
};

export default function AvatarUploadField({
  label,
  hint,
  previewUrl,
  disabled,
  onFile,
}: AvatarUploadFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
      <button
        type="button"
        disabled={disabled}
        aria-label={label}
        onClick={() => inputRef.current?.click()}
        className="focus-ring relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-dashed border-white/20 bg-black/30 transition hover:border-[var(--nht-accent)]/50"
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <UserAvatar name="?" size="lg" tone="creator" />
        )}
        <span className="absolute inset-x-0 bottom-0 flex justify-center bg-black/50 py-1">
          <Camera className="h-3.5 w-3.5 text-white" aria-hidden />
        </span>
      </button>
      <div className="text-center sm:text-left">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-white"
        >
          {label}
        </label>
        <p id={`${inputId}-hint`} className="mt-1 text-xs text-[var(--nht-text-tertiary)]">
          {hint}
        </p>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled}
          aria-describedby={`${inputId}-hint`}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            onFile(file);
          }}
        />
      </div>
    </div>
  );
}
