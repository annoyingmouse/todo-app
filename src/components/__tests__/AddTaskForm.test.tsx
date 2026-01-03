import { vi } from "vitest";

// ✅ MUST be first
vi.mock("../../sql/db-client", () => {
  let tasks = [
    { id: 1, title: "Learn Testing", completed: false },
    { id: 2, title: "hello", completed: false },
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
import { renderWithQuery } from "./testUtils";
import App from "../../App";

it("adds a new task to the list when submitted", async () => {
  renderWithQuery(<App />);

  const input = await screen.findByPlaceholderText(/enter new task/i);

  fireEvent.change(input, { target: { value: "Test Task" } });
  fireEvent.click(screen.getByRole("button", { name: /add/i }));

  expect(await screen.findByText("Test Task")).toBeInTheDocument();
});
