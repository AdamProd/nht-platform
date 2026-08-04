import { createClient } from "@/lib/supabase/server";
import {
  applicationsListFiltersSchema,
  type ApplicationsListFilters,
} from "@/features/applications/schemas/crm.schema";
import type {
  ApplicationListItem,
  ApplicationsListResult,
} from "@/features/applications/types";

export const APPLICATIONS_PAGE_SIZE = 20;

const LIST_SELECT = `
  *,
  manager:profiles!applications_assigned_manager_fkey (
    id,
    full_name
  )
`;

export async function listApplications(
  raw: Partial<ApplicationsListFilters> | Record<string, string | undefined>,
): Promise<ApplicationsListResult> {
  const filters = applicationsListFiltersSchema.parse({
    q: raw.q ?? "",
    status: raw.status || undefined,
    priority: raw.priority || undefined,
    page: raw.page ?? 1,
  });

  const page = filters.page;
  const from = (page - 1) * APPLICATIONS_PAGE_SIZE;
  const to = from + APPLICATIONS_PAGE_SIZE - 1;

  const supabase = await createClient();

  let query = supabase
    .from("applications")
    .select(LIST_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.q) {
    const term = filters.q.replaceAll(",", " ").trim();
    query = query.or(
      `full_name.ilike.%${term}%,email.ilike.%${term}%,platform.ilike.%${term}%`,
    );
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.priority) {
    query = query.eq("priority", filters.priority);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[listApplications]", error.message);
    throw new Error("Failed to load applications.");
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / APPLICATIONS_PAGE_SIZE));

  return {
    items: (data ?? []) as ApplicationListItem[],
    total,
    page,
    pageSize: APPLICATIONS_PAGE_SIZE,
    totalPages,
  };
}
