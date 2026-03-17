import { vi, beforeEach } from "vitest";

vi.mock("../../sql/db-client", () => ({
  taskApi: {
    getAll: vi.fn(async () => []),
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getDeleted: vi.fn(async () => []),
    restore: vi.fn(async () => {}),
    permanentDelete: vi.fn(async () => {}),
    exportAll: vi.fn(async () => []),
    importAll: vi.fn(async () => {}),
  },
}));

import { taskApi } from "../../sql/db-client";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithQuery } from "./testUtils";
import App from "../../App";
import type { Task } from "../../types/Task";

const SAMPLE_TASKS: Task[] = [
  {
    id: 1,
    title: "Buy milk",
    description: "",
    completed: 0,
    dateCompleted: null,
    parentId: null,
    deletedAt: null,
  },
  {
    id: 2,
    title: "Buy eggs",
    description: "",
    completed: 0,
    dateCompleted: null,
    parentId: null,
    deletedAt: null,
  },
];

global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
global.URL.revokeObjectURL = vi.fn();

async function goToData() {
  fireEvent.click(screen.getByRole("link", { name: /data/i }));
  await screen.findByRole("heading", { name: /^data$/i });
}

function uploadFile(content: string, filename = "tasks.json") {
  const file = new File([content], filename, { type: "application/json" });
  const input = document.querySelector("input[type='file']")!;
  fireEvent.change(input, { target: { files: [file] } });
}

beforeEach(() => {
  window.history.pushState({}, "", "/");
  vi.clearAllMocks();
  vi.mocked(URL.createObjectURL).mockReturnValue("blob:mock-url");
});

it("shows Export and Import sections on the Data page", async () => {
  renderWithQuery(<App />);
  await goToData();

  expect(screen.getByRole("heading", { name: /export/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /import/i })).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /export database/i }),
  ).toBeInTheDocument();
  expect(document.querySelector("input[type='file']")).toBeInTheDocument();
});

it("clicking Export calls taskApi.exportAll and creates a download Blob", async () => {
  vi.mocked(taskApi.exportAll).mockResolvedValue(SAMPLE_TASKS);

  renderWithQuery(<App />);
  await goToData();

  fireEvent.click(screen.getByRole("button", { name: /export database/i }));

  await waitFor(() => expect(taskApi.exportAll).toHaveBeenCalled());
  expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
  expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
});

it("selecting a valid JSON file shows the import preview with task count", async () => {
  renderWithQuery(<App />);
  await goToData();

  uploadFile(JSON.stringify(SAMPLE_TASKS));

  expect(
    await screen.findByText(/ready to import 2 tasks\./i),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /confirm import/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /cancel/i }),
  ).toBeInTheDocument();
});

it("shows singular 'task' when importing exactly one task", async () => {
  renderWithQuery(<App />);
  await goToData();

  uploadFile(JSON.stringify([SAMPLE_TASKS[0]]));

  expect(
    await screen.findByText(/ready to import 1 task\./i),
  ).toBeInTheDocument();
});

it("selecting a file with invalid JSON shows an error", async () => {
  renderWithQuery(<App />);
  await goToData();

  uploadFile("not valid json {{ at all");

  expect(await screen.findByText(/invalid json/i)).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /confirm import/i }),
  ).not.toBeInTheDocument();
});

it("selecting a file whose JSON is not an array shows an error", async () => {
  renderWithQuery(<App />);
  await goToData();

  uploadFile('{"not": "an array"}');

  expect(
    await screen.findByText(/expected an array of tasks/i),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /confirm import/i }),
  ).not.toBeInTheDocument();
});

it("confirming import calls taskApi.importAll with the parsed tasks", async () => {
  renderWithQuery(<App />);
  await goToData();

  uploadFile(JSON.stringify(SAMPLE_TASKS));
  await screen.findByText(/ready to import 2 tasks\./i);

  fireEvent.click(screen.getByRole("button", { name: /confirm import/i }));

  await waitFor(() =>
    expect(taskApi.importAll).toHaveBeenCalledWith(SAMPLE_TASKS),
  );
});

it("confirming import clears the preview", async () => {
  renderWithQuery(<App />);
  await goToData();

  uploadFile(JSON.stringify(SAMPLE_TASKS));
  await screen.findByText(/ready to import 2 tasks\./i);

  fireEvent.click(screen.getByRole("button", { name: /confirm import/i }));

  await waitFor(() =>
    expect(screen.queryByText(/ready to import/i)).not.toBeInTheDocument(),
  );
});

it("cancelling import clears the preview without calling importAll", async () => {
  renderWithQuery(<App />);
  await goToData();

  uploadFile(JSON.stringify(SAMPLE_TASKS));
  await screen.findByText(/ready to import 2 tasks\./i);

  fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

  await waitFor(() =>
    expect(screen.queryByText(/ready to import/i)).not.toBeInTheDocument(),
  );
  expect(taskApi.importAll).not.toHaveBeenCalled();
});

it("uploading a second file after an error replaces the error with a preview", async () => {
  renderWithQuery(<App />);
  await goToData();

  uploadFile("invalid json");
  await screen.findByText(/invalid json/i);

  uploadFile(JSON.stringify([SAMPLE_TASKS[0]]));

  expect(
    await screen.findByText(/ready to import 1 task\./i),
  ).toBeInTheDocument();
  expect(screen.queryByText(/invalid json/i)).not.toBeInTheDocument();
});
