import { vi, beforeEach } from "vitest";

vi.mock("../../sql/db-client", () => ({
  taskApi: {
    getAll: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { taskApi } from "../../sql/db-client";
import { renderWithQuery } from "./testUtils";
import App from "../../App";
import { screen, fireEvent, within } from "@testing-library/react";
import { useFilterStore } from "../../store/FilterStore";

const initialTasks = [
  { id: 1, title: "Banana", description: "", completed: 0 },
  { id: 2, title: "Apple", description: "", completed: 100 },
  { id: 3, title: "Cherry", description: "", completed: 50 },
];

beforeEach(() => {
  let tasks = initialTasks.map((t) => ({ ...t }));

  vi.mocked(taskApi.getAll).mockImplementation(async () => [...tasks]);
  vi.mocked(taskApi.add).mockImplementation(async (task) => {
    const newTask = { id: Date.now(), ...task };
    tasks.push(newTask);
    return newTask;
  });
  vi.mocked(taskApi.update).mockImplementation(async (task) => {
    tasks = tasks.map((t) => (t.id === task.id ? task : t));
    return task;
  });
  vi.mocked(taskApi.delete).mockImplementation(async (id) => {
    tasks = tasks.filter((t) => t.id !== id);
  });

  useFilterStore.setState({ searchQuery: "", filter: "all", sortOrder: "asc" });
});

it("shows all tasks by default", async () => {
  renderWithQuery(<App />);

  expect(await screen.findByText("Banana")).toBeInTheDocument();
  expect(screen.getByText("Apple")).toBeInTheDocument();
  expect(screen.getByText("Cherry")).toBeInTheDocument();
});

it("shows empty state when there are no tasks", async () => {
  vi.mocked(taskApi.getAll).mockResolvedValue([]);
  renderWithQuery(<App />);

  expect(await screen.findByText(/no tasks available/i)).toBeInTheDocument();
});

it("shows error state when fetch fails", async () => {
  vi.mocked(taskApi.getAll).mockRejectedValue(new Error("Network error"));
  renderWithQuery(<App />);

  expect(await screen.findByText(/failed to fetch tasks/i)).toBeInTheDocument();
});

it("filters to show only active tasks", async () => {
  renderWithQuery(<App />);
  await screen.findByText("Banana");

  fireEvent.click(screen.getByRole("button", { name: /^active$/i }));

  expect(screen.getByText("Banana")).toBeInTheDocument();
  expect(screen.getByText("Cherry")).toBeInTheDocument();
  expect(screen.queryByText("Apple")).not.toBeInTheDocument();
});

it("filters to show only completed tasks", async () => {
  renderWithQuery(<App />);
  await screen.findByText("Banana");

  fireEvent.click(screen.getByRole("button", { name: /^completed$/i }));

  expect(screen.getByText("Apple")).toBeInTheDocument();
  expect(screen.queryByText("Banana")).not.toBeInTheDocument();
  expect(screen.queryByText("Cherry")).not.toBeInTheDocument();
});

it("shows all tasks when All filter is selected", async () => {
  renderWithQuery(<App />);
  await screen.findByText("Banana");

  fireEvent.click(screen.getByRole("button", { name: /^completed$/i }));
  fireEvent.click(screen.getByRole("button", { name: /^all$/i }));

  expect(screen.getByText("Banana")).toBeInTheDocument();
  expect(screen.getByText("Apple")).toBeInTheDocument();
  expect(screen.getByText("Cherry")).toBeInTheDocument();
});

it("narrows results when searching", async () => {
  renderWithQuery(<App />);
  await screen.findByText("Banana");

  fireEvent.change(screen.getByPlaceholderText(/search tasks/i), {
    target: { value: "ban" },
  });

  expect(screen.getByText("Banana")).toBeInTheDocument();
  expect(screen.queryByText("Apple")).not.toBeInTheDocument();
  expect(screen.queryByText("Cherry")).not.toBeInTheDocument();
});

it("shows empty state when no tasks match search", async () => {
  renderWithQuery(<App />);
  await screen.findByText("Banana");

  fireEvent.change(screen.getByPlaceholderText(/search tasks/i), {
    target: { value: "zzz" },
  });

  expect(await screen.findByText(/no tasks found/i)).toBeInTheDocument();
});

it("sorts tasks A to Z by default", async () => {
  renderWithQuery(<App />);
  await screen.findByText("Banana");

  const main = screen.getByRole("main");
  const items = within(main).getAllByRole("listitem");
  expect(items[0]).toHaveTextContent("Apple");
  expect(items[1]).toHaveTextContent("Banana");
  expect(items[2]).toHaveTextContent("Cherry");
});

it("sorts tasks Z to A when sort order is changed", async () => {
  renderWithQuery(<App />);
  await screen.findByText("Banana");

  fireEvent.change(screen.getByRole("combobox"), {
    target: { value: "desc" },
  });

  const main = screen.getByRole("main");
  const items = within(main).getAllByRole("listitem");
  expect(items[0]).toHaveTextContent("Cherry");
  expect(items[1]).toHaveTextContent("Banana");
  expect(items[2]).toHaveTextContent("Apple");
});
