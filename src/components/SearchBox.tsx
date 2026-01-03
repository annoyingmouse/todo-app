import type { ChangeEvent } from "react";
import { useFilterStore } from "../store/FilterStore";
export default function SearchBox() {
  const searchQuery = useFilterStore((state) => state.searchQuery);
  const setSearchQuery = useFilterStore((state) => state.setSearchQuery);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  return (
    <div className="relative">
      <label htmlFor="searchQuery" className="sr-only">
        Search
      </label>
      <input
        id="searchQuery"
        type="text"
        placeholder="Search tasks..."
        className="border p-2 rounded w-full"
        value={searchQuery}
        onChange={handleChange}
      />
      <button
        className="absolute right-0 inset-y-0 flex items-center"
        onClick={() => setSearchQuery("")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="-ml-1 mr-3 h-5 w-5 text-gray-400 hover:text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
