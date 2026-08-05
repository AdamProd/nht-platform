import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import type { NotificationRow } from "@/features/events/types";

export const NOTIFICATIONS_PAGE_SIZE = 20;

export const notificationsFiltersSchema = z.object({
  q: z.string().trim().max(200).optional().default(""),
  status: z.enum(["", "unread", "read", "archived"]).optional().default(""),
  page: z.coerce.number().int().min(1).default(1),
});

export type NotificationsFilters = z.infer<typeof notificationsFiltersSchema>;

export async function getUnreadNotificationCount(): Promise<number> {
  const session = await requireStaffSession();
  if (!session) return 0;

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", session.profile.id)
    .is("read_at", null)
    .is("archived_at", null);

  if (error) {
    console.error("[getUnreadNotificationCount]", error.message);
    return 0;
  }

  return count ?? 0;
}

export async function listRecentNotifications(
  limit = 10,
): Promise<NotificationRow[]> {
  const session = await requireStaffSession();
  if (!session) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select(
      `
      *,
      actor:profiles!notifications_actor_id_fkey (
        id,
        full_name,
        role
      )
    `,
    )
    .eq("recipient_id", session.profile.id)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[listRecentNotifications]", error.message);
    return [];
  }

  return (data ?? []) as NotificationRow[];
}

export async function listNotifications(
  raw: Partial<NotificationsFilters> | Record<string, string | undefined>,
): Promise<{
  items: NotificationRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const session = await requireStaffSession();
  if (!session) throw new Error("Unauthorized");

  const filters = notificationsFiltersSchema.parse({
    q: raw.q ?? "",
    status: raw.status || undefined,
    page: raw.page ?? 1,
  });

  const from = (filters.page - 1) * NOTIFICATIONS_PAGE_SIZE;
  const to = from + NOTIFICATIONS_PAGE_SIZE - 1;

  const supabase = await createClient();
  let query = supabase
    .from("notifications")
    .select(
      `
      *,
      actor:profiles!notifications_actor_id_fkey (
        id,
        full_name,
        role
      )
    `,
      { count: "exact" },
    )
    .eq("recipient_id", session.profile.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.status === "unread") {
    query = query.is("read_at", null).is("archived_at", null);
  } else if (filters.status === "read") {
    query = query.not("read_at", "is", null).is("archived_at", null);
  } else if (filters.status === "archived") {
    query = query.not("archived_at", "is", null);
  } else {
    query = query.is("archived_at", null);
  }

  if (filters.q) {
    const term = filters.q.replaceAll("%", "").replaceAll("_", "");
    query = query.or(
      `title.ilike.%${term}%,message.ilike.%${term}%,module.ilike.%${term}%`,
    );
  }

  const { data, error, count } = await query;
  if (error) {
    console.error("[listNotifications]", error.message);
    throw new Error("Failed to load notifications.");
  }

  const total = count ?? 0;
  return {
    items: (data ?? []) as NotificationRow[],
    total,
    page: filters.page,
    pageSize: NOTIFICATIONS_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / NOTIFICATIONS_PAGE_SIZE)),
  };
}
