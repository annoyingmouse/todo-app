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

import { renderWithQuery } from "./testUtils";
import App from "../../App";
import { screen, fireEvent, waitFor, within } from "@testing-library/react";

it("removes a task when delete is clicked", async () => {
  renderWithQuery(<App />);

  const taskItem = await screen.findByText(/learn testing/i);

  const listItem = taskItem.closest("li")!;
  const deleteButton = within(listItem).getByRole("button", {
    name: /delete/i,
  });

  fireEvent.click(deleteButton);

  await waitFor(() => {
    expect(
      screen.queryByText(/learn testing/i)
    ).not.toBeInTheDocument();
  });
});
