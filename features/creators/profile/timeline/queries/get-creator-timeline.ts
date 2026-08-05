import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import { hasPermission } from "@/features/core/permissions";
import type { ActivityLogRow } from "@/features/core/events/types";
import {
  formatTimelineMoney,
  resolveTimelineVisual,
} from "@/features/creators/profile/timeline/lib/map-timeline-event";
import type {
  CreatorTimelineItem,
  CreatorTimelinePage,
} from "@/features/creators/profile/timeline/types/timeline";
import { CREATOR_TIMELINE_PAGE_SIZE } from "@/features/creators/profile/timeline/types/timeline";

type TimelineCopy = Record<string, string>;

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function interpolate(
  template: string,
  vars: Record<string, string | null | undefined>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "");
}

function buildDescription(
  eventType: string,
  descriptionKey: string,
  copy: TimelineCopy,
  payload: Record<string, unknown>,
  fallbackDescription: string,
): string {
  const template = copy[descriptionKey] ?? copy.genericEventDesc ?? fallbackDescription;
  const amount =
    formatTimelineMoney(
      payload.amount ?? payload.creator_amount ?? payload.gross_revenue,
      pickString(payload.currency) ?? "USD",
    ) ?? null;
  const manager = pickString(
    payload.managerName,
    payload.manager_name,
    payload.assigned_manager_name,
  );
  const status = pickString(payload.status, payload.nextStatus);
  const platform = pickString(payload.platform, payload.platformName);
  const name = pickString(payload.name, payload.display_name, payload.email);

  const filled = interpolate(template, {
    amount: amount ?? "",
    manager: manager ?? "",
    status: status ?? "",
    platform: platform ?? "",
    name: name ?? "",
  }).replace(/\s+/g, " ").trim();

  if (filled && !filled.includes("{")) return filled;

  // Prefer stored activity description when template vars are empty.
  if (fallbackDescription.trim()) return fallbackDescription.trim();

  if (amount && eventType.includes("payout")) return amount;
  if (manager) return manager;
  if (platform) return platform;
  return copy.genericEventDesc ?? fallbackDescription;
}

export function mapActivityRowToTimelineItem(
  row: ActivityLogRow,
  copy: TimelineCopy,
  unknownActor: string,
): CreatorTimelineItem {
  const visual = resolveTimelineVisual(row.event_type);
  const payload = asRecord(row.payload);
  const title = copy[visual.titleKey] ?? row.event_type;
  const description = buildDescription(
    row.event_type,
    visual.descriptionKey,
    copy,
    payload,
    row.description ?? "",
  );

  return {
    id: row.id,
    type: row.event_type,
    title,
    description,
    created_at: row.created_at,
    actor: {
      id: row.actor_id,
      name: row.actor?.full_name?.trim() || unknownActor,
      role: row.actor?.role ?? row.actor_role,
    },
    icon: visual.icon,
    color: visual.color,
    metadata: payload,
  };
}

export async function getCreatorTimeline(
  creatorId: string,
  page = 1,
  limit = CREATOR_TIMELINE_PAGE_SIZE,
  copy: TimelineCopy = {},
  unknownActor = "System",
): Promise<CreatorTimelinePage> {
  const session = await requireStaffSession();
  if (!session) throw new Error("Unauthorized");
  if (!hasPermission(session.profile.role, "creators.read")) {
    throw new Error("Forbidden");
  }

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 50);
  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit; // fetch one extra to detect hasMore

  const supabase = await createClient();
  const { data, error, count } = await supabase
    .from("activity_logs")
    .select(
      `
      *,
      actor:profiles!activity_logs_actor_id_fkey (
        id,
        full_name,
        avatar_url,
        role
      )
    `,
      { count: "exact" },
    )
    .or(
      `related_creator_id.eq.${creatorId},and(entity_type.eq.creator,entity_id.eq.${creatorId})`,
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("[getCreatorTimeline]", error.message);
    return {
      items: [],
      page: safePage,
      limit: safeLimit,
      hasMore: false,
      total: 0,
    };
  }

  const rows = (data ?? []) as ActivityLogRow[];
  const hasMore = rows.length > safeLimit;
  const pageRows = hasMore ? rows.slice(0, safeLimit) : rows;

  return {
    items: pageRows.map((row) =>
      mapActivityRowToTimelineItem(row, copy, unknownActor),
    ),
    page: safePage,
    limit: safeLimit,
    hasMore,
    total: count ?? pageRows.length,
  };
}
