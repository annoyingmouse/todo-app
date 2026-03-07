import { useEffect, useRef, useState } from "react";
import type { Task } from "../types/Task";
import Button from "./Button";

type Props = {
  task: Task;
  onSave: (updated: Task) => void;
  onClose: () => void;
};

const EditTaskModal: React.FC<Props> = ({ task, onSave, onClose }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [completed, setCompleted] = useState(task.completed);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ ...task, title: title.trim(), description, completed });
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="edit-modal-title"
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-md backdrop:bg-black/50"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
        <h2 id="edit-modal-title" className="text-lg font-semibold mb-4">
          Edit Task
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label htmlFor="edit-task-title" className="sr-only">
            Task title
          </label>
          <input
            id="edit-task-title"
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <label htmlFor="edit-task-description" className="sr-only">
            Description
          </label>
          <textarea
            id="edit-task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded resize-none"
            placeholder="Description (optional)"
            rows={3}
          />
          <div className="flex items-center gap-2">
            <label
              htmlFor="edit-task-pct"
              className="text-sm text-gray-600 whitespace-nowrap"
            >
              {completed}% complete
            </label>
            <input
              id="edit-task-pct"
              type="range"
              min={0}
              max={100}
              step={1}
              value={completed}
              onChange={(e) => setCompleted(Number(e.target.value))}
              className="flex-1"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save
            </Button>
          </div>
        </form>
    </dialog>
  );
};

export default EditTaskModal;
