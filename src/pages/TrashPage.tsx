import parse from "html-react-parser";
import { useTrash } from "../hooks/useTrash";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import type { Task } from "../types/Task";

const DEPTH_ACCENT = [
  "",
  "border-l-4 border-l-blue-400",
  "border-l-4 border-l-amber-400",
  "border-l-4 border-l-purple-400",
];

type TrashItemProps = {
  task: Task;
  allDeleted: Task[];
  restore: (id: number) => void;
  permanentDelete: (id: number) => void;
  depth?: number;
};

function TrashItem({
  task,
  allDeleted,
  restore,
  permanentDelete,
  depth = 0,
}: TrashItemProps) {
  const children = allDeleted.filter((t) => t.parentId === task.id);
  const accentClass =
    depth > 0 ? DEPTH_ACCENT[Math.min(depth, DEPTH_ACCENT.length - 1)] : "";

  return (
    <li className={depth === 0 ? "border rounded overflow-hidden" : ""}>
      <div
        className={`flex flex-col gap-2 p-2 sm:flex-row sm:items-center sm:gap-2 ${accentClass}`}
      >
        {/* Title row */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="flex-1 flex items-baseline gap-2 flex-wrap min-w-0">
            {task.parentId !== null && (
              <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-300 shrink-0">
                subtask
              </span>
            )}
            <span className="line-through text-gray-400 break-words min-w-0">
              {parse(task.title)}
            </span>
            {task.deletedAt && (
              <span className="text-xs text-gray-400 shrink-0">
                deleted {new Date(task.deletedAt).toLocaleDateString("en-GB")}
              </span>
            )}
          </span>
        </div>
        {/* Buttons row */}
        <div className="flex items-center justify-between gap-2 shrink-0 sm:justify-normal">
          <button
            onClick={() => restore(task.id)}
            className="text-sm px-2 py-1 bg-green-200 rounded"
            aria-label={`Restore ${task.title}`}
          >
            Restore
          </button>
          <button
            onClick={() => permanentDelete(task.id)}
            className="text-sm px-2 py-1 bg-red-300 rounded"
            aria-label={`Delete ${task.title} permanently`}
          >
            Delete permanently
          </button>
        </div>
      </div>

      {/* Children nested inside parent card */}
      {children.length > 0 && (
        <ul className="border-t divide-y bg-gray-50">
          {children.map((child) => (
            <TrashItem
              key={child.id}
              task={child}
              allDeleted={allDeleted}
              restore={restore}
              permanentDelete={permanentDelete}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

const TrashPage = () => {
  const { deletedTasks, isLoading, isError, restore, permanentDelete } =
    useTrash();

  if (isLoading) return <p role="status">Loading...</p>;
  if (isError) return <ErrorBanner errorMessage="Failed to load trash." />;

  const deletedIds = new Set(deletedTasks.map((t) => t.id));
  const topLevel = deletedTasks.filter(
    (t) => t.parentId === null || !deletedIds.has(t.parentId),
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Trash</h1>
      {deletedTasks.length === 0 ? (
        <EmptyState message="Trash is empty." />
      ) : (
        <ul className="space-y-2">
          {topLevel.map((task: Task) => (
            <TrashItem
              key={task.id}
              task={task}
              allDeleted={deletedTasks}
              restore={restore}
              permanentDelete={permanentDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default TrashPage;
