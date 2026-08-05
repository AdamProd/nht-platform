/** Avatar files live in the existing private `applications` bucket. */
export const CREATOR_AVATAR_BUCKET = "applications";

export const CREATOR_AVATAR_MAX_BYTES = 5 * 1024 * 1024;

export const CREATOR_AVATAR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type CreatorAvatarMime = (typeof CREATOR_AVATAR_MIME_TYPES)[number];

const EXT_BY_MIME: Record<CreatorAvatarMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Reserved keys inside creators.platform_accounts (not platform URLs). */
export const CREATOR_BIOGRAPHY_KEY = "__biography";

export function isCreatorAvatarMime(
  value: string,
): value is CreatorAvatarMime {
  return (CREATOR_AVATAR_MIME_TYPES as readonly string[]).includes(value);
}

export function creatorAvatarPath(
  creatorId: string,
  mime: CreatorAvatarMime,
): string {
  const ext = EXT_BY_MIME[mime];
  return `creator-avatars/${creatorId}/${Date.now()}.${ext}`;
}

export function isStoredCreatorAvatarPath(value: string | null | undefined): boolean {
  return Boolean(value && value.startsWith("creator-avatars/"));
}

export function platformAccountsRecord(
  value: unknown,
): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const out: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (typeof entry === "string") out[key] = entry;
  }
  return out;
}

export function getCreatorBiography(platformAccounts: unknown): string | null {
  const value = platformAccountsRecord(platformAccounts)[CREATOR_BIOGRAPHY_KEY];
  return value?.trim() ? value : null;
}

export function withCreatorBiography(
  platformAccounts: unknown,
  biography: string | null,
): Record<string, string> {
  const next = platformAccountsRecord(platformAccounts);
  if (biography?.trim()) {
    next[CREATOR_BIOGRAPHY_KEY] = biography.trim();
  } else {
    delete next[CREATOR_BIOGRAPHY_KEY];
  }
  return next;
}

/** Platform URL map without reserved meta keys. */
export function visiblePlatformAccounts(
  platformAccounts: unknown,
): Record<string, string> {
  const next = platformAccountsRecord(platformAccounts);
  for (const key of Object.keys(next)) {
    if (key.startsWith("__")) delete next[key];
  }
  return next;
}

export function visiblePlatformCount(platformAccounts: unknown): number {
  return Object.keys(visiblePlatformAccounts(platformAccounts)).length;
}
