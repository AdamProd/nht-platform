import type { FinanceTransactionStatus } from "@/features/finance/types";

export default function FinanceStatusBadge({
  status,
  label,
}: {
  status: FinanceTransactionStatus | string;
  label: string;
}) {
  return (
    <span
      data-status={status}
      className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-white"
    >
      {label}
    </span>
  );
}
