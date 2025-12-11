import { useState } from "react";
import { useAddTask } from "../hooks/useAddTask";

const AddTaskForm = () => {
  const [title, setTitle] = useState("");
  const addTask = useAddTask();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask.mutate({ title, completed: false });
    setTitle("");
  };
  return (
    <form onSubmit={handleSubmit} className="flex space-x-2 mb-4">
      <label htmlFor="task-title" className="sr-only">
        Task Title
      </label>
      <input
        id="task-title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1 p-2 border border-gray-300 rounded"
        placeholder="Enter a new task"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Add
      </button>
    </form>
  );
};
export default AddTaskForm;
