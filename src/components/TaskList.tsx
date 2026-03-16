import { useTasks } from "../hooks/useTasks";
import { useFilterStore } from "../store/FilterStore";
import SearchBox from "./SearchBox";
import FilterBar from "./FilterBar";
import SortDropdown from "./SortDropdown";
import type { Task } from "../types/Task";
import EmptyState from "./EmptyState";
import ErrorBanner from "./ErrorBanner";
import TaskItem from "./TaskItem";
import { sortTasks } from "../utils/sortTasks";

export default function TaskList() {
  const { tasks, isLoading, isError } = useTasks();
  const searchQuery = useFilterStore((state) => state.searchQuery);
  const filter = useFilterStore((state) => state.filter);
  const sortOrder = useFilterStore((state) => state.sortOrder);
  const filtered = (tasks ?? [])
    .filter((task: Task) => task.parentId === null)
    .filter((task: Task) => {
      if (filter === "active") return task.completed < 100;
      if (filter === "completed") return task.completed === 100;
      return true;
    })
    .filter((task: Task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  const filteredTasks = sortTasks(filtered, sortOrder);
  if (isLoading) return <p role="status">Loading tasks...</p>;
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
