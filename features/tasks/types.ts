import type {
  TaskPriority as DbTaskPriority,
  TaskStatus as DbTaskStatus,
  TaskType as DbTaskType,
  Tables,
} from "@/types/database.types";
import { Constants } from "@/types/database.types";

export type TaskStatus = DbTaskStatus;
export type TaskPriority = DbTaskPriority;
export type TaskType = DbTaskType;

export const TASK_STATUSES = Constants.public.Enums.task_status;
export const TASK_PRIORITIES = Constants.public.Enums.task_priority;
export const TASK_TYPES = Constants.public.Enums.task_type;

export type TaskRow = Tables<"tasks">;
export type TaskCommentRow = Tables<"task_comments">;
export type TaskSubtaskRow = Tables<"task_subtasks">;
export type TaskAttachmentRow = Tables<"task_attachments">;

export type TaskPerson = {
  id: string;
  full_name: string | null;
  avatar_url?: string | null;
  role?: string | null;
  department?: string | null;
};

export type TaskCreatorRef = {
  id: string;
  display_name: string | null;
  email: string | null;
};

export type TaskListItem = TaskRow & {
  creator: TaskCreatorRef | null;
  assignee: TaskPerson | null;
  author: TaskPerson | null;
};

export type TaskComment = TaskCommentRow & {
  author: TaskPerson | null;
};

export type TaskSubtask = TaskSubtaskRow;

export type TaskAttachment = TaskAttachmentRow & {
  uploader: TaskPerson | null;
  signedUrl?: string | null;
};

export type TaskActivityItem = {
  id: string;
  event_type: string;
  description: string;
  created_at: string;
  actor: TaskPerson | null;
};

export type TaskDetail = TaskListItem & {
  comments: TaskComment[];
  subtasks: TaskSubtask[];
  attachments: TaskAttachment[];
  activity: TaskActivityItem[];
};

export type TaskListResult = {
  items: TaskListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type TaskStats = {
  myTasks: number;
  overdue: number;
  today: number;
  completed: number;
  highPriority: number;
};

export type TaskActionResult =
  | { success: true; id?: string; url?: string }
  | { success: false; error: string };

export type TaskSort =
  | "newest"
  | "oldest"
  | "due_asc"
  | "due_desc"
  | "priority";

export const TASK_PAGE_SIZE = 20;

export const OPEN_TASK_STATUSES: TaskStatus[] = [
  "new",
  "in_progress",
  "waiting",
  "blocked",
  "review",
];

/** Columns shown on the Kanban board (archive & blocked are hidden). */
export const KANBAN_STATUSES = [
  "new",
  "in_progress",
  "waiting",
  "review",
  "completed",
] as const satisfies readonly TaskStatus[];

export type KanbanStatus = (typeof KANBAN_STATUSES)[number];

export type TaskKanbanItem = TaskListItem & {
  commentsCount: number;
  attachmentsCount: number;
  subtasksTotal: number;
  subtasksDone: number;
};

export type TaskViewMode = "table" | "kanban";

export const KANBAN_PAGE_LIMIT = 300;
