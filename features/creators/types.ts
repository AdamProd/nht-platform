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

export type CreatorActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };

export type CreatorSort = "newest" | "oldest" | "name";

export const CREATOR_PLATFORMS = [
  "onlyfans",
  "fansly",
  "manyvids",
  "multiple",
  "emerging",
  "other",
] as const;

export type CreatorPlatform = (typeof CREATOR_PLATFORMS)[number];

export type { CreatorStatus };
