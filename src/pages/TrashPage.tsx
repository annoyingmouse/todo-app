import parse from "html-react-parser";
import { useTrash } from "../hooks/useTrash";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import type { Task } from "../types/Task";

type TrashItemProps = {
  task: Task;
  allDeleted: Task[];
  restore: (id: number) => void;
  permanentDelete: (id: number) => void;
  isChild?: boolean;
};

function TrashItem({
  task,
  allDeleted,
  restore,
  permanentDelete,
  isChild = false,
}: TrashItemProps) {
  const children = allDeleted.filter((t) => t.parentId === task.id);

  return (
    <li>
      <div className="flex items-center gap-2 border p-2 rounded">
        <span className="flex-1 flex items-baseline gap-2">
          {isChild && (
            <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-300 shrink-0">
              subtask
            </span>
          )}
          <span className="line-through text-gray-400">
            {parse(task.title)}
          </span>
          {task.deletedAt && (
            <span className="text-xs text-gray-400">
              deleted {new Date(task.deletedAt).toLocaleDateString("en-GB")}
            </span>
          )}
        </span>
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
      {children.length > 0 && (
        <ul className="ml-6 mt-1 space-y-1">
          {children.map((child) => (
            <TrashItem
              key={child.id}
              task={child}
              allDeleted={allDeleted}
              restore={restore}
              permanentDelete={permanentDelete}
              isChild
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
              isChild={task.parentId !== null}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default TrashPage;
