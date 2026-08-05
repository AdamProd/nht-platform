import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import type { ActivityLogRow } from "@/features/core/events/types";
import { isSchemaDriftError } from "@/shared/utils";

export const ACTIVITY_PAGE_SIZE = 30;

export const activityFiltersSchema = z.object({
  q: z.string().trim().max(200).optional().default(""),
  module: z.string().trim().max(40).optional().default(""),
  page: z.coerce.number().int().min(1).default(1),
});

export type ActivityFilterParams = z.infer<typeof activityFiltersSchema>;

const EMPTY_LIST = {
  items: [] as ActivityLogRow[],
  total: 0,
  page: 1,
  pageSize: ACTIVITY_PAGE_SIZE,
  totalPages: 1,
};

export async function listActivityLogs(
  raw: Partial<ActivityFilterParams> | Record<string, string | undefined>,
): Promise<{
  items: ActivityLogRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const session = await requireStaffSession();
  if (!session) throw new Error("Unauthorized");

  const filters = activityFiltersSchema.parse({
    q: raw.q ?? "",
    module: raw.module || undefined,
    page: raw.page ?? 1,
  });

  try {
    const from = (filters.page - 1) * ACTIVITY_PAGE_SIZE;
    const to = from + ACTIVITY_PAGE_SIZE - 1;

    const supabase = await createClient();
    let query = supabase
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
      .order("created_at", { ascending: false })
      .range(from, to);

    if (session.profile.role === "manager") {
      const { data: creators } = await supabase
        .from("creators")
        .select("id")
        .eq("manager_id", session.profile.id);
      const ids = (creators ?? []).map((row) => row.id);
      if (ids.length === 0) {
        return { ...EMPTY_LIST, page: filters.page };
      }
      query = query
        .eq("visibility", "manager_scoped")
        .in("related_creator_id", ids);
    } else if (session.profile.role === "admin") {
      query = query.neq("visibility", "owner");
    }

    if (filters.module) {
      query = query.eq("module", filters.module);
    }

    if (filters.q) {
      const term = filters.q.replaceAll("%", "").replaceAll("_", "");
      query = query.or(
        `description.ilike.%${term}%,event_type.ilike.%${term}%,module.ilike.%${term}%`,
      );
    }

    const { data, error, count } = await query;
    if (error) {
      console.error("[listActivityLogs]", error.message);
      if (isSchemaDriftError(error.message)) {
        return { ...EMPTY_LIST, page: filters.page };
      }
      throw new Error("Failed to load activity.");
    }

    const total = count ?? 0;
    return {
      items: (data ?? []) as ActivityLogRow[],
      total,
      page: filters.page,
      pageSize: ACTIVITY_PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(total / ACTIVITY_PAGE_SIZE)),
    };
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") throw error;
    console.error("[listActivityLogs]", error);
    return { ...EMPTY_LIST, page: filters.page };
  }
}
