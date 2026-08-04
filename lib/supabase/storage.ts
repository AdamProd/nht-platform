export const APPLICATIONS_BUCKET = "applications" as const;

export const APPLICATION_FILE_CATEGORIES = [
  "screenshots",
  "identity",
  "contracts",
  "other",
] as const;

export type ApplicationFileCategory =
  (typeof APPLICATION_FILE_CATEGORIES)[number];

export function applicationStoragePath(
  applicationId: string,
  category: ApplicationFileCategory,
  fileName: string,
): string {
  return `${applicationId}/${category}/${fileName}`;
}
