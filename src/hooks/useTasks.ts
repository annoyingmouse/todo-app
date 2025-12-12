import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { Task } from "../types/Task.ts";

const fetchTasks = async (): Promise<Task[]> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/tasks`);
  return response.data;
};
export const useTasks = () => {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });
};
