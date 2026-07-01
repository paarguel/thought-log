import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HistoryPage } from "../history-page";

describe("HistoryPage", () => {
  it("separates local and cloud history", async () => {
    render(<HistoryPage />);
    expect(await screen.findByRole("heading", { name: /on this device/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /cloud history/i })).toBeInTheDocument();
    expect(screen.getByText(/cloud history is not configured/i)).toBeInTheDocument();
  });
});
