import type { Task } from "../types/Task";

export function sortTasks(
  tasks: Task[],
  sortOrder: "asc" | "desc" | "dateAsc" | "dateDesc",
): Task[] {
  return [...tasks].sort((a, b) => {
    if (sortOrder === "asc") return a.title.localeCompare(b.title);
    if (sortOrder === "desc") return b.title.localeCompare(a.title);
    const aDate = a.dateCompleted ?? "";
    const bDate = b.dateCompleted ?? "";
    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;
    return sortOrder === "dateAsc"
      ? aDate.localeCompare(bDate)
      : bDate.localeCompare(aDate);
  });
}
