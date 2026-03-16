import { useEffect, useState } from "react";
import parse from "html-react-parser";
import Markdown from "react-markdown";
import type { TaskProps } from "../types/TaskProps";
import { useTasks } from "../hooks/useTasks";
import EditTaskModal from "./EditTaskModal";
import type { Task } from "../types/Task";

const TaskItem: React.FC<TaskProps> = ({ task }) => {
  const { tasks, updateTask, deleteTask, addTask } = useTasks();
  const children = tasks.filter((t) => t.parentId === task.id);
  const [editing, setEditing] = useState(false);
  const [pct, setPct] = useState(task.completed);
  const [addingChild, setAddingChild] = useState(false);
  const [childTitle, setChildTitle] = useState("");

  const derivedPct =
    children.length > 0
      ? Math.round(
          children.reduce((sum, c) => sum + c.completed, 0) / children.length,
        )
      : null;

  const displayPct = derivedPct ?? pct;

  useEffect(() => {
    if (derivedPct !== null && derivedPct !== task.completed) {
      updateTask({ ...task, completed: derivedPct });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [derivedPct]);

  const handleSliderCommit = () => {
    if (pct !== task.completed) {
      updateTask({ ...task, completed: pct });
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
    });
    setChildTitle("");
    setAddingChild(false);
  };

  return (
    <>
      <li className="flex items-center gap-2 border p-2 rounded">
        <span className="flex-1 flex flex-col">
          <span className="flex items-baseline gap-2">
            <span
              className={displayPct === 100 ? "line-through text-gray-400" : ""}
            >
              {parse(task.title)}
            </span>
            {task.dateCompleted && (
              <span className="text-xs text-gray-400">
                {new Date(task.dateCompleted).toLocaleDateString("en-GB")}
              </span>
            )}
          </span>
          {task.description && (
            <span className="text-sm text-gray-500">
              <Markdown>{task.description}</Markdown>
            </span>
          )}
        </span>
        <span className="text-sm text-gray-500 w-9 text-right">
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
            className="w-24"
            aria-label={`Completion percentage for ${task.title}`}
          />
        )}
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
      </li>
      {addingChild && (
        <li className="ml-6">
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
        </li>
      )}
      {children.length > 0 && (
        <ul className="ml-6 mt-1 space-y-1">
          {children.map((child) => (
            <TaskItem task={child} key={child.id} />
          ))}
        </ul>
      )}
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
