export const adminNavItems = [
  { href: "/admin", labelKey: "dashboard", match: "exact" as const },
  {
    href: "/admin/applications",
    labelKey: "applications",
    match: "prefix" as const,
  },
  {
    href: "/admin/creators",
    labelKey: "creators",
    match: "prefix" as const,
  },
  { href: "/admin/blog", labelKey: "blog", match: "prefix" as const },
  {
    href: "/admin/analytics",
    labelKey: "analytics",
    match: "prefix" as const,
  },
  {
    href: "/admin/settings",
    labelKey: "settings",
    match: "prefix" as const,
  },
] as const;

export type AdminNavItem = (typeof adminNavItems)[number];

export function isAdminNavActive(
  pathname: string,
  item: AdminNavItem,
): boolean {
  // pathname from next-intl may omit locale or include it depending on version;
  // normalize to path without locale prefix for matching.
  const normalized = pathname.replace(/^\/(en|ru|de|fr|es|it|pt|pl|cs|uk)(?=\/|$)/, "") || "/";

  if (item.match === "exact") {
    return normalized === item.href || normalized === `${item.href}/`;
  }

  return (
    normalized === item.href ||
    normalized.startsWith(`${item.href}/`)
  );
}
