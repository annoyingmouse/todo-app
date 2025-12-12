import { screen, fireEvent } from "@testing-library/react";
import { renderWithQuery } from "./testUtils.tsx";
import App from "../../App";

it("adds a new task to the list when submitted", async () => {
  renderWithQuery(<App />);

  // Wait for Suspense to resolve AND for the homepage to render
  await screen.findByRole("heading", { name: /home/i });
  // Or any text guaranteed to be on the home page

  const input = await screen.findByPlaceholderText(/enter new task/i);
  fireEvent.change(input, { target: { value: "Test Task" } });

  fireEvent.click(screen.getByRole("button", { name: /add/i }));

  expect(await screen.findByText("Test Task")).toBeInTheDocument();
});
