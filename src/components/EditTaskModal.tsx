import { useEffect, useRef, useState } from "react";
import type { Task } from "../types/Task";
import type { KanbanStatus } from "../types/Task";
import Button from "./Button";
import { statusFromSlider, pctFromStatus } from "../utils/kanbanUtils";

type Props = {
  task: Task;
  onSave: (updated: Task) => void;
  onClose: () => void;
};

const STATUS_LABELS: Record<KanbanStatus, string> = {
  backlog: "Backlog",
  "in-progress": "In Progress",
  done: "Done",
};

const STATUS_STYLES: Record<KanbanStatus, string> = {
  backlog: "bg-gray-200 text-gray-700 border-gray-400",
  "in-progress": "bg-blue-200 text-blue-700 border-blue-400",
  done: "bg-green-200 text-green-700 border-green-400",
};

const EditTaskModal: React.FC<Props> = ({ task, onSave, onClose }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [completed, setCompleted] = useState(task.completed);
  const [status, setStatus] = useState<KanbanStatus>(task.status);
  const [dateCompleted, setDateCompleted] = useState(
    task.dateCompleted ? task.dateCompleted.slice(0, 10) : "",
  );
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
    inputRef.current?.focus();
  }, []);

  const handleSliderChange = (val: number) => {
    setCompleted(val);
    setStatus(statusFromSlider(val, status));
    if (val === 100 && !dateCompleted) {
      setDateCompleted(new Date().toISOString().slice(0, 10));
    } else if (val < 100) {
      setDateCompleted("");
    }
  };

  const handleStatusChange = (newStatus: KanbanStatus) => {
    setStatus(newStatus);
    const newPct = pctFromStatus(newStatus, completed);
    setCompleted(newPct);
    if (newStatus === "done" && !dateCompleted) {
      setDateCompleted(new Date().toISOString().slice(0, 10));
    } else if (newStatus !== "done") {
      setDateCompleted("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const fullDate =
      completed === 100 && dateCompleted
        ? new Date(dateCompleted).toISOString()
        : null;
    onSave({
      ...task,
      title: title.trim(),
      description,
      completed,
      dateCompleted: fullDate,
      status,
    });
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
        <div>
          <p className="text-sm text-gray-600 mb-1">Status</p>
          <div className="flex gap-2">
            {(["backlog", "in-progress", "done"] as KanbanStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleStatusChange(s)}
                className={`flex-1 text-sm py-1 rounded border-2 font-medium transition-all ${
                  status === s
                    ? STATUS_STYLES[s]
                    : "bg-gray-50 text-gray-400 border-transparent"
                }`}
                aria-pressed={status === s}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
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
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="flex-1"
          />
        </div>
        {completed === 100 && (
          <div className="flex items-center gap-2">
            <label
              htmlFor="edit-date-completed"
              className="text-sm text-gray-600 whitespace-nowrap"
            >
              Date completed
            </label>
            <input
              id="edit-date-completed"
              type="date"
              value={dateCompleted}
              onChange={(e) => setDateCompleted(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded text-sm"
            />
          </div>
        )}
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
