import parse from "html-react-parser";
import type { TaskProps } from "../types/TaskProps";
import {deleteTodo, toggleTodo} from "../db/todos.repo";


const TaskItem: React.FC<TaskProps> = ({ task }) => {

  return (
    <li
      key={task.id}
      className="flex justify-between items-center border p-2 rounded"
    >
      <span className={`flex-1 ${task.completed ? "line-through" : ""}`}>
        {parse(task.title)}
      </span>
      <button
        onClick={() => toggleTodo(task.id, task.completed)}
        className="text-sm px-2 py-1 bg-yellow-200 rounded"
      >
        Toggle
      </button>
      <button
        onClick={() => deleteTodo(task.id)}
        className="ml-2 text-sm px-2 py-1 bg-red-300 rounded"
      >
        Delete
      </button>
    </li>
  );
};

export default TaskItem;
