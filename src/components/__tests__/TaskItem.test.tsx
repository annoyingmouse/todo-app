import { renderWithQuery } from "./testUtils.tsx";
import App from "../../App";
import { screen, fireEvent, waitFor, within } from "@testing-library/react";

it("removes a task when delete is clicked", async () => {
  renderWithQuery(<App />);

  // Wait for tasks to load
  const taskItem = await screen.findByText("Learn Testing");

  const listItem = taskItem.closest("li")!;
  const deleteButton = within(listItem).getByRole("button", {
    name: /delete/i,
  });

  fireEvent.click(deleteButton);

  await waitFor(() => {
    expect(screen.queryByText("Learn Testing")).not.toBeInTheDocument();
  });
});
