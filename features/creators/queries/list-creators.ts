import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import {
  creatorsListFiltersSchema,
  type CreatorsListFilters,
} from "@/features/creators/schemas/creator.schema";
import type {
  CreatorListItem,
  CreatorsListResult,
} from "@/features/creators/types";

export const CREATORS_PAGE_SIZE = 20;

const LIST_SELECT = `
  *,
  manager:profiles!creators_manager_id_fkey (
    id,
    full_name
  )
`;

export async function listCreators(
  raw: Partial<CreatorsListFilters> | Record<string, string | undefined>,
): Promise<CreatorsListResult> {
  const session = await requireStaffSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const filters = creatorsListFiltersSchema.parse({
    q: raw.q ?? "",
    status: raw.status || undefined,
    manager: raw.manager || undefined,
    country: raw.country ?? "",
    platform: raw.platform || undefined,
    sort: raw.sort || undefined,
    page: raw.page ?? 1,
  });

  const page = filters.page;
  const from = (page - 1) * CREATORS_PAGE_SIZE;
  const to = from + CREATORS_PAGE_SIZE - 1;

  const supabase = await createClient();

  let query = supabase
    .from("creators")
    .select(LIST_SELECT, { count: "exact" })
    .range(from, to);

  if (session.profile.role === "manager") {
    query = query.eq("manager_id", session.profile.id);
  }

  if (filters.q) {
    const term = filters.q.replaceAll(",", " ").trim().replaceAll("%", "").replaceAll("_", "");
    query = query.or(
      [
        `display_name.ilike.%${term}%`,
        `full_name.ilike.%${term}%`,
        `legal_name.ilike.%${term}%`,
        `email.ilike.%${term}%`,
        `telegram.ilike.%${term}%`,
      ].join(","),
    );
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.manager && session.profile.role !== "manager") {
    query = query.eq("manager_id", filters.manager);
  }

  if (filters.country) {
    query = query.ilike("country", `%${filters.country}%`);
  }

  if (filters.platform) {
    query = query.contains("platforms", [filters.platform]);
  }

  if (filters.sort === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else if (filters.sort === "name") {
    query = query.order("display_name", { ascending: true });
  } else if (filters.sort === "revenue") {
    query = query.order("revenue_current_month", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[listCreators]", error.message);
    throw new Error("Failed to load creators.");
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / CREATORS_PAGE_SIZE));

  return {
    items: (data ?? []) as CreatorListItem[],
    total,
    page,
    pageSize: CREATORS_PAGE_SIZE,
    totalPages,
  };
}
