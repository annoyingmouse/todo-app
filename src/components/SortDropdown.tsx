import { useFilterStore } from "../store/FilterStore";
export default function SortDropdown() {
  const sortOrder = useFilterStore((state) => state.sortOrder);
  const setSortOrder = useFilterStore((state) => state.setSortOrder);
  return (
    <div>
      <label htmlFor="resultSort" className="sr-only">
        Sort
      </label>
      <select
        id="resultSort"
        className="border rounded p-2"
        value={sortOrder}
        onChange={(e) =>
          setSortOrder(
            e.target.value as "asc" | "desc" | "dateAsc" | "dateDesc",
          )
        }
      >
        <option value="asc">Sort A → Z</option>
        <option value="desc">Sort Z → A</option>
        <option value="dateAsc">Date completed ↑</option>
        <option value="dateDesc">Date completed ↓</option>
      </select>
    </div>
  );
}
