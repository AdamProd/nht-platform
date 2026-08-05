import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Archive,
  Bell,
  DollarSign,
  FileText,
  Link2,
  MessageCircle,
  Trash2,
  User,
  Users,
} from "lucide-react";
import type {
  TimelineAccent,
  TimelineIconKind,
} from "@/features/creators/profile/timeline/types/timeline";

export const TIMELINE_ICON_MAP: Record<TimelineIconKind, LucideIcon> = {
  user: User,
  users: Users,
  dollar: DollarSign,
  link: Link2,
  file: FileText,
  message: MessageCircle,
  bell: Bell,
  archive: Archive,
  trash: Trash2,
  activity: Activity,
};

export function timelineAccentClasses(color: TimelineAccent): {
  iconWrap: string;
  rail: string;
} {
  switch (color) {
    case "green":
      return {
        iconWrap:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
        rail: "bg-emerald-500/40",
      };
    case "orange":
      return {
        iconWrap: "border-amber-500/30 bg-amber-500/10 text-amber-300",
        rail: "bg-amber-500/40",
      };
    case "blue":
      return {
        iconWrap: "border-sky-500/30 bg-sky-500/10 text-sky-300",
        rail: "bg-sky-500/40",
      };
    case "gray":
      return {
        iconWrap: "border-white/10 bg-white/[0.04] text-[var(--nht-text-tertiary)]",
        rail: "bg-white/15",
      };
    case "red":
      return {
        iconWrap: "border-red-500/30 bg-red-500/10 text-red-300",
        rail: "bg-red-500/40",
      };
    case "purple":
    default:
      return {
        iconWrap:
          "border-[var(--nht-accent)]/30 bg-[var(--nht-accent-muted)] text-[var(--nht-accent)]",
        rail: "bg-[var(--nht-accent)]/40",
      };
  }
}

export function groupTimelineByDay(
  items: { created_at: string }[],
  locale: string,
  labels: { today: string; yesterday: string },
): { key: string; label: string; indices: number[] }[] {
  const groups: { key: string; label: string; indices: number[] }[] = [];
  const indexByKey = new Map<string, number>();

  const now = new Date();
  const todayKey = dayKey(now);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = dayKey(yesterday);

  items.forEach((item, index) => {
    const date = new Date(item.created_at);
    const key = Number.isNaN(date.getTime()) ? "unknown" : dayKey(date);
    let groupIndex = indexByKey.get(key);
    if (groupIndex === undefined) {
      let label: string;
      if (key === todayKey) label = labels.today;
      else if (key === yesterdayKey) label = labels.yesterday;
      else if (key === "unknown") label = "—";
      else {
        label = new Intl.DateTimeFormat(locale, {
          day: "numeric",
          month: "short",
        }).format(date);
      }
      groupIndex = groups.length;
      indexByKey.set(key, groupIndex);
      groups.push({ key, label, indices: [] });
    }
    groups[groupIndex].indices.push(index);
  });

  return groups;
}

function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
