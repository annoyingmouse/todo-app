export type TaskRow = {
  id: number;
  title: string;
  completed: number;
};

export interface DbApi {
  fetchTasks(): Promise<TaskRow[]>;
  addTask(title: string): Promise<TaskRow[]>;
  updateTask(id: number, title: string, completed: boolean): Promise<TaskRow[]>;
  deleteTask(id: number): Promise<TaskRow[]>;
}
