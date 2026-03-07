export type FilterState = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filter: "all" | "active" | "completed";
  setFilter: (filter: "all" | "active" | "completed") => void;
  sortOrder: "asc" | "desc" | "dateAsc" | "dateDesc";
  setSortOrder: (order: "asc" | "desc" | "dateAsc" | "dateDesc") => void;
};
