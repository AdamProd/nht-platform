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
