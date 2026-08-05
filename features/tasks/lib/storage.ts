export const TASK_FILES_BUCKET = "task-files" as const;

export const TASK_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "image/png",
  "image/jpeg",
  "application/zip",
  "application/x-zip-compressed",
] as const;

export const TASK_MAX_FILE_BYTES = 50 * 1024 * 1024;

export function taskFilePath(taskId: string, fileName: string): string {
  const safe = fileName.replace(/[^\w.\-]+/g, "_").slice(0, 120);
  return `${taskId}/${Date.now()}-${safe}`;
}

export function isAllowedTaskMime(mime: string | null | undefined): boolean {
  if (!mime) return false;
  return (TASK_ALLOWED_MIME_TYPES as readonly string[]).includes(mime);
}
