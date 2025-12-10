import { useFilterStore } from "../store/FilterStore";
export default function SortDropdown() {
  const sortOrder = useFilterStore((state) => state.sortOrder);
  const setSortOrder = useFilterStore((state) => state.setSortOrder);
  return (
    <select
      className="border rounded p-2"
      value={sortOrder}
      onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
    >
      <option value="asc">Sort A → Z</option>
      <option value="desc">Sort Z → A</option>
    </select>
  );
}
