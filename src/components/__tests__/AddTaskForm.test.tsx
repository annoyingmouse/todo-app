import { vi, beforeEach } from "vitest";

// ✅ MUST be first
vi.mock("../../sql/db-client", () => {
  let tasks = [
    { id: 1, title: "Learn Testing", description: "", completed: 0 },
    { id: 2, title: "hello", description: "", completed: 0 },
  ];

  return {
    taskApi: {
      getAll: vi.fn(async () => [...tasks]),
      add: vi.fn(async (task) => {
        const newTask = { id: Date.now(), ...task };
        tasks.push(newTask);
        return newTask;
      }),
      update: vi.fn(async (task) => task),
      delete: vi.fn(async (id) => {
        tasks = tasks.filter((t) => t.id !== id);
      }),
    },
  };
});

import { screen, fireEvent } from "@testing-library/react";

beforeEach(() => {
  vi.clearAllMocks();
});
import { renderWithQuery } from "./testUtils";
import App from "../../App";

it("adds a new task to the list when submitted", async () => {
  renderWithQuery(<App />);

  const input = await screen.findByPlaceholderText(/enter new task/i);

  fireEvent.change(input, { target: { value: "Test Task" } });
  fireEvent.click(screen.getByRole("button", { name: /add/i }));

  expect(await screen.findByText("Test Task")).toBeInTheDocument();
});

it("does not add a task when the title is empty", async () => {
  renderWithQuery(<App />);

  await screen.findByPlaceholderText(/enter new task/i);
  fireEvent.click(screen.getByRole("button", { name: /add/i }));

  const { taskApi } = await import("../../sql/db-client");
  expect(taskApi.add).not.toHaveBeenCalled();
});
