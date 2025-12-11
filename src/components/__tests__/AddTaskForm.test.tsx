import { screen, fireEvent } from "@testing-library/react";
import { renderWithQuery } from "./testUtils.tsx";
import App from "../../App";

it("adds a new task to the list when submitted", async () => {
  renderWithQuery(<App />);

  const input = screen.getByPlaceholderText(/enter new task/i);
  fireEvent.change(input, { target: { value: "Test Task" } });

  fireEvent.click(screen.getByRole("button"));

  expect(await screen.findByText("Test Task")).toBeInTheDocument();
});
