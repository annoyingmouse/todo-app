export type KanbanStatus = "backlog" | "in-progress" | "done";

export type Task = {
  id: number;
  title: string;
  description: string;
  completed: number;
  dateCompleted: string | null;
  parentId: number | null;
  deletedAt: string | null;
  status: KanbanStatus;
  collapsed: boolean;
};
