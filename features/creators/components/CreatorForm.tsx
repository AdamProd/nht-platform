"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { createCreator } from "@/features/creators/actions/update-creator";
import { creatorStatuses } from "@/features/creators/schemas/creator.schema";
import type { StaffManagerOption } from "@/features/applications/types";
import FlashToast from "@/features/creators/components/FlashToast";

type CreatorFormProps = {
  managers: StaffManagerOption[];
  canAssignManager: boolean;
  labels: {
    create: string;
    title: string;
    displayName: string;
    email: string;
    telegram: string;
    country: string;
    languages: string;
    languagesPlaceholder: string;
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
};

export default function CreatorForm({
  managers,
  canAssignManager,
  labels,
  statusLabels,
}: CreatorFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<"success" | "error">("success");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    const payload = {
      display_name: formData.get("display_name"),
      email: formData.get("email"),
      telegram: formData.get("telegram"),
      country: formData.get("country"),
      languages: String(formData.get("languages") ?? ""),
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
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="inline-flex items-center justify-center rounded-full bg-[var(--nht-gold)] px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nht-gold)]"
      >
        {labels.create}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-creator-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[var(--nht-radius-xl)] border border-white/[0.08] bg-[var(--nht-bg-elevated)] p-5 shadow-2xl">
            <h2
              id="create-creator-title"
              className="text-lg font-medium text-white"
            >
              {labels.title}
            </h2>

            <form action={handleSubmit} className="mt-5 space-y-4">
              <label className="block">
                <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
                  {labels.displayName}
                </span>
                <input
                  name="display_name"
                  required
                  className="w-full rounded-[var(--nht-radius-md)] border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-[var(--nht-gold)]/40"
                />
              </label>

              <label className="block">
                <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
                  {labels.email}
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-[var(--nht-radius-md)] border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-[var(--nht-gold)]/40"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
                    {labels.telegram}
                  </span>
                  <input
                    name="telegram"
                    className="w-full rounded-[var(--nht-radius-md)] border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-[var(--nht-gold)]/40"
                  />
                </label>
                <label className="block">
                  <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
                    {labels.country}
                  </span>
                  <input
                    name="country"
                    className="w-full rounded-[var(--nht-radius-md)] border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-[var(--nht-gold)]/40"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
                  {labels.languages}
                </span>
                <input
                  name="languages"
                  placeholder={labels.languagesPlaceholder}
                  className="w-full rounded-[var(--nht-radius-md)] border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none placeholder:text-[var(--nht-text-muted)] focus:border-[var(--nht-gold)]/40"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                {canAssignManager ? (
                  <label className="block">
                    <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
                      {labels.manager}
                    </span>
                    <select
                      name="manager_id"
                      defaultValue=""
                      className="w-full rounded-[var(--nht-radius-md)] border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-[var(--nht-gold)]/40"
                    >
                      <option value="">{labels.unassigned}</option>
                      {managers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.full_name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
                <label className="block">
                  <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
                    {labels.status}
                  </span>
                  <select
                    name="status"
                    defaultValue="new"
                    className="w-full rounded-[var(--nht-radius-md)] border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-[var(--nht-gold)]/40"
                  >
                    {creatorStatuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status] ?? status}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
                  {labels.notes}
                </span>
                <textarea
                  name="notes"
                  rows={3}
                  className="w-full resize-y rounded-[var(--nht-radius-md)] border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-[var(--nht-gold)]/40"
                />
              </label>

              {error ? (
                <p className="text-sm text-red-400" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/[0.05] disabled:opacity-50"
                >
                  {labels.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-full bg-[var(--nht-gold)] px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
                >
                  {isPending ? labels.submitting : labels.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {toast ? (
        <FlashToast message={toast} tone={toastTone} />
      ) : null}
    </>
  );
}
