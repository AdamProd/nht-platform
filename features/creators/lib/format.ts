export function formatDateTime(
  value: string | null | undefined,
  locale = "en",
): string {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function formatDate(
  value: string | null | undefined,
  locale = "en",
): string {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function formatList(values: string[] | null | undefined): string {
  if (!values || values.length === 0) return "—";
  return values.join(", ");
}

export function formatMoney(
  value: number | null | undefined,
  locale = "en",
  currency = "USD",
): string {
  const amount = Number(value ?? 0);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(0)}`;
  }
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function displayNameOf(creator: {
  display_name?: string | null;
  full_name: string;
}): string {
  return creator.display_name?.trim() || creator.full_name;
}
