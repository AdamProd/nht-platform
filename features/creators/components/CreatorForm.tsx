"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { createCreator } from "@/features/creators/actions/update-creator";
import {
  creatorStatuses,
} from "@/features/creators/schemas/creator.schema";
import { CREATOR_PLATFORMS } from "@/features/creators/types";
import type { StaffManagerOption } from "@/features/applications/types";
import FlashToast from "@/features/creators/components/FlashToast";

type CreatorFormProps = {
  managers: StaffManagerOption[];
  canAssignManager: boolean;
  labels: {
    create: string;
    title: string;
    fullName: string;
    email: string;
    telegram: string;
    country: string;
    languages: string;
    languagesPlaceholder: string;
    platforms: string;
    manager: string;
    status: string;
    notes: string;
    unassigned: string;
    cancel: string;
    submit: string;
    submitting: string;
    created: string;
  };
  statusLabels: Record<string, string>;
  platformLabels: Record<string, string>;
};

export default function CreatorForm({
  managers,
  canAssignManager,
  labels,
  statusLabels,
  platformLabels,
}: CreatorFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<"success" | "error">("success");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    const platforms = formData.getAll("platforms").map(String);
    const payload = {
      full_name: formData.get("full_name"),
      email: formData.get("email"),
      telegram: formData.get("telegram"),
      country: formData.get("country"),
      languages: String(formData.get("languages") ?? ""),
      platforms,
      manager_id: formData.get("manager_id") || null,
      status: formData.get("status") || "new",
      notes: formData.get("notes"),
    };

    startTransition(async () => {
      const result = await createCreator(payload);
      if (!result.success) {
        setError(result.error);
        setToastTone("error");
        setToast(result.error);
        return;
      }
      setToastTone("success");
      setToast(labels.created);
      setOpen(false);
      if (result.id) {
        router.push(`/admin/creators/${result.id}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <>
      <FlashToast message={toast} tone={toastTone} />
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="accent-gradient-bg inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white shadow-[var(--nht-shadow-glow)]"
      >
        {labels.create}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <button
            type="button"
            aria-label={labels.cancel}
            className="absolute inset-0"
            onClick={() => !isPending && setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-creator-title"
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[var(--nht-radius-3xl)] border border-white/[0.08] bg-[var(--nht-black-elevated)] p-6 shadow-[var(--nht-shadow-md)]"
          >
            <h2
              id="create-creator-title"
              className="text-lg font-semibold text-white"
            >
              {labels.title}
            </h2>

            {error ? (
              <p
                role="alert"
                className="mt-3 rounded-[var(--nht-radius-lg)] border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-[var(--nht-text-secondary)]"
              >
                {error}
              </p>
            ) : null}

            <form action={handleSubmit} className="mt-5 space-y-4">
              <label className="block">
                <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
                  {labels.fullName}
                </span>
                <input name="full_name" required className="nht-input" />
              </label>

              <label className="block">
                <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
                  {labels.email}
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  className="nht-input"
                />
              </label>

              <label className="block">
                <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
                  {labels.telegram}
                </span>
                <input name="telegram" className="nht-input" />
              </label>

              <label className="block">
                <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
                  {labels.country}
                </span>
                <input name="country" className="nht-input" />
              </label>

              <label className="block">
                <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
                  {labels.languages}
                </span>
                <input
                  name="languages"
                  placeholder={labels.languagesPlaceholder}
                  className="nht-input"
                />
              </label>

              <fieldset>
                <legend className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
                  {labels.platforms}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {CREATOR_PLATFORMS.map((value) => (
                    <label
                      key={value}
                      className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] px-3 py-1.5 text-xs text-[var(--nht-text-secondary)]"
                    >
                      <input type="checkbox" name="platforms" value={value} />
                      {platformLabels[value] ?? value}
                    </label>
                  ))}
                </div>
              </fieldset>

              {canAssignManager ? (
                <label className="block">
                  <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
                    {labels.manager}
                  </span>
                  <select name="manager_id" className="nht-input" defaultValue="">
                    <option value="">{labels.unassigned}</option>
                    {managers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.full_name ?? manager.id.slice(0, 8)}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <label className="block">
                <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
                  {labels.status}
                </span>
                <select name="status" defaultValue="new" className="nht-input">
                  {creatorStatuses.map((value) => (
                    <option key={value} value={value}>
                      {statusLabels[value] ?? value}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
                  {labels.notes}
                </span>
                <textarea name="notes" rows={3} className="nht-input resize-y" />
              </label>

              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-white/10 px-5 py-3 text-sm text-white hover:bg-white/[0.05] disabled:opacity-60"
                >
                  {labels.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="accent-gradient-bg rounded-full px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {isPending ? labels.submitting : labels.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
