import type { ChangeEvent } from "react";
import { useFilterStore } from "../store/FilterStore";
export default function SearchBox() {
  const searchQuery = useFilterStore((state) => state.searchQuery);
  const setSearchQuery = useFilterStore((state) => state.setSearchQuery);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  return (
    <input
      type="text"
      placeholder="Search tasks..."
      className="border p-2 rounded w-full"
      value={searchQuery}
      onChange={handleChange}
    />
  );
}
