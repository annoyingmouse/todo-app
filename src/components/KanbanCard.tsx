import { useEffect, useState } from "react";
import parse from "html-react-parser";
import Markdown from "react-markdown";
import type { Task } from "../types/Task";
import type { KanbanStatus } from "../types/Task";
import { useTasks } from "../hooks/useTasks";
import { useFilterStore } from "../store/FilterStore";
import EditTaskModal from "./EditTaskModal";
import TaskItem from "./TaskItem";
import { sortTasks } from "../utils/sortTasks";
import { statusFromPct, pctFromStatus } from "../utils/kanbanUtils";

const STATUS_LABELS: Record<KanbanStatus, string> = {
  backlog: "Backlog",
  "in-progress": "In Progress",
  done: "Done",
};

const STATUS_ACTIVE_STYLES: Record<KanbanStatus, string> = {
  backlog: "bg-gray-200 text-gray-700 ring-gray-400",
  "in-progress": "bg-blue-200 text-blue-700 ring-blue-400",
  done: "bg-green-200 text-green-700 ring-green-400",
};

type Props = {
  task: Task;
  draggingId: number | null;
  onDragStart: (id: number) => void;
};

const KanbanCard: React.FC<Props> = ({ task, draggingId, onDragStart }) => {
  const { tasks, updateTask, deleteTask, addTask } = useTasks();
  const sortOrder = useFilterStore((state) => state.sortOrder);
  const children = sortTasks(
    tasks.filter((t) => t.parentId === task.id),
    sortOrder,
  );

  const [editing, setEditing] = useState(false);
  const [pct, setPct] = useState(task.completed);
  const [addingChild, setAddingChild] = useState(false);
  const [childTitle, setChildTitle] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const derivedPct =
    children.length > 0
      ? Math.round(
          children.reduce((sum, c) => sum + c.completed, 0) / children.length,
        )
      : null;

  const displayPct = derivedPct ?? pct;

  useEffect(() => {
    if (derivedPct !== null && derivedPct !== task.completed) {
      const newStatus = statusFromPct(derivedPct);
      updateTask({ ...task, completed: derivedPct, status: newStatus });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [derivedPct]);

  const handleSliderCommit = () => {
    if (pct !== task.completed) {
      const newStatus = statusFromPct(pct);
      const dateCompleted =
        pct === 100 ? (task.dateCompleted ?? new Date().toISOString()) : null;
      updateTask({ ...task, completed: pct, status: newStatus, dateCompleted });
    }
  };

  const handleStatusChange = (newStatus: KanbanStatus) => {
    const newPct = pctFromStatus(newStatus, pct);
    const dateCompleted =
      newStatus === "done"
        ? (task.dateCompleted ?? new Date().toISOString())
        : null;
    setPct(newPct);
    updateTask({ ...task, status: newStatus, completed: newPct, dateCompleted });
  };

  const handleSave = (updated: Task) => {
    setPct(updated.completed);
    updateTask(updated);
    setEditing(false);
  };

  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childTitle.trim()) return;
    addTask({
      title: childTitle,
      description: "",
      completed: 0,
      dateCompleted: null,
      parentId: task.id,
      deletedAt: null,
      status: "backlog",
    });
    setChildTitle("");
    setAddingChild(false);
  };

  const isDragging = draggingId === task.id;

  return (
    <>
      <li
        className={`bg-white border rounded-md shadow-sm overflow-hidden transition-opacity ${isDragging ? "opacity-40" : ""}`}
      >
        <div className="p-3 flex flex-col gap-2">
          {/* Title */}
          <div className="flex items-start gap-2">
            <span
              draggable
              onDragStart={(e) => { e.stopPropagation(); onDragStart(task.id); }}
              className="text-gray-300 cursor-grab active:cursor-grabbing select-none shrink-0 mt-0.5 text-sm"
              aria-label="Drag to move card"
              title="Drag to move"
            >
              ⠿
            </span>
            {children.length > 0 && (
              <button
                onClick={() => setCollapsed((c) => !c)}
                className={`text-xs w-5 text-gray-500 shrink-0 font-mono mt-0.5 transition-transform duration-300 ${collapsed ? "" : "rotate-90"}`}
                aria-label={collapsed ? "Expand subtasks" : "Collapse subtasks"}
                aria-expanded={!collapsed}
                aria-controls={`subtasks-${task.id}`}
              >
                ▶
              </button>
            )}
            <span className="flex-1 min-w-0">
              <span
                className={
                  displayPct === 100
                    ? "line-through text-gray-500"
                    : "font-medium"
                }
              >
                {parse(task.title)}
              </span>
              {task.dateCompleted && (
                <span className="ml-2 text-xs text-gray-400">
                  {new Date(task.dateCompleted).toLocaleDateString("en-GB")}
                </span>
              )}
              {task.description && (
                <div className="text-sm text-gray-500 mt-1 break-words [&_a]:break-all">
                  <Markdown>{task.description}</Markdown>
                </div>
              )}
            </span>
          </div>

          {/* Completion */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 w-9 text-right shrink-0">
              {displayPct}%
            </span>
            {derivedPct === null && (
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={pct}
                onChange={(e) => setPct(Number(e.target.value))}
                onMouseUp={handleSliderCommit}
                onTouchEnd={handleSliderCommit}
                className="flex-1"
                aria-label={`Completion percentage for ${task.title}`}
              />
            )}
          </div>

          {/* Status pills */}
          <div className="flex gap-1 flex-wrap">
            {(["backlog", "in-progress", "done"] as KanbanStatus[]).map(
              (s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleStatusChange(s)}
                  className={`text-xs px-2 py-0.5 rounded-full font-medium transition-all ${
                    task.status === s
                      ? `${STATUS_ACTIVE_STYLES[s]} ring-2 ring-offset-1`
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  }`}
                  aria-label={`Set status to ${STATUS_LABELS[s]}`}
                  aria-pressed={task.status === s}
                >
                  {STATUS_LABELS[s]}
                </button>
              ),
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing(true)}
              className="text-sm px-2 py-1 bg-blue-200 rounded"
              aria-label={`Edit ${task.title}`}
            >
              Edit
            </button>
            <button
              onClick={() => setAddingChild(true)}
              className="text-sm px-2 py-1 bg-green-200 rounded"
              aria-label={`Add subtask to ${task.title}`}
            >
              +
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-sm px-2 py-1 bg-red-300 rounded"
              aria-label={`Delete ${task.title}`}
            >
              Delete
            </button>
            {children.length > 0 && (
              <span className="ml-auto text-xs text-gray-400">
                {children.filter((c) => c.completed === 100).length}/
                {children.length} done
              </span>
            )}
          </div>
        </div>

        {/* Add subtask form */}
        {addingChild && (
          <div className="border-t bg-gray-50 p-2">
            <form onSubmit={handleAddChild} className="flex gap-2">
              <label htmlFor={`subtask-title-${task.id}`} className="sr-only">
                Subtask title
              </label>
              <input
                id={`subtask-title-${task.id}`}
                type="text"
                value={childTitle}
                onChange={(e) => setChildTitle(e.target.value)}
                className="flex-1 p-1 border border-gray-300 rounded text-sm"
                placeholder="Subtask title"
                autoFocus
                autoComplete="off"
              />
              <button
                type="submit"
                className="text-sm px-2 py-1 bg-blue-600 text-white rounded"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setAddingChild(false)}
                className="text-sm px-2 py-1 bg-gray-200 rounded"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Subtasks */}
        {children.length > 0 && !collapsed && (
          <ul
            id={`subtasks-${task.id}`}
            className="border-t divide-y bg-gray-50"
          >
            {children.map((child) => (
              <TaskItem task={child} key={child.id} depth={1} />
            ))}
          </ul>
        )}
      </li>

      {editing && (
        <EditTaskModal
          task={{ ...task, completed: pct }}
          onSave={handleSave}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
};

export default KanbanCard;
