export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function ensureSlug(title: string, slug?: string | null): string {
  const fromSlug = slug ? slugify(slug) : "";
  if (fromSlug) return fromSlug;
  const fromTitle = slugify(title);
  return fromTitle || `post-${Date.now()}`;
}
