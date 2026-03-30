import type { Task } from "../types/Task";
import type { KanbanStatus } from "../types/Task";
import KanbanCard from "./KanbanCard";

const COLUMN_CONFIG: Record<
  KanbanStatus,
  { label: string; headerClass: string; bgClass: string }
> = {
  backlog: {
    label: "Backlog",
    headerClass: "bg-gray-200 text-gray-700",
    bgClass: "bg-gray-50",
  },
  "in-progress": {
    label: "In Progress",
    headerClass: "bg-blue-200 text-blue-700",
    bgClass: "bg-blue-50",
  },
  done: {
    label: "Done",
    headerClass: "bg-green-200 text-green-700",
    bgClass: "bg-green-50",
  },
};

type Props = {
  status: KanbanStatus;
  tasks: Task[];
  draggingId: number | null;
  isDragOver: boolean;
  onDragStart: (id: number) => void;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: () => void;
};

const KanbanColumn: React.FC<Props> = ({
  status,
  tasks,
  draggingId,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
}) => {
  const { label, headerClass, bgClass } = COLUMN_CONFIG[status];

  return (
    <div
      data-testid={`kanban-column-${status}`}
      className={`flex flex-col rounded-lg border overflow-hidden transition-all ${isDragOver ? "ring-2 ring-blue-400 ring-offset-1" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
    >
      <div
        className={`px-3 py-2 font-semibold flex items-center justify-between ${headerClass}`}
      >
        <span>{label}</span>
        <span className="text-sm font-normal opacity-60">{tasks.length}</span>
      </div>
      <div className={`flex-1 p-2 min-h-32 ${bgClass}`}>
        {tasks.length === 0 ? (
          <p className="text-center text-sm text-gray-400 mt-6 select-none">
            No tasks
          </p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                draggingId={draggingId}
                onDragStart={onDragStart}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
