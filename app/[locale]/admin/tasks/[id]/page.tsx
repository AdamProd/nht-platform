import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireStaff, isOwner } from "@/lib/auth";
import { hasPermission } from "@/features/core/permissions";
import { redirect } from "@/i18n/navigation";
import { listTaskAssignees } from "@/features/tasks/queries/list-assignees";
import {
  getTask,
  TaskDetailPanel,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_TYPES,
} from "@/features/tasks";
import { Constants } from "@/types/database.types";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function AdminTaskDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const session = await requireStaff();
  const t = await getTranslations("admin.tasks");
  const tDepartments = await getTranslations("admin.staff.departments");

  if (!hasPermission(session.profile.role, "tasks.read")) {
    redirect({ href: "/admin", locale });
  }

  let task;
  try {
    task = await getTask(id);
  } catch (error) {
    console.error(error);
    return (
      <div className="rounded-[var(--nht-radius-xl)] border border-white/[0.08] bg-white/[0.03] px-5 py-4 text-sm text-[var(--nht-text-secondary)]">
        {t("errors.loadDetail")}
      </div>
    );
  }

  if (!task) notFound();

  const assignees = await listTaskAssignees().catch(() => []);

  const statusLabels = Object.fromEntries(
    TASK_STATUSES.map((value) => [value, t(`status.${value}`)]),
  ) as Record<(typeof TASK_STATUSES)[number], string>;
  const priorityLabels = Object.fromEntries(
    TASK_PRIORITIES.map((value) => [value, t(`priority.${value}`)]),
  ) as Record<(typeof TASK_PRIORITIES)[number], string>;
  const typeLabels = Object.fromEntries(
    TASK_TYPES.map((value) => [value, t(`type.${value}`)]),
  ) as Record<(typeof TASK_TYPES)[number], string>;

  const departmentLabels = Object.fromEntries(
    Constants.public.Enums.staff_department.map((value) => [
      value,
      tDepartments(value),
    ]),
  ) as Record<string, string>;

  const timelineLabels = {
    "task.created": t("timeline.created"),
    "task.updated": t("timeline.updated"),
    "task.assigned": t("timeline.assigned"),
    "task.completed": t("timeline.completed"),
    "task.deleted": t("timeline.deleted"),
    "task.status_changed": t("timeline.statusChanged"),
    "task.comment.created": t("timeline.commentAdded"),
    "task.comment.updated": t("timeline.commentUpdated"),
    "task.comment.deleted": t("timeline.commentDeleted"),
    "task.attachment.uploaded": t("timeline.fileAttached"),
    "task.attachment.deleted": t("timeline.fileRemoved"),
    "task.duplicated": t("timeline.duplicated"),
  };

  return (
    <TaskDetailPanel
      task={task}
      locale={locale}
      currentUserId={session.profile.id}
      isOwnerActor={isOwner(session.profile.role)}
      assignees={assignees.map((item) => ({
        id: item.id,
        label: item.full_name || item.id,
      }))}
      canUpdate={hasPermission(session.profile.role, "tasks.update")}
      canDelete={isOwner(session.profile.role)}
      canCreate={hasPermission(session.profile.role, "tasks.create")}
      labels={{
        back: t("detail.back"),
        description: t("fields.description"),
        history: t("detail.history"),
        comments: t("detail.comments"),
        activity: t("detail.activity"),
        attachments: t("detail.attachments"),
        subtasks: t("detail.subtasks"),
        creator: t("fields.creator"),
        assignee: t("fields.assignTo"),
        department: t("fields.department"),
        due: t("fields.dueDate"),
        type: t("fields.type"),
        priority: t("fields.priority"),
        status: t("fields.status"),
        createdAt: t("fields.createdAt"),
        updatedAt: t("fields.updatedAt"),
        unassigned: t("filters.unassigned"),
        none: t("fields.none"),
        assign: t("actions.assign"),
        complete: t("actions.complete"),
        review: t("actions.review"),
        archive: t("actions.archive"),
        delete: t("actions.delete"),
        save: t("actions.save"),
        saving: t("actions.saving"),
        edit: t("actions.edit"),
        duplicate: t("actions.duplicate"),
        quickActions: t("detail.quickActions"),
        changeStatus: t("detail.changeStatus"),
        changeAssignee: t("detail.changeAssignee"),
        changeDue: t("detail.changeDue"),
        addComment: t("detail.addComment"),
        commentPlaceholder: t("detail.commentPlaceholder"),
        emptyComments: t("detail.emptyComments"),
        emptyActivity: t("detail.emptyActivity"),
        emptyAttachments: t("detail.emptyAttachments"),
        emptyAttachmentsDesc: t("detail.emptyAttachmentsDesc"),
        emptySubtasks: t("detail.emptySubtasks"),
        addSubtask: t("detail.addSubtask"),
        subtaskPlaceholder: t("detail.subtaskPlaceholder"),
        upload: t("detail.upload"),
        download: t("detail.download"),
        remove: t("detail.remove"),
        editComment: t("detail.editComment"),
        deleteComment: t("detail.deleteComment"),
        sendHint: t("detail.sendHint"),
        deadline: {
          none: t("deadline.none"),
          overdue: t("deadline.overdue"),
          today: t("deadline.today"),
          tomorrow: t("deadline.tomorrow"),
        },
        timeline: timelineLabels,
        errorFallback: t("detail.error"),
        confirmDeleteTitle: t("confirm.deleteTitle"),
        confirmDeleteDesc: t("confirm.deleteDescription"),
        confirm: t("confirm.confirm"),
        cancel: t("form.cancel"),
      }}
      statusLabels={statusLabels}
      priorityLabels={priorityLabels}
      typeLabels={typeLabels}
      departmentLabels={departmentLabels}
    />
  );
}
