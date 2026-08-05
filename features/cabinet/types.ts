export type CabinetActionResult =
  | { success: true }
  | { success: false; error: string };

export const CABINET_PLATFORMS = [
  "onlyfans",
  "fansly",
  "instagram",
  "tiktok",
  "twitter",
  "chaturbate",
] as const;

export type CabinetPlatform = (typeof CABINET_PLATFORMS)[number];

export const STAT_RANGES = ["7d", "30d", "90d", "12m"] as const;
export type StatRange = (typeof STAT_RANGES)[number];

export function rangeToDays(range: StatRange): number {
  switch (range) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
    case "12m":
      return 365;
  }
}
