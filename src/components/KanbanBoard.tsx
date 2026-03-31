import { useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { useFilterStore } from "../store/FilterStore";
import type { Task } from "../types/Task";
import type { KanbanStatus } from "../types/Task";
import KanbanColumn from "./KanbanColumn";
import SearchBox from "./SearchBox";
import SortDropdown from "./SortDropdown";
import ErrorBanner from "./ErrorBanner";
import EmptyState from "./EmptyState";
import { sortTasks } from "../utils/sortTasks";
import { pctFromStatus } from "../utils/kanbanUtils";

const STATUSES: KanbanStatus[] = ["backlog", "in-progress", "done"];

export default function KanbanBoard() {
  const { tasks, isLoading, isError, updateTask } = useTasks();
  const searchQuery = useFilterStore((state) => state.searchQuery);
  const sortOrder = useFilterStore((state) => state.sortOrder);

  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<KanbanStatus | null>(
    null,
  );
  const [hideDone, setHideDone] = useState(
    () => localStorage.getItem("kanban-hide-done") === "true",
  );

  const rootTasks = (tasks ?? []).filter((t: Task) => t.parentId === null);
  const searchedTasks = rootTasks.filter((t: Task) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const tasksByStatus = (status: KanbanStatus) =>
    sortTasks(
      searchedTasks.filter((t: Task) => t.status === status),
      sortOrder,
    );

  const handleDrop = (targetStatus: KanbanStatus) => {
    if (draggingId === null) return;
    const task = tasks.find((t) => t.id === draggingId);
    if (!task || task.status === targetStatus) {
      setDraggingId(null);
      setDragOverStatus(null);
      return;
    }
    const newPct = pctFromStatus(targetStatus, task.completed);
    const dateCompleted =
      targetStatus === "done"
        ? (task.dateCompleted ?? new Date().toISOString())
        : null;
    updateTask({
      ...task,
      status: targetStatus,
      completed: newPct,
      dateCompleted,
    });
    setDraggingId(null);
    setDragOverStatus(null);
  };

  if (isLoading) return <p role="status">Loading tasks...</p>;
  if (isError) return <ErrorBanner errorMessage="Failed to fetch tasks." />;
  if (!tasks || tasks.length === 0)
    return (
      <EmptyState message="No tasks available. Add a task to get started." />
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBox />
        </div>
        <div className="flex items-stretch gap-2 shrink-0">
          <SortDropdown />
          <button
            onClick={() =>
              setHideDone((h) => {
                localStorage.setItem("kanban-hide-done", String(!h));
                return !h;
              })
            }
            className={`text-sm px-3 rounded border transition-colors ${
              hideDone
                ? "bg-gray-800 text-white border-gray-800"
                : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
            }`}
            aria-pressed={hideDone}
          >
            {hideDone ? "Show done" : "Hide done"}
          </button>
        </div>
      </div>
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {searchedTasks.length} task
        {searchedTasks.length !== 1 ? "s" : ""} shown
      </div>
      <div className={`grid grid-cols-1 gap-4 ${hideDone ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
        {STATUSES.filter((s) => !(hideDone && s === "done")).map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus(status)}
            draggingId={draggingId}
            isDragOver={dragOverStatus === status}
            onDragStart={setDraggingId}
            onDragOver={() => setDragOverStatus(status)}
            onDragLeave={() => setDragOverStatus(null)}
            onDrop={() => handleDrop(status)}
          />
        ))}
      </div>
    </div>
  );
}
