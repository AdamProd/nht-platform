import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { getSupabaseServerEnv } from "@/lib/supabase/env";

/**
 * Service-role client for server-only operations (cron, owner actions, public form ingestion).
 * Never import this module from client components.
 */
export function createAdminClient() {
  const { url, serviceRoleKey } = getSupabaseServerEnv();

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
