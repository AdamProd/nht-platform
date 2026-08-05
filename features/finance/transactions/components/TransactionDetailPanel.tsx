"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  deleteTransaction,
  updateFinanceNotes,
  updateFinanceStatus,
  updateTransaction,
} from "@/features/finance/transactions/actions/transactions";
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
  FinanceTransactionDetail,
  FinanceTransactionStatus,
} from "@/features/finance/types";
import FlashToast from "@/features/finance/transactions/components/FlashToast";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import {
  formatFinanceDateTime,
  formatFinanceMoney,
} from "@/features/finance/lib/format";

type Props = {
  transaction: FinanceTransactionDetail;
  creators: FinanceCreatorOption[];
  managers: FinanceManagerOption[];
  canAssignManager: boolean;
  canDelete: boolean;
  locale: string;
  labels: {
    sections: {
      details: string;
      status: string;
      notes: string;
      meta: string;
    };
    fields: {
      creator: string;
      manager: string;
      platform: string;
      date: string;
      gross: string;
      currency: string;
      agencyPercent: string;
      agencyAmount: string;
      creatorPercent: string;
      creatorAmount: string;
      status: string;
      paymentMethod: string;
      referenceId: string;
      notes: string;
      created: string;
      updated: string;
      unassigned: string;
      none: string;
    };
    save: string;
    saving: string;
    saved: string;
    saveError: string;
    delete: string;
    deleting: string;
    deleted: string;
    confirmDelete: string;
    cancel: string;
  };
  statusLabels: Record<FinanceTransactionStatus, string>;
  platformLabels: Record<FinancePlatform, string>;
  methodLabels: Record<FinancePaymentMethod, string>;
};

