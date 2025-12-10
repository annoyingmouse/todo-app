import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { Task } from "../types/Task.ts";

export const useAddTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newTask: Omit<Task, "id">) =>
      axios.post("http://localhost:3001/tasks", newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};
