export const creatorNavItems = [
  { href: "/creator", labelKey: "dashboard", match: "exact" as const },
  { href: "/creator/profile", labelKey: "profile", match: "prefix" as const },
  {
    href: "/creator/platforms",
    labelKey: "platforms",
    match: "prefix" as const,
  },
  {
    href: "/creator/statistics",
    labelKey: "statistics",
    match: "prefix" as const,
  },
  { href: "/creator/tasks", labelKey: "tasks", match: "prefix" as const },
  { href: "/creator/finance", labelKey: "finance", match: "prefix" as const },
  { href: "/creator/payouts", labelKey: "payouts", match: "prefix" as const },
  {
    href: "/creator/documents",
    labelKey: "documents",
    match: "prefix" as const,
  },
  { href: "/creator/support", labelKey: "support", match: "prefix" as const },
  {
    href: "/creator/settings",
    labelKey: "settings",
    match: "prefix" as const,
  },
] as const;

export type CreatorNavItem = (typeof creatorNavItems)[number];

export function isCreatorNavActive(
  pathname: string,
  item: CreatorNavItem,
): boolean {
  const normalized =
    pathname.replace(/^\/(en|ru|de|fr|es|it|pt|pl|cs|uk)(?=\/|$)/, "") || "/";

  if (item.match === "exact") {
    return normalized === item.href || normalized === `${item.href}/`;
  }

  return (
    normalized === item.href || normalized.startsWith(`${item.href}/`)
  );
}
