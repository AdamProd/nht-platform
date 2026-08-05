"use client";

import { useState, useTransition } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import {
  approvePayout,
  payPayout,
  rejectPayout,
} from "@/features/finance/payouts/actions/payouts";
import MoneyCell from "@/features/finance/transactions/components/MoneyCell";
import Badge from "@/shared/ui/Badge";
import type { FinancePayoutListItem, PayoutStatus } from "@/features/finance/types";

type Props = {
  items: FinancePayoutListItem[];
  locale: string;
  canApprove: boolean;
  labels: {
    creator: string;
    amount: string;
    currency: string;
    method: string;
    requested: string;
    approved: string;
    paid: string;
    status: string;
    actions: string;
    approve: string;
    reject: string;
    pay: string;
    view: string;
    empty: string;
    rejectReason: string;
    cancel: string;
    confirmReject: string;
    error: string;
  };
  statusLabels: Record<PayoutStatus, string>;
  methodLabels: Record<string, string>;
};

function statusTone(status: PayoutStatus): "neutral" | "success" | "warning" | "danger" | "info" {
  if (status === "completed") return "success";
  if (status === "pending") return "warning";
  if (status === "processing") return "info";
  return "danger";
}

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

export default function PayoutsTable({
  items,
  locale,
  canApprove,
  labels,
  statusLabels,
  methodLabels,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ success: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error ?? labels.error);
        return;
      }
      setRejectId(null);
      setReason("");
      router.refresh();
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[var(--nht-radius-xl)] border border-dashed border-white/10 px-6 py-16 text-center text-sm text-[var(--nht-text-secondary)]">
        {labels.empty}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
      <div className="overflow-x-auto rounded-[var(--nht-radius-xl)] border border-white/[0.06]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/[0.06] bg-white/[0.02] text-overline text-[var(--nht-text-tertiary)]">
            <tr>
              <th className="px-4 py-3 font-medium">{labels.creator}</th>
              <th className="px-4 py-3 font-medium">{labels.amount}</th>
              <th className="px-4 py-3 font-medium">{labels.currency}</th>
              <th className="px-4 py-3 font-medium">{labels.method}</th>
              <th className="px-4 py-3 font-medium">{labels.requested}</th>
              <th className="px-4 py-3 font-medium">{labels.approved}</th>
              <th className="px-4 py-3 font-medium">{labels.paid}</th>
              <th className="px-4 py-3 font-medium">{labels.status}</th>
              <th className="px-4 py-3 text-right font-medium">{labels.actions}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-white/[0.04]">
                <td className="px-4 py-3 text-white">
                  {item.creator ? (
                    <Link
                      href={`/admin/creators/${item.creator.id}`}
                      className="hover:text-[var(--nht-accent)]"
                    >
                      {item.creator.display_name || item.creator.full_name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-white">
                  <MoneyCell value={item.amount} locale={locale} currency={item.currency} />
                </td>
                <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                  {item.currency}
                </td>
                <td className="px-4 py-3 text-[var(--nht-text-secondary)]">
                  {methodLabels[item.method] ?? item.method}
                </td>
                <td className="px-4 py-3 text-[var(--nht-text-tertiary)]">
                  {formatDate(item.requested_at ?? item.created_at, locale)}
                </td>
                <td className="px-4 py-3 text-[var(--nht-text-tertiary)]">
                  {formatDate(item.approved_at, locale)}
                </td>
                <td className="px-4 py-3 text-[var(--nht-text-tertiary)]">
                  {formatDate(item.paid_at, locale)}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(item.status)}>
                    {statusLabels[item.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <Link
                      href={`/admin/finance/payouts/${item.id}`}
                      className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white hover:text-[var(--nht-accent)]"
                    >
                      {labels.view}
                    </Link>
                    {canApprove && item.status === "pending" ? (
                      <>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => run(() => approvePayout({ id: item.id }))}
                          className="rounded-full border border-emerald-500/30 px-2.5 py-1 text-[11px] text-emerald-300"
                        >
                          {labels.approve}
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => setRejectId(item.id)}
                          className="rounded-full border border-red-500/30 px-2.5 py-1 text-[11px] text-red-300"
                        >
                          {labels.reject}
                        </button>
                      </>
                    ) : null}
                    {canApprove && item.status === "processing" ? (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => run(() => payPayout({ id: item.id }))}
                        className="rounded-full bg-[var(--nht-accent)] px-2.5 py-1 text-[11px] text-white"
                      >
                        {labels.pay}
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rejectId ? (
        <div className="rounded-[var(--nht-radius-xl)] border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm text-white">{labels.rejectReason}</p>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            className="nht-input mt-2"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={isPending || !reason.trim()}
              onClick={() =>
                run(() =>
                  rejectPayout({ id: rejectId, rejection_reason: reason.trim() }),
                )
              }
              className="rounded-full bg-red-500/80 px-3 py-1.5 text-xs text-white disabled:opacity-60"
            >
              {labels.confirmReject}
            </button>
            <button
              type="button"
              onClick={() => {
                setRejectId(null);
                setReason("");
              }}
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white"
            >
              {labels.cancel}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
