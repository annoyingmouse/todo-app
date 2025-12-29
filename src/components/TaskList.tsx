import { useFilterStore } from "../store/FilterStore";
import SearchBox from "./SearchBox";
import FilterBar from "./FilterBar";
import SortDropdown from "./SortDropdown";
import type { Task } from "../types/Task";
import EmptyState from "./EmptyState";
import TaskItem from "./TaskItem";
import { listTodos } from "../db/todos.repo";

export default function TaskList() {
  const { data: todos = [] } = listTodos();
  const searchQuery = useFilterStore((state) => state.searchQuery);
  const filter = useFilterStore((state) => state.filter);
  const sortOrder = useFilterStore((state) => state.sortOrder);
  const filteredTasks = todos
    ?.filter((task: Task) => {
      if (filter === "active") return !task.completed;
      if (filter === "completed") return task.completed;
      return true;
    })
    .filter((task: Task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a: Task, b: Task) => {
      return sortOrder === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    });
  if (!todos || todos.length === 0)
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
