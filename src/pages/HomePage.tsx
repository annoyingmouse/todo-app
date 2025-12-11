import AddTaskForm from "../components/AddTaskForm.tsx";
import TaskList from "../components/TaskList.tsx";

const HomePage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Home</h1>
      <p>Welcome to the task manager!</p>
      <AddTaskForm />
      <TaskList />
    </div>
  );
};
export default HomePage;
