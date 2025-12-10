import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;

// import { useEffect, useState } from "react";
// import Layout from "./components/Layout";
// import TaskList from "./components/TaskList.tsx";
// import AddTaskForm from "./components/AddTaskForm.tsx";
// import type { Task } from "./types/task.ts";
// import { fetchTasks, createTask, deleteTask, updateTask } from "./api/tasksApi";
//
// function App() {
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//
//   useEffect(() => {
//     const load = async () => {
//       try {
//         const data = await fetchTasks();
//         setTasks(data);
//       } catch (err) {
//         console.error(err);
//         setError("Could not fetch tasks.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, []);
//
//   // Add Task
//   const addTask = async (title: string) => {
//     try {
//       const newTask = await createTask(title);
//       setTasks((prev) => [newTask, ...prev]);
//     } catch (err) {
//       console.error(err);
//       alert("Could not create task.");
//     }
//   };
//   // Delete Task
//   const handleDelete = async (id: number) => {
//     try {
//       await deleteTask(id);
//       setTasks((prev) => prev.filter((task) => task.id !== id));
//     } catch (err) {
//       console.error(err);
//       alert("Could not delete task.");
//     }
//   };
//   // Toggle Completion
//   const toggleTask = async (id: number) => {
//     const task = tasks.find((t) => t.id === id);
//     if (!task) return;
//     try {
//       const updated = await updateTask(id, { completed: !task.completed });
//       setTasks((prev) =>
//         prev.map((t) => (t.id === id ? { ...t, ...updated } : t)),
//       );
//     } catch (err) {
//       console.error(err);
//       alert("Update failed.");
//     }
//   };
//
//   const startEditing = (id: number) => {
//     setEditingTaskId(id);
//   };
//   const stopEditing = () => {
//     setEditingTaskId(null);
//   };
//
//   const updateTaskTitle = (id: number, newTitle: string) => {
//     setTasks((prev) =>
//       prev.map((task) =>
//         task.id === id ? { ...task, title: newTitle } : task,
//       ),
//     );
//     stopEditing();
//   };
//
//   return (
//     <Layout>
//       <h1 className="text-2xl font-bold mb-4 text-center">Tasks Manager</h1>
//       {loading && <p className="text-center text-gray-500">Loading...</p>}
//       {error && <p className="text-center text-red-500">{error}</p>}
//       {!loading && !error && (
//         <>
//           <AddTaskForm onAdd={addTask} />
//           <TaskList
//             tasks={tasks}
//             onToggle={toggleTask}
//             onDelete={handleDelete}
//             editingTaskId={editingTaskId}
//             onStartEdit={startEditing}
//             onStopEdit={stopEditing}
//             onUpdateTitle={updateTaskTitle}
//           />
//         </>
//       )}
//     </Layout>
//   );
// }
//
// export default App;
