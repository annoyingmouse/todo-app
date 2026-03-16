import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApi } from "../sql/db-client";
import { Task } from "../types/Task";

export function useTrash() {
  const queryClient = useQueryClient();
  const trashKey = ["trash"];
  const tasksKey = ["tasks"];

  const query = useQuery<Task[]>({
    queryKey: trashKey,
    queryFn: () => taskApi.getDeleted(),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => taskApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trashKey });
      queryClient.invalidateQueries({ queryKey: tasksKey });
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: (id: number) => taskApi.permanentDelete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: trashKey });
      const previous = queryClient.getQueryData<Task[]>(trashKey);
      queryClient.setQueryData<Task[]>(trashKey, (old) =>
        old?.filter((t) => t.id !== id && t.parentId !== id),
      );
      return { previous };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(trashKey, context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: trashKey }),
  });

  return {
    deletedTasks: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    restore: restoreMutation.mutate,
    permanentDelete: permanentDeleteMutation.mutate,
  };
}
