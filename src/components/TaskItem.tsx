import { useEffect, useState } from "react";
import parse from "html-react-parser";
import Markdown from "react-markdown";
import type { TaskProps } from "../types/TaskProps";
import { useTasks } from "../hooks/useTasks";
import { useFilterStore } from "../store/FilterStore";
import EditTaskModal from "./EditTaskModal";
import type { Task } from "../types/Task";
import { sortTasks } from "../utils/sortTasks";
import { statusFromPct } from "../utils/kanbanUtils";

const DEPTH_ACCENT = [
  "",
  "border-l-4 border-l-blue-400",
  "border-l-4 border-l-amber-400",
  "border-l-4 border-l-purple-400",
];

const TaskItem: React.FC<TaskProps> = ({ task, depth = 0 }) => {
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

  const accentClass =
    depth > 0 ? DEPTH_ACCENT[Math.min(depth, DEPTH_ACCENT.length - 1)] : "";

  return (
    <>
      <li className={depth === 0 ? "border rounded overflow-hidden" : ""}>
        {/* Card content row */}
        <div
          className={`flex flex-col gap-2 p-2 sm:flex-row sm:items-center sm:gap-2 ${accentClass}`}
        >
          {/* Title row */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {children.length > 0 && (
              <button
                onClick={() => setCollapsed((c) => !c)}
                className={`text-xs w-5 text-gray-500 shrink-0 font-mono transition-transform duration-300 ${collapsed ? "" : "rotate-90"}`}
                aria-label={collapsed ? "Expand subtasks" : "Collapse subtasks"}
                aria-expanded={!collapsed}
                aria-controls={`subtasks-${task.id}`}
              >
                ▶
              </button>
            )}
            <span className="flex-1 flex flex-col min-w-0">
              <span className="flex items-baseline gap-2 flex-wrap">
                <span
                  className={
                    displayPct === 100 ? "line-through text-gray-500" : ""
                  }
                >
                  {parse(task.title)}
                </span>
                {task.dateCompleted && (
                  <span className="text-xs text-gray-500 shrink-0">
                    {new Date(task.dateCompleted).toLocaleDateString("en-GB")}
                  </span>
                )}
              </span>
              {task.description && (
                <span className="text-sm text-gray-500 break-words min-w-0 [&_a]:break-all">
                  <Markdown>{task.description}</Markdown>
                </span>
              )}
            </span>
          </div>
          {/* Controls row */}
          <div className="flex items-center justify-between gap-2 shrink-0 sm:justify-normal">
            <div className="flex items-center gap-2 shrink-0">
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
                  className="w-24 shrink-0"
                  aria-label={`Completion percentage for ${task.title}`}
                />
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
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
            </div>
          </div>
        </div>

        {/* Add-subtask inline form */}
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

        {/* Children nested inside parent card */}
        {children.length > 0 && !collapsed && (
          <ul
            id={`subtasks-${task.id}`}
            className="border-t divide-y bg-gray-50"
          >
            {children.map((child) => (
              <TaskItem task={child} key={child.id} depth={depth + 1} />
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

export default TaskItem;
