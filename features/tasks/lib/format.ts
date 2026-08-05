export function formatTaskDate(
  value: string | null | undefined,
  locale = "en",
): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatTaskDateTime(
  value: string | null | undefined,
  locale = "en",
): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function isTaskOverdue(
  dueDate: string | null | undefined,
  status: string,
): boolean {
  if (!dueDate) return false;
  if (status === "completed" || status === "archived") return false;
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return false;
  return due.getTime() < Date.now();
}

export function startOfLocalDay(date = new Date()): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function endOfLocalDay(date = new Date()): Date {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

export type DeadlineTone = "overdue" | "today" | "tomorrow" | "soon" | "later" | "none";

export type DeadlineInfo = {
  tone: DeadlineTone;
  key:
    | "none"
    | "overdue"
    | "today"
    | "tomorrow"
    | "inDays"
    | "daysAgo";
  days?: number;
};

export function getDeadlineInfo(
  dueDate: string | null | undefined,
  status: string,
): DeadlineInfo {
  if (!dueDate) return { tone: "none", key: "none" };
  if (status === "completed" || status === "archived") {
    return { tone: "later", key: "none" };
  }

  const due = startOfLocalDay(new Date(dueDate));
  const today = startOfLocalDay();
  if (Number.isNaN(due.getTime())) return { tone: "none", key: "none" };

  const diffMs = due.getTime() - today.getTime();
  const days = Math.round(diffMs / (24 * 60 * 60 * 1000));

  if (days < 0) return { tone: "overdue", key: "overdue", days: Math.abs(days) };
  if (days === 0) return { tone: "today", key: "today" };
  if (days === 1) return { tone: "tomorrow", key: "tomorrow" };
  if (days <= 7) return { tone: "soon", key: "inDays", days };
  return { tone: "later", key: "inDays", days };
}

export function priorityRank(priority: string): number {
  switch (priority) {
    case "urgent":
      return 0;
    case "high":
      return 1;
    case "medium":
      return 2;
    case "low":
      return 3;
    default:
      return 4;
  }
}

export function formatFileSize(bytes: number | null | undefined, locale = "en"): string {
  if (bytes == null || !Number.isFinite(bytes)) return "—";
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    style: "unit",
    unit: "byte",
    unitDisplay: "narrow",
  }).format(bytes);
}
