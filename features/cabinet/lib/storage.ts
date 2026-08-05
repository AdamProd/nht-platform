export const CREATOR_DOCUMENTS_BUCKET = "creator-documents" as const;

export function creatorDocumentPath(
  creatorId: string,
  docType: string,
  fileName: string,
): string {
  const safe = fileName.replace(/[^\w.\-]+/g, "_").slice(0, 120);
  return `${creatorId}/${docType}/${Date.now()}-${safe}`;
}
