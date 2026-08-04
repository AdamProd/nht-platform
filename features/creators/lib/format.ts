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

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}
