import { useTasks } from "../hooks/useTasks.ts";
import { useFilterStore } from "../store/FilterStore";
import SearchBox from "./SearchBox";
import FilterBar from "./FilterBar";
import SortDropdown from "./SortDropdown";
import type { Task } from "../types/Task.ts";
import EmptyState from "./EmptyState.tsx";
import ErrorBanner from "./ErrorBanner.tsx";
import TaskItem from "./TaskItem.tsx";

export default function TaskList() {
  const { data: tasks, isLoading, isError } = useTasks();
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
  if (isLoading) return <p>Loading tasks...</p>;
  if (isError) return <ErrorBanner errorMessage="Failed to fetch tasks." />;
  if (!tasks || tasks.length === 0)
    return (
      <EmptyState message="No tasks available. Add a task to get started." />
    );

  return (
    <div className="space-y-4">
      <SearchBox />
      <FilterBar />
      <SortDropdown />
      {!filteredTasks || filteredTasks.length === 0 ? (
        <EmptyState message="No tasks found matching that search term or filter." />
      ) : (
        <ul className="space-y-2">
          {filteredTasks?.map((task: Task) => (
            <TaskItem task={task} key={task.id} />
          ))}
        </ul>
      )}
    </div>
  );
}
