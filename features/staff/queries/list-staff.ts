import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireStaffSession, isAdminOrAbove } from "@/lib/auth";
import { staffListFiltersSchema } from "@/features/staff/schemas/staff.schema";
import {
  STAFF_EMPLOYEE_ROLES,
  STAFF_PAGE_SIZE,
  type StaffListItem,
  type StaffListResult,
} from "@/features/staff/types";

export async function listStaff(
  raw: Record<string, string | undefined> | Partial<z.infer<typeof staffListFiltersSchema>>,
): Promise<StaffListResult> {
  const session = await requireStaffSession();
  if (!session) throw new Error("Unauthorized");

  // Managers and below only see themselves on the list endpoint
  if (!isAdminOrAbove(session.profile.role)) {
    const self = await getStaffListSelf(session.profile.id);
    return {
      items: self ? [self] : [],
      total: self ? 1 : 0,
      page: 1,
      pageSize: STAFF_PAGE_SIZE,
      totalPages: 1,
    };
  }

  const filters = staffListFiltersSchema.parse({
    q: raw.q ?? "",
    role: raw.role || undefined,
    department: raw.department || undefined,
    status: raw.status || undefined,
    sort: raw.sort || undefined,
    page: raw.page ?? 1,
  });

  const from = (filters.page - 1) * STAFF_PAGE_SIZE;
  const to = from + STAFF_PAGE_SIZE - 1;

  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .in("role", [...STAFF_EMPLOYEE_ROLES])
    .range(from, to);

  if (filters.role) query = query.eq("role", filters.role as never);
  if (filters.department) {
    query = query.eq("department", filters.department as never);
  }
  if (filters.status) query = query.eq("status", filters.status as never);

  if (filters.q) {
    const term = filters.q.replaceAll("%", "").replaceAll("_", "");
    query = query.or(
      `full_name.ilike.%${term}%,email.ilike.%${term}%`,
    );
  }

  if (filters.sort === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else if (filters.sort === "name") {
    query = query.order("full_name", { ascending: true, nullsFirst: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error, count } = await query;
  if (error) {
    console.error("[listStaff]", error.message);
    throw new Error("Failed to load staff.");
  }

  const ids = (data ?? []).map((row) => row.id);
  const counts = await countManagedCreators(ids);

  const items: StaffListItem[] = (data ?? []).map((row) => ({
    ...row,
    managed_creators_count: counts.get(row.id) ?? 0,
  }));

  const total = count ?? 0;
  return {
    items,
    total,
    page: filters.page,
    pageSize: STAFF_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / STAFF_PAGE_SIZE)),
  };
}

async function getStaffListSelf(id: string): Promise<StaffListItem | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const counts = await countManagedCreators([id]);
  return {
    ...data,
    managed_creators_count: counts.get(id) ?? 0,
  };
}

async function countManagedCreators(
  managerIds: string[],
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (managerIds.length === 0) return map;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("creators")
    .select("id, manager_id")
    .in("manager_id", managerIds);

  if (error) {
    console.error("[countManagedCreators]", error.message);
    return map;
  }

  for (const row of data ?? []) {
    if (!row.manager_id) continue;
    map.set(row.manager_id, (map.get(row.manager_id) ?? 0) + 1);
  }
  return map;
}
