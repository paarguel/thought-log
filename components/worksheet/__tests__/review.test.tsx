import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { createEmptyThoughtLogDraft } from "@/lib/thought-log/types";
import { ReviewStep } from "../review-step";

describe("ReviewStep", () => {
  it("defaults to original text", () => {
    const draft = {
      ...createEmptyThoughtLogDraft(),
      thoughtText: "Everyone thinks I am weird.",
    };
    render(<ReviewStep draft={draft} onModeChange={() => {}} />);
    expect(screen.getByRole("tab", { name: /original text/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Everyone thinks I am weird.")).toBeInTheDocument();
  });

  it("advances through one-by-one review", async () => {
    const user = userEvent.setup();
    const draft = {
      ...createEmptyThoughtLogDraft(),
      reviewModeLastUsed: "one" as const,
      extractedThoughts: [
        { id: "one", text: "Everyone thinks I am weird.", start: 0, end: 27, source: "auto" as const },
        { id: "two", text: "I always mess this up.", start: 28, end: 50, source: "auto" as const },
      ],
    };

    render(<ReviewStep draft={draft} onModeChange={() => {}} />);
    expect(screen.getByRole("heading", { name: "Everyone thinks I am weird." })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("heading", { name: "I always mess this up." })).toBeInTheDocument();
  });
});
