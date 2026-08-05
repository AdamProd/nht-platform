import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireStaffSession, isAdminOrAbove } from "@/lib/auth";
import { staffListFiltersSchema } from "@/features/staff/schemas/staff.schema";
import {
  STAFF_DEPARTMENTS,
  STAFF_EMPLOYEE_ROLES,
  STAFF_PAGE_SIZE,
  type StaffListItem,
  type StaffListResult,
} from "@/features/staff/types";
import type { UserRole } from "@/types/database.types";
import { isSchemaDriftError } from "@/shared/utils";

/** Roles that exist on the original Phase 2 enum (always safe to filter). */
const LEGACY_STAFF_ROLES: readonly UserRole[] = [
  "owner",
  "admin",
  "manager",
] as const;

export async function listStaff(
  raw:
    | Record<string, string | undefined>
    | Partial<z.infer<typeof staffListFiltersSchema>>,
): Promise<StaffListResult> {
  const session = await requireStaffSession();
  if (!session) throw new Error("Unauthorized");

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

  try {
    const result = await queryStaffList(filters, from, to, [
      ...STAFF_EMPLOYEE_ROLES,
    ]);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!isSchemaDriftError(message)) {
      console.error("[listStaff]", message);
      throw new Error("Failed to load staff.");
    }

    // Live DB may lack expanded roles / staff columns — degrade gracefully.
    console.warn("[listStaff] schema drift, falling back to legacy roles");
    try {
      return await queryStaffList(
        { ...filters, department: "", status: "" },
        from,
        to,
        [...LEGACY_STAFF_ROLES],
        { omitStaffColumns: true },
      );
    } catch (fallbackError) {
      console.error("[listStaff.fallback]", fallbackError);
      return {
        items: [],
        total: 0,
        page: filters.page,
        pageSize: STAFF_PAGE_SIZE,
        totalPages: 1,
      };
    }
  }
}

async function queryStaffList(
  filters: z.infer<typeof staffListFiltersSchema>,
  from: number,
  to: number,
  roles: UserRole[],
  options?: { omitStaffColumns?: boolean },
): Promise<StaffListResult> {
  const supabase = await createClient();

  if (options?.omitStaffColumns) {
    let query = supabase
      .from("profiles")
      .select(
        "id, role, full_name, avatar_url, created_at, updated_at, email",
        { count: "exact" },
      )
      .in("role", roles)
      .range(from, to);

    if (filters.role) query = query.eq("role", filters.role as never);
    if (filters.q) {
      const term = filters.q.replaceAll("%", "").replaceAll("_", "");
      query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);
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
      console.error("[listStaff.query]", error.message);
      throw new Error(error.message);
    }

    const ids = (data ?? []).map((row) => row.id);
    const counts = await countManagedCreators(ids);
    const items: StaffListItem[] = (data ?? []).map((row) => ({
      id: row.id,
      role: row.role,
      full_name: row.full_name,
      avatar_url: row.avatar_url,
      created_at: row.created_at,
      updated_at: row.updated_at,
      email: row.email ?? null,
      phone: null,
      department: null,
      department_custom: null,
      status: null,
      timezone: null,
      locale: null,
      biography: null,
      notes: null,
      last_login_at: null,
      impersonating_creator_id: null,
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

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .in("role", roles)
    .range(from, to);

  if (filters.role) query = query.eq("role", filters.role as never);
  if (filters.department) {
    query = query.eq("department", filters.department as never);
  }
  if (filters.status) query = query.eq("status", filters.status as never);

  if (filters.q) {
    const term = filters.q.replaceAll("%", "").replaceAll("_", "");
    const departmentMatch = STAFF_DEPARTMENTS.find(
      (dept) => dept === term.toLowerCase(),
    );
    const clauses = [
      `full_name.ilike.%${term}%`,
      `email.ilike.%${term}%`,
      `department_custom.ilike.%${term}%`,
    ];
    if (departmentMatch) {
      clauses.push(`department.eq.${departmentMatch}`);
    }
    query = query.or(clauses.join(","));
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
    console.error("[listStaff.query]", error.message);
    throw new Error(error.message);
  }

  const rows = data ?? [];
  const ids = rows.map((row) => row.id);
  const counts = await countManagedCreators(ids);

  const items: StaffListItem[] = rows.map((row) => ({
    ...row,
    email: row.email ?? null,
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
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error && isSchemaDriftError(error.message)) {
    const { data: legacy } = await supabase
      .from("profiles")
      .select("id, role, full_name, avatar_url, created_at, updated_at")
      .eq("id", id)
      .maybeSingle();
    if (!legacy) return null;
    const counts = await countManagedCreators([id]);
    return {
      ...legacy,
      email: null,
      phone: null,
      department: null,
      department_custom: null,
      status: null,
      timezone: null,
      locale: null,
      biography: null,
      notes: null,
      last_login_at: null,
      impersonating_creator_id: null,
      managed_creators_count: counts.get(id) ?? 0,
    } as StaffListItem;
  }

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
