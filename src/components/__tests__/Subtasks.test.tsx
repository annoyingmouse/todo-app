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
  status: "backlog" | "in-progress" | "done";
  collapsed: boolean;
};

const parent: MockTask = {
  id: 1,
  title: "Parent Task",
  description: "",
  completed: 0,
  dateCompleted: null,
  parentId: null,
  deletedAt: null,
  status: "backlog",
  collapsed: false,
};
const subtask: MockTask = {
  id: 2,
  title: "Subtask",
  description: "",
  completed: 60,
  dateCompleted: null,
  parentId: 1,
  deletedAt: null,
  status: "in-progress",
  collapsed: false,
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
  localStorage.setItem("dev-notice-acknowledged", "true");
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

  // Only the parent appears as a direct child of the root task list
  const rootListItems = screen
    .getByRole("main")
    .querySelectorAll("ul.space-y-2 > li");
  expect(rootListItems).toHaveLength(1);

  // The subtask is nested inside the parent card, not a separate root item
  expect(screen.getByText("Subtask")).toBeInTheDocument();
});

it("parent task displays completion derived from its subtask", async () => {
  setupTasks([parent, subtask]); // subtask is at 60%
  renderWithQuery(<App />);

  await screen.findByText("Parent Task");

  // The parent's own content div (direct child of the li) shows 60%
  const parentLi = screen.getByText("Parent Task").closest("li")!;
  const parentContentDiv = parentLi.querySelector(":scope > div")!;
  expect(within(parentContentDiv).getByText("60%")).toBeInTheDocument();
});

it("parent task has no slider when it has subtasks", async () => {
  setupTasks([parent, subtask]);
  renderWithQuery(<App />);

  await screen.findByText("Parent Task");

  // Use the aria-label to target only the parent's slider, not the child's
  expect(
    screen.queryByRole("slider", {
      name: /completion percentage for parent task/i,
    }),
  ).toBeNull();
});

it("collapse button hides subtasks and expand button shows them again", async () => {
  setupTasks([parent, subtask]);
  renderWithQuery(<App />);

  await screen.findByText("Subtask");

  const parentLi = screen.getByText("Parent Task").closest("li")!;
  const collapseBtn = within(parentLi).getByRole("button", {
    name: /collapse subtasks/i,
  });
  expect(collapseBtn).toHaveAttribute("aria-expanded", "true");

  fireEvent.click(collapseBtn);

  await waitFor(() => {
    expect(screen.queryByText("Subtask")).not.toBeInTheDocument();
  });
  expect(
    within(parentLi).getByRole("button", { name: /expand subtasks/i }),
  ).toHaveAttribute("aria-expanded", "false");

  fireEvent.click(
    within(parentLi).getByRole("button", { name: /expand subtasks/i }),
  );
  expect(await screen.findByText("Subtask")).toBeInTheDocument();
});

it("subtask card is nested inside the parent card", async () => {
  setupTasks([parent, subtask]);
  renderWithQuery(<App />);

  await screen.findByText("Subtask");

  const parentLi = screen.getByText("Parent Task").closest("li")!;
  expect(within(parentLi).getByText("Subtask")).toBeInTheDocument();
});

it("subtask card has a blue left border accent", async () => {
  setupTasks([parent, subtask]);
  renderWithQuery(<App />);

  await screen.findByText("Subtask");

  const subtaskContentDiv = screen
    .getByText("Subtask")
    .closest("li")!
    .querySelector(":scope > div")!;
  expect(subtaskContentDiv.className).toContain("border-l-blue-400");
});

it("collapse button is not shown for tasks without subtasks", async () => {
  setupTasks([parent]);
  renderWithQuery(<App />);

  const parentEl = await screen.findByText("Parent Task");
  const listItem = parentEl.closest("li")!;

  expect(
    within(listItem).queryByRole("button", { name: /collapse subtasks/i }),
  ).not.toBeInTheDocument();
  expect(
    within(listItem).queryByRole("button", { name: /expand subtasks/i }),
  ).not.toBeInTheDocument();
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
