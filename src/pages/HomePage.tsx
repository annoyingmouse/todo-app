import AddTaskForm from "../components/AddTaskForm";
import KanbanBoard from "../components/KanbanBoard";

const HomePage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Board</h1>
      <AddTaskForm />
      <KanbanBoard />
    </div>
  );
};
export default HomePage;
