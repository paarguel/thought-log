import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PhraseExtractionStep } from "../phrase-extraction-step";

describe("PhraseExtractionStep", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("marks a passage selection even when tapping the button clears the live browser selection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const thoughtText = "Everyone thinks I am weird. I always do this.";

    render(<PhraseExtractionStep thoughtText={thoughtText} thoughts={[]} onChange={onChange} />);

    const passage = screen.getByLabelText("Thought passage for selection");
    const selectedRange = { commonAncestorContainer: passage.firstChild as Node } as Range;
    const activeSelection = {
      toString: () => "Everyone thinks I am weird",
      rangeCount: 1,
      getRangeAt: () => selectedRange,
      removeAllRanges: vi.fn(),
    } as unknown as Selection;
    const clearedSelection = {
      toString: () => "",
      rangeCount: 0,
      removeAllRanges: vi.fn(),
    } as unknown as Selection;
    const getSelection = vi.spyOn(window, "getSelection");

    getSelection.mockReturnValue(activeSelection);
    fireEvent.mouseUp(passage);
    getSelection.mockReturnValue(clearedSelection);
    await user.click(screen.getByRole("button", { name: "Mark selection" }));

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({
        text: "Everyone thinks I am weird",
        start: 0,
        end: 26,
        source: "manual",
      }),
    ]);
  });
});
