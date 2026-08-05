import { z } from "zod";
import {
  KANBAN_STATUSES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_TYPES,
} from "@/features/tasks/types";

const optionalUuid = z
  .string()
  .uuid()
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : undefined));

const optionalDate = z
  .string()
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : undefined));

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  type: z.enum(TASK_TYPES),
  priority: z.enum(TASK_PRIORITIES),
  status: z.enum(TASK_STATUSES).default("new"),
  creator_id: optionalUuid,
  application_id: optionalUuid,
  assigned_to: optionalUuid,
  due_date: optionalDate,
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.string().uuid(),
});

export const taskIdSchema = z.object({
  id: z.string().uuid(),
});

export const assignTaskSchema = z.object({
  id: z.string().uuid(),
  assigned_to: z.string().uuid().nullable(),
});

export const taskStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(TASK_STATUSES),
});

export const taskDueDateSchema = z.object({
  id: z.string().uuid(),
  due_date: z.string().nullable(),
});

export const taskCommentSchema = z.object({
  task_id: z.string().uuid(),
  body: z.string().trim().min(1).max(4000),
});

export const updateTaskCommentSchema = z.object({
  id: z.string().uuid(),
  body: z.string().trim().min(1).max(4000),
});

export const taskCommentIdSchema = z.object({
  id: z.string().uuid(),
});

export const createSubtaskSchema = z.object({
  task_id: z.string().uuid(),
  title: z.string().trim().min(1).max(300),
});

export const updateSubtaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(300).optional(),
  is_done: z.boolean().optional(),
});

export const subtaskIdSchema = z.object({
  id: z.string().uuid(),
});

export const attachmentIdSchema = z.object({
  id: z.string().uuid(),
});

export const taskListFiltersSchema = z.object({
  q: z.string().optional().default(""),
  status: z
    .enum(TASK_STATUSES)
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  priority: z
    .enum(TASK_PRIORITIES)
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  type: z
    .enum(TASK_TYPES)
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  assignee: z.string().optional().default(""),
  creator: z.string().optional().default(""),
  sort: z
    .enum(["newest", "oldest", "due_asc", "due_desc", "priority"])
    .optional()
    .default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  scope: z
    .enum(["", "mine", "overdue", "today", "completed", "high"])
    .optional()
    .default(""),
});

export const moveKanbanTaskSchema = z.object({
  taskId: z.string().uuid(),
  status: z.enum(KANBAN_STATUSES),
  orderedIds: z.array(z.string().uuid()).max(500),
  previousStatus: z.enum(TASK_STATUSES).optional(),
  previousOrderedIds: z.array(z.string().uuid()).max(500).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskListFilters = z.infer<typeof taskListFiltersSchema>;
export type MoveKanbanTaskInput = z.infer<typeof moveKanbanTaskSchema>;
