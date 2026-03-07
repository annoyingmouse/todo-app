import { useState } from "react";
import parse from "html-react-parser";
import Markdown from "react-markdown";
import type { TaskProps } from "../types/TaskProps";
import { useTasks } from "../hooks/useTasks";
import EditTaskModal from "./EditTaskModal";
import type { Task } from "../types/Task";

const TaskItem: React.FC<TaskProps> = ({ task }) => {
  const { updateTask, deleteTask } = useTasks();
  const [editing, setEditing] = useState(false);
  const [pct, setPct] = useState(task.completed);

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

  return (
    <>
      <li className="flex items-center gap-2 border p-2 rounded">
        <span className="flex-1 flex flex-col">
          <span
            className={
              task.completed === 100 ? "line-through text-gray-400" : ""
            }
          >
            {parse(task.title)}
          </span>
          {task.description && (
            <span className="text-sm text-gray-500">
              <Markdown>{task.description}</Markdown>
            </span>
          )}
        </span>
        <span className="text-sm text-gray-500 w-9 text-right">{pct}%</span>
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
        <button
          onClick={() => setEditing(true)}
          className="text-sm px-2 py-1 bg-blue-200 rounded"
        >
          Edit
        </button>
        <button
          onClick={() => deleteTask(task.id)}
          className="text-sm px-2 py-1 bg-red-300 rounded"
        >
          Delete
        </button>
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
