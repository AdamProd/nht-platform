import type {
  CreatorStatus,
  Json,
  Tables,
} from "@/types/database.types";

export type CreatorManager = {
  id: string;
  full_name: string | null;
};

export type CreatorPlatformKey =
  | "onlyfans"
  | "fansly"
  | "chaturbate"
  | "instagram"
  | "tiktok"
  | "twitter";

export type CreatorPlatformAccounts = Partial<
  Record<CreatorPlatformKey, string | null>
>;

export type CreatorListItem = Tables<"creators"> & {
  manager: CreatorManager | null;
};

export type CreatorDetail = CreatorListItem;

export type CreatorsListResult = {
  items: CreatorListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type CreatorStats = {
  total: number;
  active: number;
  vacation: number;
  inactive: number;
  revenueCurrent: number;
  revenueAverage: number;
};

export type CreatorActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };

export type CreatorSort = "newest" | "oldest" | "name" | "revenue";

export const CREATOR_PLATFORMS = [
  "onlyfans",
  "fansly",
  "chaturbate",
  "instagram",
  "tiktok",
  "twitter",
] as const satisfies readonly CreatorPlatformKey[];

export type CreatorPlatform = (typeof CREATOR_PLATFORMS)[number];

export function parsePlatformAccounts(
  value: Json | CreatorPlatformAccounts | null | undefined,
): CreatorPlatformAccounts {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const source = value as Record<string, unknown>;
  const result: CreatorPlatformAccounts = {};

  for (const key of CREATOR_PLATFORMS) {
    const raw = source[key];
    if (typeof raw === "string" && raw.trim()) {
      result[key] = raw.trim();
    }
  }

  return result;
}

export function platformsFromAccounts(
  accounts: CreatorPlatformAccounts,
): CreatorPlatformKey[] {
  return CREATOR_PLATFORMS.filter((key) => Boolean(accounts[key]?.trim()));
}

export type { CreatorStatus };
