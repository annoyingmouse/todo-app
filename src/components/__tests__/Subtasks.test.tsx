import { vi, beforeEach } from "vitest";

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
import { screen, fireEvent, waitFor, within } from "@testing-library/react";

type MockTask = {
  id: number;
  title: string;
  description: string;
  completed: number;
  dateCompleted: string | null;
  parentId: number | null;
  deletedAt: string | null;
};

const parent: MockTask = {
  id: 1,
  title: "Parent Task",
  description: "",
  completed: 0,
  dateCompleted: null,
  parentId: null,
  deletedAt: null,
};
const subtask: MockTask = {
  id: 2,
  title: "Subtask",
  description: "",
  completed: 60,
  dateCompleted: null,
  parentId: 1,
  deletedAt: null,
};

function setupTasks(initial: MockTask[]) {
  let tasks = initial.map((t) => ({ ...t }));
  vi.mocked(taskApi.getAll).mockImplementation(async () => [...tasks]);
  vi.mocked(taskApi.add).mockImplementation(async (task) => {
    const newTask = { ...task, id: Date.now(), deletedAt: null } as MockTask;
    tasks.push(newTask);
    return newTask;
  });
  vi.mocked(taskApi.update).mockImplementation(async (task) => {
    tasks = tasks.map((t) => (t.id === task.id ? { ...t, ...task } : t));
  });
  vi.mocked(taskApi.delete).mockImplementation(async (id) => {
    tasks = tasks.filter((t) => t.id !== id && t.parentId !== id);
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

it("shows an inline subtask form when the + button is clicked", async () => {
  setupTasks([parent]);
  renderWithQuery(<App />);

  const parentEl = await screen.findByText("Parent Task");
  const listItem = parentEl.closest("li")!;
  fireEvent.click(
    within(listItem).getByRole("button", {
      name: /add subtask to parent task/i,
    }),
  );

  expect(screen.getByPlaceholderText(/subtask title/i)).toBeInTheDocument();
});

it("cancel button hides the subtask form", async () => {
  setupTasks([parent]);
  renderWithQuery(<App />);

  const parentEl = await screen.findByText("Parent Task");
  const listItem = parentEl.closest("li")!;
  fireEvent.click(
    within(listItem).getByRole("button", {
      name: /add subtask to parent task/i,
    }),
  );
  fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

  expect(
    screen.queryByPlaceholderText(/subtask title/i),
  ).not.toBeInTheDocument();
});

it("adds a subtask with the correct parentId", async () => {
  setupTasks([parent]);
  renderWithQuery(<App />);

  const parentEl = await screen.findByText("Parent Task");
  const listItem = parentEl.closest("li")!;
  fireEvent.click(
    within(listItem).getByRole("button", {
      name: /add subtask to parent task/i,
    }),
  );

  const input = screen.getByPlaceholderText(/subtask title/i);
  fireEvent.change(input, { target: { value: "My Subtask" } });
  fireEvent.submit(input.closest("form")!);

  await waitFor(() => {
    expect(taskApi.add).toHaveBeenCalledWith(
      expect.objectContaining({ title: "My Subtask", parentId: 1 }),
    );
  });
});

it("displays the subtask nested under the parent", async () => {
  setupTasks([parent]);
  renderWithQuery(<App />);

  const parentEl = await screen.findByText("Parent Task");
  const listItem = parentEl.closest("li")!;
  fireEvent.click(
    within(listItem).getByRole("button", {
      name: /add subtask to parent task/i,
    }),
  );

  const input = screen.getByPlaceholderText(/subtask title/i);
  fireEvent.change(input, { target: { value: "My Subtask" } });
  fireEvent.submit(input.closest("form")!);

  expect(await screen.findByText("My Subtask")).toBeInTheDocument();
});

it("subtask does not appear as a root-level task", async () => {
  setupTasks([parent, subtask]);
  renderWithQuery(<App />);

  await screen.findByText("Parent Task");

  // Subtask is present in the page (rendered nested inside parent TaskItem)
  expect(screen.getByText("Subtask")).toBeInTheDocument();

  // Only the parent appears as a direct child of the root task list
  const rootListItems = screen
    .getByRole("main")
    .querySelectorAll("ul.space-y-2 > li");
  expect(rootListItems).toHaveLength(1);
  expect(rootListItems[0]).toHaveTextContent("Parent Task");
  expect(rootListItems[0]).not.toHaveTextContent("Subtask");
});

it("parent task displays completion derived from its subtask", async () => {
  setupTasks([parent, subtask]); // subtask is at 60%
  renderWithQuery(<App />);

  await screen.findByText("Parent Task");

  // Parent should show 60% (derived from the subtask), not 0%
  const parentLi = screen.getByText("Parent Task").closest("li")!;
  expect(within(parentLi).getByText("60%")).toBeInTheDocument();
});

it("parent task has no slider when it has subtasks", async () => {
  setupTasks([parent, subtask]);
  renderWithQuery(<App />);

  await screen.findByText("Parent Task");

  const parentLi = screen.getByText("Parent Task").closest("li")!;
  expect(within(parentLi).queryByRole("slider")).toBeNull();
});

it("deleting a parent task also removes its subtask", async () => {
  setupTasks([parent, subtask]);
  renderWithQuery(<App />);

  await screen.findByText("Subtask");

  const parentLi = screen.getByText("Parent Task").closest("li")!;
  // First delete button belongs to the parent row
  fireEvent.click(
    within(parentLi).getAllByRole("button", { name: /delete/i })[0],
  );

  await waitFor(() => {
    expect(screen.queryByText("Parent Task")).not.toBeInTheDocument();
    expect(screen.queryByText("Subtask")).not.toBeInTheDocument();
  });
});
