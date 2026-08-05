import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Tables, TablesInsert } from "@/types/database.types";

/**
 * Live schema has no creators.user_id. Creators are linked to auth users by
 * email (auth.users.email ↔ creators.email). profiles.id = auth.users.id.
 *
 * Staff-only RLS on creators means a creator session cannot SELECT their own
 * row with the anon client — resolve via service role after auth is verified.
 */
export async function findCreatorByAuthEmail(
  user: User,
): Promise<Tables<"creators"> | null> {
  const email = user.email?.trim();
  if (!email) return null;

  const admin = createAdminClient();

  const { data: exact, error: exactError } = await admin
    .from("creators")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (exactError) {
    console.error("[auth.findCreatorByAuthEmail]", exactError.message);
  }
  if (exact) return exact;

  const { data: rows, error } = await admin.from("creators").select("*").limit(500);

  if (error) {
    console.error("[auth.findCreatorByAuthEmail.fallback]", error.message);
    return null;
  }

  const needle = email.toLowerCase();
  return (
    (rows ?? []).find((row) => row.email.toLowerCase() === needle) ?? null
  );
}

/**
 * Resolve the CRM row for an authenticated creator.
 * 1) Match by email
 * 2) Claim a single orphan CRM row (email not tied to any auth user)
 * 3) Create a minimal creators row for this auth email
 */
export async function resolveCreatorForAuthUser(
  user: User,
  profileName?: string | null,
): Promise<Tables<"creators"> | null> {
  const email = user.email?.trim();
  if (!email) return null;

  const existing = await findCreatorByAuthEmail(user);
  if (existing) return existing;

  const admin = createAdminClient();
  const displayName =
    profileName?.trim() ||
    (user.user_metadata?.full_name as string | undefined)?.trim() ||
    email.split("@")[0] ||
    "Creator";

  // Claim orphan CRM row when exactly one creator email is not an auth user.
  const claimed = await claimOrphanCreator(admin, email, displayName);
  if (claimed) return claimed;

  const row: TablesInsert<"creators"> = {
    email,
    display_name: displayName,
    full_name: displayName,
    status: "active",
    is_active: true,
    languages: [],
    platforms: [],
    platform_accounts: {},
    last_login_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString(),
  };

  const { data: created, error } = await admin
    .from("creators")
    .insert(row)
    .select("*")
    .single();

  if (error) {
    console.error("[auth.resolveCreatorForAuthUser.insert]", error.message);
    // Race: another request may have inserted — retry email match
    return findCreatorByAuthEmail(user);
  }

  return created;
}

async function claimOrphanCreator(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
  displayName: string,
): Promise<Tables<"creators"> | null> {
  const { data: creators, error: creatorsError } = await admin
    .from("creators")
    .select("*")
    .limit(500);

  if (creatorsError || !creators?.length) {
    if (creatorsError) {
      console.error("[auth.claimOrphanCreator]", creatorsError.message);
    }
    return null;
  }

  let authEmails = new Set<string>();
  try {
    const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    authEmails = new Set(
      (listed.data.users ?? [])
        .map((u) => u.email?.toLowerCase())
        .filter((value): value is string => Boolean(value)),
    );
  } catch (error) {
    console.error("[auth.claimOrphanCreator.listUsers]", error);
    return null;
  }

  const orphans = creators.filter(
    (row) => !authEmails.has(row.email.toLowerCase()),
  );

  // Only auto-claim when there is a single orphan — avoids stealing the wrong row.
  if (orphans.length !== 1) return null;

  const orphan = orphans[0];
  const { data: claimed, error } = await admin
    .from("creators")
    .update({
      email,
      display_name: orphan.display_name || displayName,
      full_name: orphan.full_name || displayName,
      last_login_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    })
    .eq("id", orphan.id)
    .select("*")
    .single();

  if (error) {
    console.error("[auth.claimOrphanCreator.update]", error.message);
    return null;
  }

  return claimed;
}

export async function findCreatorById(
  creatorId: string,
): Promise<Tables<"creators"> | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("creators")
    .select("*")
    .eq("id", creatorId)
    .maybeSingle();

  if (error) {
    console.error("[auth.findCreatorById]", error.message);
    return null;
  }

  return data ?? null;
}
