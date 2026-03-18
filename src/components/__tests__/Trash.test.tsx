import { vi, beforeEach } from "vitest";

vi.mock("../../sql/db-client", () => ({
  taskApi: {
    getAll: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getDeleted: vi.fn(),
    restore: vi.fn(),
    permanentDelete: vi.fn(),
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

const task1: MockTask = {
  id: 1,
  title: "Buy milk",
  description: "",
  completed: 0,
  dateCompleted: null,
  parentId: null,
  deletedAt: null,
};
const parentTask: MockTask = {
  id: 2,
  title: "Parent Task",
  description: "",
  completed: 0,
  dateCompleted: null,
  parentId: null,
  deletedAt: null,
};
const childTask: MockTask = {
  id: 3,
  title: "Child Task",
  description: "",
  completed: 0,
  dateCompleted: null,
  parentId: 2,
  deletedAt: null,
};

function setupMocks(initial: MockTask[]) {
  let active = initial.map((t) => ({ ...t }));
  let deleted: MockTask[] = [];

  vi.mocked(taskApi.getAll).mockImplementation(async () => [...active]);
  vi.mocked(taskApi.getDeleted).mockImplementation(async () => [...deleted]);
  vi.mocked(taskApi.add).mockImplementation(async (task) => {
    const newTask = { id: Date.now(), ...task } as MockTask;
    active.push(newTask);
    return newTask;
  });
  vi.mocked(taskApi.update).mockImplementation(async (task) => {
    active = active.map((t) => (t.id === task.id ? { ...t, ...task } : t));
  });
  vi.mocked(taskApi.delete).mockImplementation(async (id) => {
    const now = new Date().toISOString();
    const toDelete = active.filter((t) => t.id === id || t.parentId === id);
    toDelete.forEach((t) => {
      t.deletedAt = now;
    });
    deleted.push(...toDelete);
    active = active.filter((t) => t.id !== id && t.parentId !== id);
  });
  vi.mocked(taskApi.restore).mockImplementation(async (id) => {
    const target = deleted.find((t) => t.id === id);
    const idsToRestore = new Set<number>();

    // collect subtree
    const addSubtree = (pid: number) => {
      idsToRestore.add(pid);
      deleted
        .filter((t) => t.parentId === pid)
        .forEach((t) => addSubtree(t.id));
    };
    addSubtree(id);

    // collect ancestor chain
    let current = target?.parentId
      ? deleted.find((t) => t.id === target.parentId)
      : undefined;
    while (current) {
      idsToRestore.add(current.id);
      current = current.parentId
        ? deleted.find((t) => t.id === current!.parentId)
        : undefined;
    }

    const toRestore = deleted.filter((t) => idsToRestore.has(t.id));
    toRestore.forEach((t) => {
      t.deletedAt = null;
    });
    active.push(...toRestore);
    deleted = deleted.filter((t) => !idsToRestore.has(t.id));
  });
  vi.mocked(taskApi.permanentDelete).mockImplementation(async (id) => {
    deleted = deleted.filter((t) => t.id !== id && t.parentId !== id);
  });
}

async function goToTrash() {
  fireEvent.click(screen.getByRole("link", { name: /trash/i }));
  await screen.findByRole("heading", { name: /trash/i });
}

async function goToHome() {
  fireEvent.click(screen.getByRole("link", { name: /home/i }));
  await screen.findByRole("heading", { name: /home/i });
}

beforeEach(() => {
  window.history.pushState({}, "", "/");
  vi.clearAllMocks();
  localStorage.setItem("dev-notice-acknowledged", "true");
});

it("deleting a task removes it from the home page", async () => {
  setupMocks([task1]);
  renderWithQuery(<App />);

  const el = await screen.findByText("Buy milk");
  const li = el.closest("li")!;
  fireEvent.click(within(li).getByRole("button", { name: /delete/i }));

  await waitFor(() => {
    expect(screen.queryByText("Buy milk")).not.toBeInTheDocument();
  });
});

it("deleted task appears on the trash page", async () => {
  setupMocks([task1]);
  renderWithQuery(<App />);

  const el = await screen.findByText("Buy milk");
  const li = el.closest("li")!;
  fireEvent.click(within(li).getByRole("button", { name: /delete/i }));
  await waitFor(() =>
    expect(screen.queryByText("Buy milk")).not.toBeInTheDocument(),
  );

  await goToTrash();
  expect(await screen.findByText("Buy milk")).toBeInTheDocument();
});

it("restoring a task removes it from the trash page", async () => {
  setupMocks([task1]);
  renderWithQuery(<App />);

  const el = await screen.findByText("Buy milk");
  const li = el.closest("li")!;
  fireEvent.click(within(li).getByRole("button", { name: /delete/i }));
  await waitFor(() =>
    expect(screen.queryByText("Buy milk")).not.toBeInTheDocument(),
  );

  await goToTrash();
  await screen.findByText("Buy milk");

  fireEvent.click(screen.getByRole("button", { name: /restore/i }));

  await waitFor(() => {
    expect(screen.queryByText("Buy milk")).not.toBeInTheDocument();
  });
});

it("restoring a task makes it reappear on the home page", async () => {
  setupMocks([task1]);
  renderWithQuery(<App />);

  const el = await screen.findByText("Buy milk");
  const li = el.closest("li")!;
  fireEvent.click(within(li).getByRole("button", { name: /delete/i }));
  await waitFor(() =>
    expect(screen.queryByText("Buy milk")).not.toBeInTheDocument(),
  );

  await goToTrash();
  await screen.findByText("Buy milk");
  fireEvent.click(screen.getByRole("button", { name: /restore/i }));
  await waitFor(() =>
    expect(screen.queryByText("Buy milk")).not.toBeInTheDocument(),
  );

  await goToHome();
  expect(
    await screen.findByText("Buy milk", undefined, { timeout: 3000 }),
  ).toBeInTheDocument();
});

it("permanently deleting a task removes it from the trash page", async () => {
  setupMocks([task1]);
  renderWithQuery(<App />);

  const el = await screen.findByText("Buy milk");
  const li = el.closest("li")!;
  fireEvent.click(within(li).getByRole("button", { name: /delete/i }));
  await waitFor(() =>
    expect(screen.queryByText("Buy milk")).not.toBeInTheDocument(),
  );

  await goToTrash();
  await screen.findByText("Buy milk");
  fireEvent.click(
    screen.getByRole("button", { name: /delete .+ permanently/i }),
  );

  await waitFor(() => {
    expect(screen.queryByText("Buy milk")).not.toBeInTheDocument();
  });
});

it("a deleted subtask whose parent is still active shows a subtask badge", async () => {
  setupMocks([parentTask, childTask]);
  renderWithQuery(<App />);

  await screen.findByText("Child Task");

  const childLi = screen.getByText("Child Task").closest("li")!;
  fireEvent.click(within(childLi).getByRole("button", { name: /delete/i }));
  await waitFor(() =>
    expect(screen.queryByText("Child Task")).not.toBeInTheDocument(),
  );

  await goToTrash();
  await screen.findByText("Child Task");

  expect(screen.getByText("subtask")).toBeInTheDocument();
});

it("deleting a parent also removes its subtask from the home page", async () => {
  setupMocks([parentTask, childTask]);
  renderWithQuery(<App />);

  await screen.findByText("Child Task");

  const parentLi = screen.getByText("Parent Task").closest("li")!;
  fireEvent.click(
    within(parentLi).getAllByRole("button", { name: /delete/i })[0],
  );

  await waitFor(() => {
    expect(screen.queryByText("Parent Task")).not.toBeInTheDocument();
    expect(screen.queryByText("Child Task")).not.toBeInTheDocument();
  });
});

it("a deleted subtask appears nested under its deleted parent in the trash", async () => {
  setupMocks([parentTask, childTask]);
  renderWithQuery(<App />);

  await screen.findByText("Child Task");

  const parentLi = screen.getByText("Parent Task").closest("li")!;
  fireEvent.click(
    within(parentLi).getAllByRole("button", { name: /delete/i })[0],
  );
  await waitFor(() =>
    expect(screen.queryByText("Parent Task")).not.toBeInTheDocument(),
  );

  await goToTrash();
  await screen.findByText("Parent Task");

  const parentTrashLi = screen.getByText("Parent Task").closest("li")!;
  expect(within(parentTrashLi).getByText("Child Task")).toBeInTheDocument();
});

it("restoring a parent from trash also restores its subtask", async () => {
  setupMocks([parentTask, childTask]);
  renderWithQuery(<App />);

  await screen.findByText("Child Task");

  const parentLi = screen.getByText("Parent Task").closest("li")!;
  fireEvent.click(
    within(parentLi).getAllByRole("button", { name: /delete/i })[0],
  );
  await waitFor(() =>
    expect(screen.queryByText("Parent Task")).not.toBeInTheDocument(),
  );

  await goToTrash();
  await screen.findByText("Parent Task");

  // Restore via the parent's restore button
  const parentTrashLi = screen.getByText("Parent Task").closest("li")!;
  fireEvent.click(
    within(parentTrashLi).getAllByRole("button", { name: /restore/i })[0],
  );
  await waitFor(() =>
    expect(screen.queryByText("Parent Task")).not.toBeInTheDocument(),
  );

  await goToHome();
  expect(
    await screen.findByText("Parent Task", undefined, { timeout: 3000 }),
  ).toBeInTheDocument();
  expect(screen.getByText("Child Task")).toBeInTheDocument();
});

it("restoring a subtask whose parent is also in trash restores the parent", async () => {
  setupMocks([parentTask, childTask]);
  renderWithQuery(<App />);

  await screen.findByText("Child Task");

  const parentLi = screen.getByText("Parent Task").closest("li")!;
  fireEvent.click(
    within(parentLi).getAllByRole("button", { name: /delete/i })[0],
  );
  await waitFor(() =>
    expect(screen.queryByText("Parent Task")).not.toBeInTheDocument(),
  );

  await goToTrash();
  await screen.findByText("Parent Task");

  // Restore via the child's own restore button (nested under parent row)
  const parentTrashLi = screen.getByText("Parent Task").closest("li")!;
  const childTrashLi = within(parentTrashLi)
    .getByText("Child Task")
    .closest("li")!;
  fireEvent.click(
    within(childTrashLi).getByRole("button", { name: /restore/i }),
  );
  await waitFor(() =>
    expect(screen.queryByText("Parent Task")).not.toBeInTheDocument(),
  );

  await goToHome();
  expect(
    await screen.findByText("Parent Task", undefined, { timeout: 3000 }),
  ).toBeInTheDocument();
  expect(screen.getByText("Child Task")).toBeInTheDocument();
});

it("a deleted subtask nested inside its parent has a blue left border accent", async () => {
  setupMocks([parentTask, childTask]);
  renderWithQuery(<App />);

  await screen.findByText("Child Task");

  const parentLi = screen.getByText("Parent Task").closest("li")!;
  fireEvent.click(
    within(parentLi).getAllByRole("button", { name: /delete/i })[0],
  );
  await waitFor(() =>
    expect(screen.queryByText("Parent Task")).not.toBeInTheDocument(),
  );

  await goToTrash();
  await screen.findByText("Child Task");

  const childContentDiv = screen
    .getByText("Child Task")
    .closest("li")!
    .querySelector(":scope > div")!;
  expect(childContentDiv.className).toContain("border-l-blue-400");
});

it("shows empty state when trash is empty", async () => {
  setupMocks([task1]);
  renderWithQuery(<App />);

  await screen.findByText("Buy milk");
  await goToTrash();

  expect(await screen.findByText(/trash is empty/i)).toBeInTheDocument();
});
