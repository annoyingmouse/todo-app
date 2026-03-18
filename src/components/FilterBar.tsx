import { useFilterStore } from "../store/FilterStore";
export default function FilterBar() {
  const filter = useFilterStore((state) => state.filter);
  const setFilter = useFilterStore((state) => state.setFilter);
  const options = ["all", "active", "completed"] as const;
  return (
    <fieldset className="flex gap-2 h-full border-0 p-0 m-0">
      <legend className="sr-only">Filter tasks by status</legend>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => setFilter(option)}
          aria-pressed={filter === option}
          className={`px-3 py-1 rounded ${
            filter === option ? "bg-blue-700 text-white" : "bg-gray-200"
          }`}
        >
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </button>
      ))}
    </fieldset>
  );
}
