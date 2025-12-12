import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      axios.delete(`${import.meta.env.VITE_API_URL}/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};
