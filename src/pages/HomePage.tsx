import AddTaskForm from "../components/AddTaskForm";
import TaskList from "../components/TaskList";

const HomePage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Home</h1>
      <AddTaskForm />
      <TaskList />
    </div>
  );
};
export default HomePage;
