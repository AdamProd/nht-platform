/**
 * Detect PostgREST / Postgres schema drift errors so callers can degrade
 * gracefully instead of crashing the admin shell.
 */
export function isSchemaDriftError(message: string | null | undefined): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return (
    m.includes("does not exist") ||
    m.includes("could not find") ||
    m.includes("schema cache") ||
    m.includes("invalid input value for enum") ||
    m.includes("column") && m.includes("of relation") ||
    m.includes("undefined column") ||
    m.includes("pgrst") && (m.includes("204") || m.includes("205"))
  );
}
