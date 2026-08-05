export type {
  TaskActionResult,
  TaskComment,
  TaskDetail,
  TaskKanbanItem,
  TaskListItem,
  TaskListResult,
  TaskPriority,
  TaskSort,
  TaskStats,
  TaskStatus,
  TaskType,
  TaskViewMode,
} from "@/features/tasks/types";
export {
  KANBAN_STATUSES,
  TASK_PAGE_SIZE,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_TYPES,
} from "@/features/tasks/types";

export { listTasks, listCreatorCrmTasks } from "@/features/tasks/queries/list-tasks";
export { listKanbanTasks } from "@/features/tasks/queries/list-kanban-tasks";
export { getTask } from "@/features/tasks/queries/get-task";
export {
  getTaskStats,
  getDashboardTaskStats,
} from "@/features/tasks/queries/get-task-stats";
export {
  createTask,
  updateTask,
  assignTask,
  changeTaskStatus,
  changeTaskDueDate,
  completeTask,
  moveTaskToReview,
  archiveTask,
  moveKanbanTask,
  duplicateTask,
  deleteTask,
  addTaskComment,
  updateTaskComment,
  deleteTaskComment,
  addTaskSubtask,
  updateTaskSubtask,
  deleteTaskSubtask,
  uploadTaskAttachment,
  deleteTaskAttachment,
} from "@/features/tasks/actions/tasks";
export { notifyApproachingTaskDeadlines } from "@/features/tasks/actions/notify-deadlines";

export { default as TaskKpiCards } from "@/features/tasks/components/TaskKpiCards";
export { default as TaskFilters } from "@/features/tasks/components/TaskFilters";
export { default as TaskTable } from "@/features/tasks/components/TaskTable";
export { default as TaskPagination } from "@/features/tasks/components/TaskPagination";
export { default as TaskFormModal } from "@/features/tasks/components/TaskFormModal";
export { default as TaskDetailPanel } from "@/features/tasks/components/TaskDetailPanel";
export { default as TaskViewSwitcher } from "@/features/tasks/components/TaskViewSwitcher";
export { default as TaskKanbanBoard } from "@/features/tasks/components/kanban/TaskKanbanBoard";
