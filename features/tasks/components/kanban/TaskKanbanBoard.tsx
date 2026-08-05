"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { moveKanbanTask } from "@/features/tasks/actions/tasks";
import TaskKanbanCard, {
  type KanbanCardLabels,
} from "@/features/tasks/components/kanban/TaskKanbanCard";
import {
  KANBAN_STATUSES,
  type KanbanStatus,
  type TaskKanbanItem,
  type TaskPriority,
  type TaskStatus,
} from "@/features/tasks/types";

type Option = { id: string; label: string };

type ColumnMap = Record<KanbanStatus, TaskKanbanItem[]>;

type Props = {
  items: TaskKanbanItem[];
  locale: string;
  canUpdate: boolean;
  canCreate: boolean;
  assignees: Option[];
  labels: {
    emptyTitle: string;
    emptyCreate: string;
    card: KanbanCardLabels;
  };
  statusLabels: Record<TaskStatus, string>;
  priorityLabels: Record<TaskPriority, string>;
};

function buildColumns(items: TaskKanbanItem[]): ColumnMap {
  const columns = Object.fromEntries(
    KANBAN_STATUSES.map((status) => [status, [] as TaskKanbanItem[]]),
  ) as ColumnMap;

  for (const item of items) {
    if ((KANBAN_STATUSES as readonly string[]).includes(item.status)) {
      columns[item.status as KanbanStatus].push(item);
    }
  }

  for (const status of KANBAN_STATUSES) {
    columns[status].sort((a, b) => {
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return b.created_at.localeCompare(a.created_at);
    });
  }

  return columns;
}

function findContainer(
  columns: ColumnMap,
  id: UniqueIdentifier,
): KanbanStatus | null {
  const asStatus = String(id);
  if ((KANBAN_STATUSES as readonly string[]).includes(asStatus)) {
    return asStatus as KanbanStatus;
  }
  for (const status of KANBAN_STATUSES) {
    if (columns[status].some((item) => item.id === id)) return status;
  }
  return null;
}

