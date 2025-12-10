import api from "./api";
import type { Task } from "../types/Task.ts";

export const fetchTasks = async (): Promise<Task[]> => {
  const res = await api.get("/tasks");
  return res.data;
};
export const createTask = async (title: string): Promise<Task> => {
  const res = await api.post("/tasks", {
    title,
    completed: false,
  });
  return res.data;
};
export const deleteTask = async (id: number): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

export const updateTask = async (
  id: number,
  updates: Partial<Task>,
): Promise<Task> => {
  const res = await api.patch(`/tasks/${id}`, updates);
  return res.data;
};
