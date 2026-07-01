import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createEmptyThoughtLogDraft } from "@/lib/thought-log/types";
import { RationalThoughtStep } from "../rational-thought-step";

describe("RationalThoughtStep", () => {
  it("defaults to original text with a writing box below", () => {
    const draft = {
      ...createEmptyThoughtLogDraft(),
      thoughtText: "Everyone thinks I am weird.",
    };

    render(<RationalThoughtStep draft={draft} onModeChange={() => {}} onFullChange={() => {}} onResponsesChange={() => {}} />);

    expect(screen.getByRole("tab", { name: /original text/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Everyone thinks I am weird.")).toBeInTheDocument();
    expect(screen.getByLabelText("Response to original text")).toBeInTheDocument();
  });

  it("writes one-by-one responses for the active thought", () => {
    const onResponsesChange = vi.fn();
    const draft = {
      ...createEmptyThoughtLogDraft(),
      reviewModeLastUsed: "one" as const,
      extractedThoughts: [
        { id: "one", text: "Everyone thinks I am weird.", start: 0, end: 27, source: "auto" as const },
        { id: "two", text: "I always mess this up.", start: 28, end: 50, source: "auto" as const },
      ],
      labelAssignments: [{ thoughtId: "one", distortionIds: ["mind-reading" as const] }],
    };

    render(<RationalThoughtStep draft={draft} onModeChange={() => {}} onFullChange={() => {}} onResponsesChange={onResponsesChange} />);

    expect(screen.getByRole("heading", { name: "Everyone thinks I am weird." })).toBeInTheDocument();
    expect(screen.getByText("Mind reading")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Response to this thought"), { target: { value: "I do not know what people think." } });

    expect(onResponsesChange).toHaveBeenLastCalledWith([{ thoughtId: "one", text: "I do not know what people think." }]);
  });
});
