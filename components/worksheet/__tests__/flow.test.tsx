import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ThoughtLogApp } from "../thought-log-app";

describe("ThoughtLogApp", () => {
  it("opens at the situation step", () => {
    render(<ThoughtLogApp />);
    expect(screen.getByRole("heading", { name: /what happened/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/situation/i)).toBeInTheDocument();
  });

  it("blocks Continue until the situation has content", async () => {
    const user = userEvent.setup();
    render(<ThoughtLogApp />);

    expect(screen.getByRole("button", { name: /continue/i })).toBeDisabled();

    await user.type(screen.getByLabelText(/situation/i), "My manager did not reply.");

    expect(screen.getByRole("button", { name: /continue/i })).toBeEnabled();
  });

  it("keeps thought capture as one passage before extraction", async () => {
    const user = userEvent.setup();
    render(<ThoughtLogApp />);

    await user.type(screen.getByLabelText(/situation/i), "My manager did not reply.");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await user.click(screen.getByRole("button", { name: "Anxious" }));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(screen.getByRole("heading", { name: /write the whole thought loop/i })).toBeInTheDocument();
  });
});
