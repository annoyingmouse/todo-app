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
import { screen, fireEvent, waitFor, within } from "@testing-library/react";

const initialTasks = [
  { id: 1, title: "Learn Testing", description: "A test task", completed: 0, dateCompleted: null },
  { id: 2, title: "hello", description: "", completed: 100, dateCompleted: "2025-01-15T12:00:00.000Z" },
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
  });
  vi.mocked(taskApi.delete).mockImplementation(async (id) => {
    tasks = tasks.filter((t) => t.id !== id);
  });
});

async function openEditModalForLearnTesting() {
  const taskItem = await screen.findByText(/learn testing/i);
  const listItem = taskItem.closest("li")!;
  fireEvent.click(within(listItem).getByRole("button", { name: /edit/i }));
}

it("removes a task when delete is clicked", async () => {
  renderWithQuery(<App />);

  const taskItem = await screen.findByText(/learn testing/i);
  const listItem = taskItem.closest("li")!;
  const deleteButton = within(listItem).getByRole("button", {
    name: /delete/i,
  });

  fireEvent.click(deleteButton);

  await waitFor(() => {
    expect(screen.queryByText(/learn testing/i)).not.toBeInTheDocument();
  });
});

it("shows description below task title", async () => {
  renderWithQuery(<App />);

  expect(await screen.findByText("A test task")).toBeInTheDocument();
});

it("opens edit modal when edit is clicked", async () => {
  renderWithQuery(<App />);
  await openEditModalForLearnTesting();

  expect(await screen.findByRole("dialog")).toBeInTheDocument();
  expect(screen.getByDisplayValue("Learn Testing")).toBeInTheDocument();
});

it("saves updated title from edit modal", async () => {
  renderWithQuery(<App />);
  await openEditModalForLearnTesting();

  const titleInput = await screen.findByDisplayValue("Learn Testing");
  fireEvent.change(titleInput, { target: { value: "Updated Task" } });
  fireEvent.click(screen.getByRole("button", { name: /save/i }));

  expect(await screen.findByText("Updated Task")).toBeInTheDocument();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it("applies line-through to completed tasks", async () => {
  renderWithQuery(<App />);

  const taskTitle = await screen.findByText("hello");
  expect(taskTitle).toHaveClass("line-through");
});

it("saves updated description from edit modal", async () => {
  renderWithQuery(<App />);
  await openEditModalForLearnTesting();

  const dialog = await screen.findByRole("dialog");
  const descriptionTextarea = within(dialog).getByLabelText(/description/i);
  fireEvent.change(descriptionTextarea, {
    target: { value: "New description" },
  });
  fireEvent.click(screen.getByRole("button", { name: /save/i }));

  expect(await screen.findByText("New description")).toBeInTheDocument();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it("saves updated completion percentage from edit modal", async () => {
  renderWithQuery(<App />);
  await openEditModalForLearnTesting();

  const dialog = await screen.findByRole("dialog");
  const slider = within(dialog).getByRole("slider");
  fireEvent.change(slider, { target: { value: "75" } });
  fireEvent.click(screen.getByRole("button", { name: /save/i }));

  await waitFor(() => {
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  expect(taskApi.update).toHaveBeenCalledWith(
    expect.objectContaining({ completed: 75 }),
  );
});

it("cancel button closes modal without saving changes", async () => {
  renderWithQuery(<App />);
  await openEditModalForLearnTesting();

  const titleInput = await screen.findByDisplayValue("Learn Testing");
  fireEvent.change(titleInput, { target: { value: "Changed Title" } });
  fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByText("Learn Testing")).toBeInTheDocument();
  expect(screen.queryByText("Changed Title")).not.toBeInTheDocument();
});

it("does not show the date completed field for incomplete tasks", async () => {
  renderWithQuery(<App />);
  await openEditModalForLearnTesting();

  expect(screen.queryByLabelText(/date completed/i)).not.toBeInTheDocument();
});

it("shows the date completed field for fully complete tasks", async () => {
  renderWithQuery(<App />);

  const taskItem = await screen.findByText("hello");
  const listItem = taskItem.closest("li")!;
  fireEvent.click(within(listItem).getByRole("button", { name: /edit/i }));

  expect(await screen.findByLabelText(/date completed/i)).toBeInTheDocument();
});

it("shows the date completed field when slider is moved to 100%", async () => {
  renderWithQuery(<App />);
  await openEditModalForLearnTesting();

  const dialog = screen.getByRole("dialog");
  const slider = within(dialog).getByRole("slider");
  fireEvent.change(slider, { target: { value: "100" } });

  expect(screen.getByLabelText(/date completed/i)).toBeInTheDocument();
});

it("hides the date completed field when slider is moved below 100%", async () => {
  renderWithQuery(<App />);

  const taskItem = await screen.findByText("hello");
  const listItem = taskItem.closest("li")!;
  fireEvent.click(within(listItem).getByRole("button", { name: /edit/i }));

  await screen.findByLabelText(/date completed/i);

  const dialog = screen.getByRole("dialog");
  const slider = within(dialog).getByRole("slider");
  fireEvent.change(slider, { target: { value: "50" } });

  expect(screen.queryByLabelText(/date completed/i)).not.toBeInTheDocument();
});

it("saves an edited date completed", async () => {
  renderWithQuery(<App />);

  const taskItem = await screen.findByText("hello");
  const listItem = taskItem.closest("li")!;
  fireEvent.click(within(listItem).getByRole("button", { name: /edit/i }));

  const dateInput = await screen.findByLabelText(/date completed/i);
  fireEvent.change(dateInput, { target: { value: "2025-12-25" } });
  fireEvent.click(screen.getByRole("button", { name: /save/i }));

  await waitFor(() => {
    expect(taskApi.update).toHaveBeenCalledWith(
      expect.objectContaining({
        dateCompleted: new Date("2025-12-25").toISOString(),
      }),
    );
  });
});

it("clicking the backdrop closes the modal without saving", async () => {
  renderWithQuery(<App />);
  await openEditModalForLearnTesting();

  const dialog = await screen.findByRole("dialog");
  fireEvent.click(dialog);

  await waitFor(() => {
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