export default function TransactionDetailPanel({
  transaction,
  creators,
  managers,
  canAssignManager,
  canDelete,
  locale,
  labels,
  statusLabels,
  platformLabels,
  methodLabels,
}: Props) {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);
  const [tone, setTone] = useState<"success" | "error">("success");
  const [pendingField, setPendingField] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    transaction.status,
    (_c: FinanceTransactionStatus, next: FinanceTransactionStatus) => next,
  );
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  function run(
    field: string,
    action: () => Promise<{ success: boolean; error?: string }>,
    successMessage = labels.saved,
  ) {
    setPendingField(field);
    startTransition(async () => {
      const result = await action();
      setPendingField(null);
      if (!result.success) {
        setTone("error");
        setToast(result.error ?? labels.saveError);
        return;
      }
      setTone("success");
      setToast(successMessage);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <FlashToast message={toast} tone={tone} />

      <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="text-sm font-medium text-white">
          {labels.sections.details}
        </h2>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-2"
          action={(formData) => {
            run("details", () =>
              updateTransaction({
                id: transaction.id,
                creator_id: formData.get("creator_id"),
                manager_id: formData.get("manager_id"),
                platform: formData.get("platform"),
                transaction_date: formData.get("transaction_date"),
                gross_revenue: formData.get("gross_revenue"),
                currency: formData.get("currency"),
                agency_percent: formData.get("agency_percent"),
                payment_method: formData.get("payment_method"),
                reference_id: formData.get("reference_id"),
                notes: formData.get("notes"),
              }),
            );
          }}
        >
          <Field label={labels.fields.creator}>
            <select
              name="creator_id"
              defaultValue={transaction.creator_id}
              required
              className="nht-input"
            >
              {creators.map((creator) => (
                <option key={creator.id} value={creator.id}>
                  {creator.display_name || creator.full_name}
                </option>
              ))}
            </select>
          </Field>
          {canAssignManager ? (
            <Field label={labels.fields.manager}>
              <select
                name="manager_id"
                defaultValue={transaction.manager_id ?? ""}
                className="nht-input"
              >
                <option value="">{labels.fields.unassigned}</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.full_name ?? manager.id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <>
              <input
                type="hidden"
                name="manager_id"
                value={transaction.manager_id ?? ""}
              />
              <Readonly
                label={labels.fields.manager}
                value={
                  transaction.manager?.full_name ?? labels.fields.unassigned
                }
              />
            </>
          )}
          <Field label={labels.fields.platform}>
            <select
              name="platform"
              defaultValue={transaction.platform}
              className="nht-input"
            >
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
              defaultValue={transaction.transaction_date}
              required
              className="nht-input"
            />
          </Field>
          <Field label={labels.fields.gross}>
            <input
              name="gross_revenue"
              type="number"
              min="0"
              step="0.01"
              defaultValue={transaction.gross_revenue}
              required
              className="nht-input"
            />
          </Field>
          <Field label={labels.fields.currency}>
            <input
              name="currency"
              defaultValue={transaction.currency}
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
              defaultValue={transaction.agency_percent}
              required
              className="nht-input"
            />
          </Field>
          <Readonly
            label={labels.fields.agencyAmount}
            value={formatFinanceMoney(
              transaction.agency_amount,
              locale,
              transaction.currency,
            )}
          />
          <Readonly
            label={labels.fields.creatorPercent}
            value={`${Number(transaction.creator_percent).toFixed(0)}%`}
          />
          <Readonly
            label={labels.fields.creatorAmount}
            value={formatFinanceMoney(
              transaction.creator_amount,
              locale,
              transaction.currency,
            )}
          />
          <Field label={labels.fields.paymentMethod}>
            <select
              name="payment_method"
              defaultValue={transaction.payment_method ?? ""}
              className="nht-input"
            >
              <option value="">{labels.fields.none}</option>
              {financePaymentMethods.map((method) => (
                <option key={method} value={method}>
                  {methodLabels[method]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={labels.fields.referenceId}>
            <input
              name="reference_id"
              defaultValue={transaction.reference_id ?? ""}
              className="nht-input"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label={labels.fields.notes}>
              <textarea
                name="notes"
                rows={3}
                defaultValue={transaction.notes ?? ""}
                className="nht-input resize-y"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isPending && pendingField === "details"}
              className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-white hover:border-[var(--nht-border-hover)] disabled:opacity-60"
            >
              {isPending && pendingField === "details"
                ? labels.saving
                : labels.save}
            </button>
          </div>
        </form>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
          <h2 className="text-sm font-medium text-white">
            {labels.sections.status}
          </h2>
          <form
            className="mt-4"
            action={(formData) => {
              const next = formData.get("status") as FinanceTransactionStatus;
              startTransition(() => setOptimisticStatus(next));
              run("status", () => updateFinanceStatus(formData));
            }}
          >
            <input type="hidden" name="id" value={transaction.id} />
            <Field label={labels.fields.status}>
              <select
                name="status"
                defaultValue={optimisticStatus}
                className="nht-input"
              >
                {financeStatuses.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </Field>
            <button
              type="submit"
              disabled={isPending && pendingField === "status"}
              className="mt-4 rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-white hover:border-[var(--nht-border-hover)] disabled:opacity-60"
            >
              {isPending && pendingField === "status"
                ? labels.saving
                : labels.save}
            </button>
          </form>
        </section>

        <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
          <h2 className="text-sm font-medium text-white">
            {labels.sections.notes}
          </h2>
          <form
            className="mt-4"
            action={(formData) => {
              run("notes", () => updateFinanceNotes(formData));
            }}
          >
            <input type="hidden" name="id" value={transaction.id} />
            <Field label={labels.fields.notes}>
              <textarea
                name="notes"
                rows={5}
                defaultValue={transaction.notes ?? ""}
                className="nht-input resize-y"
              />
            </Field>
            <button
              type="submit"
              disabled={isPending && pendingField === "notes"}
              className="mt-4 rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-white hover:border-[var(--nht-border-hover)] disabled:opacity-60"
            >
              {isPending && pendingField === "notes"
                ? labels.saving
                : labels.save}
            </button>
          </form>
        </section>
      </div>

      <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="text-sm font-medium text-white">{labels.sections.meta}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Readonly
            label={labels.fields.created}
            value={formatFinanceDateTime(transaction.created_at, locale)}
          />
          <Readonly
            label={labels.fields.updated}
            value={formatFinanceDateTime(transaction.updated_at, locale)}
          />
        </div>
      </section>

      {canDelete ? (
        <>
          <button
            type="button"
            disabled={isPending && pendingField === "delete"}
            onClick={() => setConfirmDeleteOpen(true)}
            className="focus-ring rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-[var(--nht-text-secondary)] hover:text-white disabled:opacity-60"
          >
            {isPending && pendingField === "delete"
              ? labels.deleting
              : labels.delete}
          </button>
          <ConfirmDialog
            open={confirmDeleteOpen}
            title={labels.delete}
            description={labels.confirmDelete}
            confirmLabel={labels.delete}
            cancelLabel={labels.cancel}
            tone="danger"
            onCancel={() => setConfirmDeleteOpen(false)}
            onConfirm={() => {
              setConfirmDeleteOpen(false);
              const formData = new FormData();
              formData.set("id", transaction.id);
              setPendingField("delete");
              startTransition(async () => {
                const result = await deleteTransaction(formData);
                setPendingField(null);
                if (!result.success) {
                  setTone("error");
                  setToast(result.error ?? labels.saveError);
                  return;
                }
                setTone("success");
                setToast(labels.deleted);
                router.push("/admin/finance");
              });
            }}
          />
        </>
      ) : null}
    </div>
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

function Readonly({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-overline text-[var(--nht-text-tertiary)]">{label}</p>
      <p className="mt-2 text-sm text-white">{value}</p>
    </div>
  );
}
