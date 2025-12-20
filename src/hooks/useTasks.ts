import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApi } from "../sql/db-client";
import { Task } from "../types/Task"; // Make sure this interface exists

export function useTasks() {
  const queryClient = useQueryClient();
  const queryKey = ["tasks"];

  // 1. Explicitly type the query with <Task[]>
  const query = useQuery<Task[]>({
    queryKey,
    queryFn: async () => {
      const res = await taskApi.getAll();
      return res as Task[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updatedTask: Task) => taskApi.update(updatedTask),
    onMutate: async (updatedTask) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey);
      queryClient.setQueryData<Task[]>(queryKey, (old) =>
        old?.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
      );
      return { previousTasks };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(queryKey, context?.previousTasks);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => taskApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey);
      queryClient.setQueryData<Task[]>(queryKey, (old) =>
        old?.filter((t) => t.id !== id),
      );
      return { previousTasks };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(queryKey, context?.previousTasks);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const addMutation = useMutation({
    mutationFn: (newTask: Omit<Task, "id">) => taskApi.add(newTask),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    tasks: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.error,
    updateTask: updateMutation.mutate,
    deleteTask: deleteMutation.mutate,
    addTask: addMutation.mutate,
  };
}
