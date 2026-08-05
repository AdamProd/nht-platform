export function formatFinanceMoney(
  value: number | null | undefined,
  locale: string,
  currency = "USD",
): string {
  const amount = Number(value ?? 0);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function formatFinanceDate(
  value: string | null | undefined,
  locale: string,
): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatFinanceDateTime(
  value: string | null | undefined,
  locale: string,
): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function startOfWeek(date = new Date()): string {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday start
  copy.setDate(copy.getDate() - diff);
  return copy.toISOString().slice(0, 10);
}

export function startOfMonth(date = new Date()): string {
  return new Date(date.getFullYear(), date.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
}

export function startOfYear(date = new Date()): string {
  return new Date(date.getFullYear(), 0, 1).toISOString().slice(0, 10);
}

export function startOfQuarter(date = new Date()): string {
  const quarter = Math.floor(date.getMonth() / 3);
  return new Date(date.getFullYear(), quarter * 3, 1).toISOString().slice(0, 10);
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
