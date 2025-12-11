import { useFilterStore } from "../store/FilterStore";
export default function FilterBar() {
  const filter = useFilterStore((state) => state.filter);
  const setFilter = useFilterStore((state) => state.setFilter);
  const options = ["all", "active", "completed"] as const;
  return (
    <div className="flex gap-2 h-full">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => setFilter(option)}
          className={`px-3 py-1 rounded ${
            filter === option ? "bg-blue-700 text-white" : "bg-gray-200"
          }`}
        >
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </button>
      ))}
    </div>
  );
}
