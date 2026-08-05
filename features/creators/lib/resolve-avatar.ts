import { createAdminClient } from "@/lib/supabase/admin";
import {
  CREATOR_AVATAR_BUCKET,
  isStoredCreatorAvatarPath,
} from "@/features/creators/lib/avatar";

const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24; // 24h

/**
 * Resolve avatar for <img src>. HTTP(S) URLs pass through.
 * Storage paths in the applications bucket become signed URLs.
 */
export async function resolveCreatorAvatarUrl(
  avatarUrl: string | null | undefined,
): Promise<string | null> {
  if (!avatarUrl) return null;
  if (/^https?:\/\//i.test(avatarUrl)) return avatarUrl;
  if (!isStoredCreatorAvatarPath(avatarUrl)) return avatarUrl;

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(CREATOR_AVATAR_BUCKET)
    .createSignedUrl(avatarUrl, SIGNED_URL_TTL_SECONDS);

  if (error) {
    console.error("[resolveCreatorAvatarUrl]", error.message);
    return null;
  }

  return data.signedUrl;
}
