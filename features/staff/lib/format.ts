export function staffDisplayName(
  item: { full_name?: string | null; email?: string | null },
): string {
  return item.full_name?.trim() || item.email?.trim() || "—";
}

export function staffInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatStaffDate(
  value: string | null | undefined,
  locale: string,
): string {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function formatStaffDateTime(
  value: string | null | undefined,
  locale: string,
): string {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function departmentLabelKey(
  department: string | null | undefined,
  custom: string | null | undefined,
): string {
  if (!department) return "";
  if (department === "custom") return custom?.trim() || "custom";
  return department;
}
