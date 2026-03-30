import { vi, beforeEach } from "vitest";
import type { Task } from "../../types/Task";

vi.mock("../../sql/db-client", () => ({
  taskApi: {
    getAll: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getDeleted: vi.fn(async () => []),
    restore: vi.fn(async () => {}),
    permanentDelete: vi.fn(async () => {}),
  },
}));

import { taskApi } from "../../sql/db-client";
import { renderWithQuery } from "./testUtils";
import App from "../../App";
import { screen, fireEvent, within } from "@testing-library/react";
import { useFilterStore } from "../../store/FilterStore";

// Banana + Avocado in backlog (two tasks for sort testing within a column)
// Cherry in in-progress, Apple + Grape in done (two tasks for date sort testing)
const initialTasks: Task[] = [
  {
    id: 1,
    title: "Banana",
    description: "",
    completed: 0,
    dateCompleted: null,
    parentId: null,
    deletedAt: null,
    status: "backlog",
  },
  {
    id: 2,
    title: "Apple",
    description: "",
    completed: 100,
    dateCompleted: "2025-06-01T10:00:00.000Z",
    parentId: null,
    deletedAt: null,
    status: "done",
  },
  {
    id: 3,
    title: "Cherry",
    description: "",
    completed: 50,
    dateCompleted: null,
    parentId: null,
    deletedAt: null,
    status: "in-progress",
  },
  {
    id: 4,
    title: "Avocado",
    description: "",
    completed: 0,
    dateCompleted: null,
    parentId: null,
    deletedAt: null,
    status: "backlog",
  },
  {
    id: 5,
    title: "Grape",
    description: "",
    completed: 100,
    dateCompleted: "2025-01-01T10:00:00.000Z",
    parentId: null,
    deletedAt: null,
    status: "done",
  },
];

beforeEach(() => {
  let tasks: Task[] = initialTasks.map((t) => ({ ...t }));

  vi.mocked(taskApi.getAll).mockImplementation(async () => [...tasks]);
  vi.mocked(taskApi.add).mockImplementation(async (task) => {
    const newTask = { id: Date.now(), ...task } as (typeof tasks)[number];
    tasks.push(newTask);
    return { id: newTask.id };
  });
  vi.mocked(taskApi.update).mockImplementation(async (task) => {
    tasks = tasks.map((t) => (t.id === task.id ? task : t));
  });
  vi.mocked(taskApi.delete).mockImplementation(async (id) => {
    tasks = tasks.filter((t) => t.id !== id);
  });

  useFilterStore.setState({ searchQuery: "", sortOrder: "asc" });
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

it("shows tasks in their correct Kanban columns", async () => {
  renderWithQuery(<App />);
  await screen.findByText("Banana");

  const backlog = screen.getByTestId("kanban-column-backlog");
  const inProgress = screen.getByTestId("kanban-column-in-progress");
  const done = screen.getByTestId("kanban-column-done");

  expect(within(backlog).getByText("Banana")).toBeInTheDocument();
  expect(within(backlog).getByText("Avocado")).toBeInTheDocument();
  expect(within(inProgress).getByText("Cherry")).toBeInTheDocument();
  expect(within(done).getByText("Apple")).toBeInTheDocument();
  expect(within(done).getByText("Grape")).toBeInTheDocument();

  // Tasks should not appear in wrong columns
  expect(within(backlog).queryByText("Apple")).not.toBeInTheDocument();
  expect(within(done).queryByText("Banana")).not.toBeInTheDocument();
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

it("shows empty column state when no tasks match search", async () => {
  renderWithQuery(<App />);
  await screen.findByText("Banana");

  fireEvent.change(screen.getByPlaceholderText(/search tasks/i), {
    target: { value: "zzz" },
  });

  expect(await screen.findAllByText(/no tasks/i)).toHaveLength(3);
});

it("sorts tasks A to Z within a column", async () => {
  renderWithQuery(<App />);
  await screen.findByText("Banana");

  const backlog = screen.getByTestId("kanban-column-backlog");
  const items = within(backlog).getAllByRole("listitem");
  expect(items[0]).toHaveTextContent("Avocado");
  expect(items[1]).toHaveTextContent("Banana");
});

it("sorts tasks Z to A within a column when sort order is changed", async () => {
  renderWithQuery(<App />);
  await screen.findByText("Banana");

  fireEvent.change(screen.getByRole("combobox"), {
    target: { value: "desc" },
  });

  const backlog = screen.getByTestId("kanban-column-backlog");
  const items = within(backlog).getAllByRole("listitem");
  expect(items[0]).toHaveTextContent("Banana");
  expect(items[1]).toHaveTextContent("Avocado");
});

it("sorts tasks with an earlier dateCompleted first when sorting by date ascending", async () => {
  renderWithQuery(<App />);
  await screen.findByText("Apple");

  fireEvent.change(screen.getByRole("combobox"), {
    target: { value: "dateAsc" },
  });

  const done = screen.getByTestId("kanban-column-done");
  const items = within(done).getAllByRole("listitem");
  // Grape: 2025-01-01 (earlier), Apple: 2025-06-01 (later)
  expect(items[0]).toHaveTextContent("Grape");
  expect(items[1]).toHaveTextContent("Apple");
});

it("sorts tasks with a later dateCompleted first when sorting by date descending", async () => {
  renderWithQuery(<App />);
  await screen.findByText("Apple");

  fireEvent.change(screen.getByRole("combobox"), {
    target: { value: "dateDesc" },
  });

  const done = screen.getByTestId("kanban-column-done");
  const items = within(done).getAllByRole("listitem");
  // Apple: 2025-06-01 (later), Grape: 2025-01-01 (earlier)
  expect(items[0]).toHaveTextContent("Apple");
  expect(items[1]).toHaveTextContent("Grape");
});
