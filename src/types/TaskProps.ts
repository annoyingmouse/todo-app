import type { Task } from "./Task.ts";

export type TaskProps = {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  editingTaskId: number | null;
  onStartEdit: (id: number) => void;
  onStopEdit: () => void;
  onUpdateTitle: (id: number, newTitle: string) => void;
  isEditing?: boolean;
};
