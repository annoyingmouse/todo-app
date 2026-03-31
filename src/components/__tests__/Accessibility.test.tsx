import { vi, expect } from "vitest";
import { axe } from "vitest-axe";

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
import { screen } from "@testing-library/react";
import type { Task } from "../../types/Task";

const tasks: Task[] = [
  {
    id: 1,
    title: "Write tests",
    description: "Make sure everything is covered",
    completed: 0,
    dateCompleted: null,
    parentId: null,
    deletedAt: null,
    status: "backlog",
  },
  {
    id: 2,
    title: "Review PR",
    description: "",
    completed: 50,
    dateCompleted: null,
    parentId: null,
    deletedAt: null,
    status: "in-progress",
  },
  {
    id: 3,
    title: "Deploy to production",
    description: "",
    completed: 100,
    dateCompleted: "2025-06-01T10:00:00.000Z",
    parentId: null,
    deletedAt: null,
    status: "done",
  },
  {
    id: 4,
    title: "Subtask example",
    description: "",
    completed: 0,
    dateCompleted: null,
    parentId: 1,
    deletedAt: null,
    status: "backlog",
  },
];

beforeEach(() => {
  localStorage.setItem("dev-notice-acknowledged", "true");
  vi.mocked(taskApi.getAll).mockResolvedValue([...tasks]);
});

it("board page has no axe violations", async () => {
  const { container } = renderWithQuery(<App />);
  await screen.findByText("Write tests");
  expect(await axe(container)).toHaveNoViolations();
});

it("board page has no axe violations when there are no tasks", async () => {
  vi.mocked(taskApi.getAll).mockResolvedValue([]);
  const { container } = renderWithQuery(<App />);
  await screen.findByText(/no tasks available/i);
  expect(await axe(container)).toHaveNoViolations();
});
