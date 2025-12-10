import { create } from "zustand";
import type { FilterState } from "../types/FilterState.ts";

export const useFilterStore = create<FilterState>((set) => ({
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  filter: "all",
  setFilter: (filter) => set({ filter }),
  sortOrder: "asc",
  setSortOrder: (order) => set({ sortOrder: order }),
}));
