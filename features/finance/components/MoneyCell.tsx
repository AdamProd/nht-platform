import { formatFinanceMoney } from "@/features/finance/lib/format";

/** Alias used by dashboard cards / table cells. */
export function MoneyCell({
  value,
  locale,
  currency = "USD",
  className = "text-white",
}: {
  value: number | null | undefined;
  locale: string;
  currency?: string;
  className?: string;
}) {
  return (
    <span className={className}>
      {formatFinanceMoney(value, locale, currency)}
    </span>
  );
}

export default MoneyCell;
