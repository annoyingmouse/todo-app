import parse from "html-react-parser";
import type { TaskProps } from "../types/TaskProps.ts";
import { useDeleteTask } from "../hooks/useDeleteTask.ts";
import { useUpdateTask } from "../hooks/useUpdateTask.ts";

const TaskItem: React.FC<TaskProps> = ({ task }) => {
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();

  return (
    <li
      key={task.id}
      className="flex justify-between items-center border p-2 rounded"
    >
      <span
        className={`flex-1 ${
          task.completed ? "line-through text-gray-400" : ""
        }`}
      >
        {parse(task.title)}
      </span>
      <button
        onClick={() =>
          updateTask.mutate({ ...task, completed: !task.completed })
        }
        className="text-sm px-2 py-1 bg-yellow-200 rounded"
      >
        Toggle
      </button>
      <button
        onClick={() => deleteTask.mutate(task.id)}
        className="ml-2 text-sm px-2 py-1 bg-red-300 rounded"
      >
        Delete
      </button>
    </li>
  );
};

export default TaskItem;
