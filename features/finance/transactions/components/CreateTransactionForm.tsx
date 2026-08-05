"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { createTransaction } from "@/features/finance/transactions/actions/transactions";
import {
  financePaymentMethods,
  financeStatuses,
} from "@/features/finance/transactions/schemas/finance.schema";
import { FINANCE_PLATFORMS } from "@/features/finance/types";
import type {
  FinanceCreatorOption,
  FinanceManagerOption,
  FinancePaymentMethod,
  FinancePlatform,
  FinanceTransactionStatus,
} from "@/features/finance/types";
import FlashToast from "@/features/finance/transactions/components/FlashToast";
import { todayIso } from "@/features/finance/lib/format";

type Props = {
  creators: FinanceCreatorOption[];
  managers: FinanceManagerOption[];
  canAssignManager: boolean;
  labels: {
    title: string;
    open: string;
    cancel: string;
    submit: string;
    submitting: string;
    saved: string;
    saveError: string;
    fields: {
      creator: string;
      manager: string;
      platform: string;
      date: string;
      gross: string;
      currency: string;
      agencyPercent: string;
      status: string;
      paymentMethod: string;
      referenceId: string;
      notes: string;
      unassigned: string;
      none: string;
    };
  };
  statusLabels: Record<FinanceTransactionStatus, string>;
  platformLabels: Record<FinancePlatform, string>;
  methodLabels: Record<FinancePaymentMethod, string>;
};

export default function CreateTransactionForm({
  creators,
  managers,
  canAssignManager,
  labels,
  statusLabels,
  platformLabels,
  methodLabels,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [tone, setTone] = useState<"success" | "error">("success");
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-[var(--nht-gold)]/40 bg-[var(--nht-gold-muted)] px-4 py-2 text-xs font-medium text-[var(--nht-gold)] transition-colors hover:border-[var(--nht-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nht-gold)]"
      >
        {labels.open}
      </button>
    );
  }

  return (
    <>
      <FlashToast message={toast} tone={tone} />
      <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="text-sm font-medium text-white">{labels.title}</h2>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-2"
          action={(formData) => {
            startTransition(async () => {
              const result = await createTransaction({
                creator_id: formData.get("creator_id"),
                manager_id: formData.get("manager_id"),
                platform: formData.get("platform"),
                transaction_date: formData.get("transaction_date"),
                gross_revenue: formData.get("gross_revenue"),
                currency: formData.get("currency"),
                agency_percent: formData.get("agency_percent"),
                status: formData.get("status"),
                payment_method: formData.get("payment_method"),
                reference_id: formData.get("reference_id"),
                notes: formData.get("notes"),
              });
              if (!result.success) {
                setTone("error");
                setToast(result.error ?? labels.saveError);
                return;
              }
              setTone("success");
              setToast(labels.saved);
              setOpen(false);
              router.refresh();
            });
          }}
        >
          <Field label={labels.fields.creator}>
            <select name="creator_id" required className="nht-input">
              {creators.map((creator) => (
                <option key={creator.id} value={creator.id}>
                  {creator.display_name || creator.full_name}
                </option>
              ))}
            </select>
          </Field>
          {canAssignManager ? (
            <Field label={labels.fields.manager}>
              <select name="manager_id" className="nht-input">
                <option value="">{labels.fields.unassigned}</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.full_name ?? manager.id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <input type="hidden" name="manager_id" value="" />
          )}
          <Field label={labels.fields.platform}>
            <select name="platform" required className="nht-input">
              {FINANCE_PLATFORMS.map((platform) => (
                <option key={platform} value={platform}>
                  {platformLabels[platform]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={labels.fields.date}>
            <input
              name="transaction_date"
              type="date"
              required
              defaultValue={todayIso()}
              className="nht-input"
            />
          </Field>
          <Field label={labels.fields.gross}>
            <input
              name="gross_revenue"
              type="number"
              min="0"
              step="0.01"
              required
              className="nht-input"
            />
          </Field>
          <Field label={labels.fields.currency}>
            <input
              name="currency"
              defaultValue="USD"
              required
              className="nht-input"
            />
          </Field>
          <Field label={labels.fields.agencyPercent}>
            <input
              name="agency_percent"
              type="number"
              min="0"
              max="100"
              step="0.01"
              defaultValue="20"
              required
              className="nht-input"
            />
          </Field>
          <Field label={labels.fields.status}>
            <select name="status" defaultValue="pending" className="nht-input">
              {financeStatuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={labels.fields.paymentMethod}>
            <select name="payment_method" className="nht-input">
              <option value="">{labels.fields.none}</option>
              {financePaymentMethods.map((method) => (
                <option key={method} value={method}>
                  {methodLabels[method]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={labels.fields.referenceId}>
            <input name="reference_id" className="nht-input" />
          </Field>
          <div className="sm:col-span-2">
            <Field label={labels.fields.notes}>
              <textarea name="notes" rows={3} className="nht-input resize-y" />
            </Field>
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-white hover:border-[var(--nht-border-hover)] disabled:opacity-60"
            >
              {isPending ? labels.submitting : labels.submit}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-[var(--nht-text-secondary)] hover:text-white"
            >
              {labels.cancel}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
        {label}
      </span>
      {children}
    </label>
  );
}
