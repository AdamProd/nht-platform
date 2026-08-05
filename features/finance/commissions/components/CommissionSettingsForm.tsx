"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { updateCommissionSettings } from "@/features/finance/commissions/actions/commissions";
import type { CommissionHistoryItem, CommissionSettings } from "@/features/finance/types";

type Props = {
  settings: CommissionSettings | null;
  history: CommissionHistoryItem[];
  canEdit: boolean;
  locale: string;
  labels: {
    agency: string;
    manager: string;
    referral: string;
    bonus: string;
    note: string;
    save: string;
    saving: string;
    history: string;
    emptyHistory: string;
    by: string;
    error: string;
  };
};

export default function CommissionSettingsForm({
  settings,
  history,
  canEdit,
  locale,
  labels,
}: Props) {
  const router = useRouter();
  const [agency, setAgency] = useState(String(settings?.agency_percent ?? 20));
  const [manager, setManager] = useState(String(settings?.manager_percent ?? 0));
  const [referral, setReferral] = useState(String(settings?.referral_percent ?? 0));
  const [bonus, setBonus] = useState(String(settings?.bonus_percent ?? 0));
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <form
        className="grid gap-4 rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!canEdit) return;
          setError(null);
          startTransition(async () => {
            const result = await updateCommissionSettings({
              agency_percent: Number(agency),
              manager_percent: Number(manager),
              referral_percent: Number(referral),
              bonus_percent: Number(bonus),
              note: note.trim() || undefined,
            });
            if (!result.success) {
              setError(result.error ?? labels.error);
              return;
            }
            setNote("");
            router.refresh();
          });
        }}
      >
        <label className="space-y-1.5">
          <span className="text-xs text-[var(--nht-text-tertiary)]">{labels.agency}</span>
          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={agency}
            disabled={!canEdit || isPending}
            onChange={(event) => setAgency(event.target.value)}
            className="nht-input"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs text-[var(--nht-text-tertiary)]">{labels.manager}</span>
          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={manager}
            disabled={!canEdit || isPending}
            onChange={(event) => setManager(event.target.value)}
            className="nht-input"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs text-[var(--nht-text-tertiary)]">{labels.referral}</span>
          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={referral}
            disabled={!canEdit || isPending}
            onChange={(event) => setReferral(event.target.value)}
            className="nht-input"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs text-[var(--nht-text-tertiary)]">{labels.bonus}</span>
          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={bonus}
            disabled={!canEdit || isPending}
            onChange={(event) => setBonus(event.target.value)}
            className="nht-input"
          />
        </label>
        <label className="space-y-1.5 sm:col-span-2">
          <span className="text-xs text-[var(--nht-text-tertiary)]">{labels.note}</span>
          <input
            value={note}
            disabled={!canEdit || isPending}
            onChange={(event) => setNote(event.target.value)}
            className="nht-input"
          />
        </label>
        {error ? (
          <p className="text-xs text-red-300 sm:col-span-2">{error}</p>
        ) : null}
        {canEdit ? (
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-[var(--nht-accent)] px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
            >
              {isPending ? labels.saving : labels.save}
            </button>
          </div>
        ) : null}
      </form>

      <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="text-sm font-medium text-white">{labels.history}</h2>
        {history.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--nht-text-tertiary)]">
            {labels.emptyHistory}
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {history.map((item) => (
              <li
                key={item.id}
                className="rounded-[var(--nht-radius-lg)] border border-white/[0.04] px-3 py-3 text-sm"
              >
                <p className="text-white">
                  A {item.agency_percent}% · M {item.manager_percent}% · R{" "}
                  {item.referral_percent}% · B {item.bonus_percent}%
                </p>
                <p className="mt-1 text-[11px] text-[var(--nht-text-tertiary)]">
                  {labels.by}{" "}
                  {item.changed_by_profile?.full_name ?? "—"} ·{" "}
                  {new Intl.DateTimeFormat(locale, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(item.created_at))}
                  {item.note ? ` · ${item.note}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
