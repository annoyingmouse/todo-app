import React, { type ChangeEvent, type FormEvent, useState } from "react";
import parse from "html-react-parser";
import type { TaskProps } from "../types/TaskProps.ts";
import Button from "./Button.tsx";

const TaskItem: React.FC<TaskProps> = ({
  task,
  onToggle,
  onDelete,
  isEditing,
  onStartEdit,
  onStopEdit,
  onUpdateTitle,
}) => {
  const [tempTitle, setTempTitle] = useState(task.title);
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onUpdateTitle(task.id, tempTitle.trim());
  };
  return (
    <div
      className={`flex justify-between items-center p-4 border rounded ${
        task.completed ? "bg-green-100" : "bg-white"
      }`}
    >
      {isEditing ? (
        <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
          <input
            value={tempTitle}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setTempTitle(e.target.value)
            }
            className="flex-1 px-2 py-1 border rounded"
            autoFocus
          />
          <Button variant="primary" type="submit">
            save
          </Button>
          <Button variant="secondary" onClick={onStopEdit}>
            Cancel
          </Button>
        </form>
      ) : (
        <>
          <button
            onClick={() => onToggle(task.id)}
            className={`cursor-pointer flex-1 text-lg text-left ${
              task.completed ? "line-through text-gray-500" : ""
            }`}
          >
            {parse(task.title)}
          </button>
          <button
            onClick={() => onStartEdit(task.id)}
            className="text-sm text-blue-500 ml-2"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-sm text-red-500 ml-2"
          >
            Delete
          </button>
        </>
      )}
    </div>
  );
};

export default TaskItem;
