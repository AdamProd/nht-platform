import { createClient } from "@/lib/supabase/server";
import type { PlatformBreakdownItem } from "@/features/dashboard/types";

const PLATFORM_LABELS: Record<string, string> = {
  onlyfans: "OnlyFans",
  fansly: "Fansly",
  manyvids: "ManyVids",
  multiple: "Multiple",
  emerging: "Emerging",
};

function normalizePlatform(platform: string | null): string {
  if (!platform) return "other";
  const key = platform.trim().toLowerCase();
  return PLATFORM_LABELS[key] ? key : "other";
}

export async function getPlatformBreakdown(): Promise<PlatformBreakdownItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applications")
    .select("platform");

  if (error) {
    console.error("[getPlatformBreakdown]", error.message);
    throw new Error("Failed to load platform breakdown.");
  }

  const counts = new Map<string, number>();

  for (const row of data ?? []) {
    const key = normalizePlatform(row.platform);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const items: PlatformBreakdownItem[] = [...counts.entries()].map(
    ([platform, count]) => ({
      platform,
      label:
        platform === "other"
          ? "Other"
          : (PLATFORM_LABELS[platform] ?? platform),
      count,
    }),
  );

  items.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  return items;
}
