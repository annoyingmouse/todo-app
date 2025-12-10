import { useTasks } from "../hooks/useTasks.ts";
import { useDeleteTask } from "../hooks/useDeleteTask.ts";
import { useUpdateTask } from "../hooks/useUpdateTask.ts";
import { useFilterStore } from "../store/FilterStore";
import SearchBox from "./SearchBox";
import FilterBar from "./FilterBar";
import SortDropdown from "./SortDropdown";
import type { Task } from "../types/Task.ts";

export default function TaskList() {
  const { data: tasks, isLoading, isError } = useTasks();
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  const searchQuery = useFilterStore((state) => state.searchQuery);
  const filter = useFilterStore((state) => state.filter);
  const sortOrder = useFilterStore((state) => state.sortOrder);
  const filteredTasks = tasks
    ?.filter((task: Task) => {
      if (filter === "active") return !task.completed;
      if (filter === "completed") return task.completed;
      return true;
    })
    .filter((task: Task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      return sortOrder === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    });
  const handleToggle = (task: Task) => {
    updateTask.mutate({ ...task, completed: !task.completed });
  };
  const handleDelete = (id: number) => {
    deleteTask.mutate(id);
  };
  if (isLoading) return <p>Loading tasks...</p>;
  if (isError) return <p>Failed to load tasks.</p>;
  return (
    <div className="space-y-4">
      <SearchBox />
      <FilterBar />
      <SortDropdown />
      <ul className="space-y-2">
        {filteredTasks?.map((task: Task) => (
          <li
            key={task.id}
            className="flex justify-between items-center p-3 border rounded"
          >
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggle(task)}
              />
              <span className={task.completed ? "line-through" : ""}>
                {task.title}
              </span>
            </label>
            <button
              onClick={() => handleDelete(task.id)}
              className="text-red-500 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