export default function TaskKanbanBoard({
  items,
  locale,
  canUpdate,
  canCreate,
  assignees,
  labels,
  statusLabels,
  priorityLabels,
}: Props) {
  const router = useRouter();
  const [columns, setColumns] = useState(() => buildColumns(items));
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const activeTask = useMemo(() => {
    if (!activeId) return null;
    for (const status of KANBAN_STATUSES) {
      const found = columns[status].find((item) => item.id === activeId);
      if (found) return found;
    }
    return null;
  }, [activeId, columns]);

  const onDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
    setError(null);
  }, []);

  const onDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    setColumns((prev) => {
      const activeContainer = findContainer(prev, active.id);
      const overContainer = findContainer(prev, over.id);
      if (
        !activeContainer ||
        !overContainer ||
        activeContainer === overContainer
      ) {
        return prev;
      }

      const activeItems = [...prev[activeContainer]];
      const overItems = [...prev[overContainer]];
      const activeIndex = activeItems.findIndex((item) => item.id === active.id);
      if (activeIndex < 0) return prev;

      const [moved] = activeItems.splice(activeIndex, 1);
      const overIndex = overItems.findIndex((item) => item.id === over.id);
      const insertAt = overIndex >= 0 ? overIndex : overItems.length;
      overItems.splice(insertAt, 0, { ...moved, status: overContainer });

      return {
        ...prev,
        [activeContainer]: activeItems,
        [overContainer]: overItems,
      };
    });
  }, []);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      if (!over || !canUpdate) {
        setColumns(buildColumns(items));
        return;
      }

      const initial = buildColumns(items);
      const fromStatus =
        (active.data.current?.status as KanbanStatus | undefined) ??
        findContainer(initial, active.id);

      setColumns((prev) => {
        const toStatus = findContainer(prev, over.id);
        if (!fromStatus || !toStatus) {
          return buildColumns(items);
        }

        const next: ColumnMap = { ...prev };
        const list = [...next[toStatus]];
        const oldIndex = list.findIndex((item) => item.id === active.id);
        if (oldIndex < 0) return buildColumns(items);

        let newIndex = list.findIndex((item) => item.id === over.id);
        if (over.id === toStatus) newIndex = list.length - 1;

        if (fromStatus === toStatus && newIndex >= 0 && oldIndex !== newIndex) {
          const [moved] = list.splice(oldIndex, 1);
          list.splice(newIndex, 0, moved);
        }

        next[toStatus] = list.map((item, index) => ({
          ...item,
          sort_order: index,
          status: toStatus,
        }));

        if (fromStatus !== toStatus) {
          next[fromStatus] = next[fromStatus].map((item, index) => ({
            ...item,
            sort_order: index,
          }));
        }

        const orderedIds = next[toStatus].map((item) => item.id);
        const previousOrderedIds =
          fromStatus !== toStatus
            ? next[fromStatus].map((item) => item.id)
            : undefined;

        startTransition(async () => {
          const result = await moveKanbanTask({
            taskId: String(active.id),
            status: toStatus,
            orderedIds,
            previousStatus: fromStatus !== toStatus ? fromStatus : undefined,
            previousOrderedIds,
          });
          if (!result.success) {
            setError(result.error ?? labels.card.errorFallback);
            setColumns(buildColumns(items));
            return;
          }
          router.refresh();
        });

        return next;
      });
    },
    [canUpdate, items, labels.card.errorFallback, router],
  );

  const onDragCancel = useCallback(() => {
    setActiveId(null);
    setColumns(buildColumns(items));
  }, [items]);

  return (
    <div className="space-y-3">
      {error ? (
        <p className="text-xs text-red-300">{error}</p>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <div className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:thin]">
          {KANBAN_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              title={statusLabels[status]}
              tasks={columns[status]}
              locale={locale}
              canUpdate={canUpdate}
              canCreate={canCreate}
              assignees={assignees}
              labels={labels}
              statusLabels={statusLabels}
              priorityLabels={priorityLabels}
              disabled={isPending}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 180, easing: "ease-out" }}>
          {activeTask ? (
            <div className="w-[280px] rotate-1 scale-[1.02] opacity-95">
              <TaskKanbanCard
                task={activeTask}
                locale={locale}
                canUpdate={false}
                assignees={assignees}
                labels={labels.card}
                statusLabels={statusLabels}
                priorityLabels={priorityLabels}
                disabled
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function KanbanColumn({
  status,
  title,
  tasks,
  locale,
  canUpdate,
  canCreate,
  assignees,
  labels,
  statusLabels,
  priorityLabels,
  disabled,
}: {
  status: KanbanStatus;
  title: string;
  tasks: TaskKanbanItem[];
  locale: string;
  canUpdate: boolean;
  canCreate: boolean;
  assignees: Option[];
  labels: Props["labels"];
  statusLabels: Record<TaskStatus, string>;
  priorityLabels: Record<TaskPriority, string>;
  disabled?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: "column", status },
  });

  return (
    <section
      ref={setNodeRef}
      className={`flex w-[300px] shrink-0 flex-col rounded-[var(--nht-radius-xl)] border bg-white/[0.02] backdrop-blur transition ${
        isOver
          ? "border-[var(--nht-accent)]/50 bg-[var(--nht-accent)]/[0.04]"
          : "border-white/[0.06]"
      }`}
    >
      <header className="flex items-center justify-between gap-2 border-b border-white/[0.05] px-3 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-white">{title}</h2>
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-[var(--nht-text-tertiary)]">
            {tasks.length}
          </span>
        </div>
      </header>

      <div className="flex max-h-[min(70vh,820px)] flex-1 flex-col gap-2 overflow-y-auto p-2 [scrollbar-width:thin]">
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence initial={false}>
            {tasks.map((task) => (
              <TaskKanbanCard
                key={task.id}
                task={task}
                locale={locale}
                canUpdate={canUpdate}
                assignees={assignees}
                labels={labels.card}
                statusLabels={statusLabels}
                priorityLabels={priorityLabels}
                disabled={disabled}
              />
            ))}
          </AnimatePresence>
        </SortableContext>

        {tasks.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-[var(--nht-radius-lg)] border border-dashed border-white/10 px-3 py-8 text-center">
            <p className="text-sm text-[var(--nht-text-tertiary)]">
              {labels.emptyTitle}
            </p>
            {canCreate ? (
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("nht:tasks-open-create"));
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white transition hover:border-[var(--nht-accent)]/40 hover:text-[var(--nht-accent)]"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
                {labels.emptyCreate}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
