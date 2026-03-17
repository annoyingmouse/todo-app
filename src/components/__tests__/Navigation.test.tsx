import { vi } from "vitest";

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

import { screen, fireEvent } from "@testing-library/react";
import { renderWithQuery } from "./testUtils";
import App from "../../App";

it("renders the About page when the About link is clicked", async () => {
  renderWithQuery(<App />);

  fireEvent.click(screen.getByRole("link", { name: /about/i }));

  expect(
    await screen.findByRole("heading", { name: /about/i }),
  ).toBeInTheDocument();
  expect(screen.getByText(/no backend required/i)).toBeInTheDocument();
});

it("renders the Data page when the Data link is clicked", async () => {
  renderWithQuery(<App />);

  fireEvent.click(screen.getByRole("link", { name: /data/i }));

  expect(
    await screen.findByRole("heading", { name: /^data$/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: /export/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: /import/i }),
  ).toBeInTheDocument();
});

it("renders the ER diagram on the About page", async () => {
  renderWithQuery(<App />);

  fireEvent.click(screen.getByRole("link", { name: /about/i }));
  await screen.findByRole("heading", { name: /about/i });

  expect(screen.getByText(/data model/i)).toBeInTheDocument();
  expect(
    screen.getByRole("img", { name: /entity.relationship diagram/i }),
  ).toBeInTheDocument();
});

it("renders the Home page when the Home link is clicked", async () => {
  renderWithQuery(<App />);

  fireEvent.click(screen.getByRole("link", { name: /about/i }));
  await screen.findByRole("heading", { name: /about/i });

  fireEvent.click(screen.getByRole("link", { name: /home/i }));

  expect(
    await screen.findByRole("heading", { name: /home/i }),
  ).toBeInTheDocument();
});
