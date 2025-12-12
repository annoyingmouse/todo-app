import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { Task } from "../types/Task.ts";

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updatedTask: Task) =>
      axios.patch(
        `${import.meta.env.VITE_API_URL}/tasks/${updatedTask.id}`,
        updatedTask,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};
