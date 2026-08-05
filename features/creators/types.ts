import type {
  CreatorStatus,
  Tables,
} from "@/types/database.types";

export type CreatorManager = {
  id: string;
  full_name: string | null;
};

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
  currentRevenue: number;
  averageRevenue: number;
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
] as const;

export type CreatorPlatform = (typeof CREATOR_PLATFORMS)[number];

export const PLATFORM_URL_FIELDS = [
  "onlyfans_url",
  "fansly_url",
  "chaturbate_url",
  "instagram_url",
  "tiktok_url",
  "twitter_url",
] as const;

export type PlatformUrlField = (typeof PLATFORM_URL_FIELDS)[number];

export type { CreatorStatus };
