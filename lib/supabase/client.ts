import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";
import { getSupabaseClientEnv } from "@/lib/supabase/env";

export function createClient() {
  const { url, anonKey } = getSupabaseClientEnv();

  return createBrowserClient<Database>(url, anonKey);
}
