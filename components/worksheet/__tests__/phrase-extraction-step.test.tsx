import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PhraseExtractionStep } from "../phrase-extraction-step";

describe("PhraseExtractionStep", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(document, "elementFromPoint");
  });

  it("marks words selected by dragging across passage tokens", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const thoughtText = "Everyone thinks I am weird. I always do this.";

    const { container } = render(<PhraseExtractionStep thoughtText={thoughtText} thoughts={[]} onChange={onChange} />);

    const passage = screen.getByLabelText("Thought passage for selection");
    const firstToken = container.querySelector('[data-token-index="0"]');
    const lastToken = container.querySelector('[data-token-index="4"]');

    expect(firstToken).not.toBeNull();
    expect(lastToken).not.toBeNull();

    Object.defineProperty(document, "elementFromPoint", {
      configurable: true,
      value: vi.fn(() => lastToken),
    });

    fireEvent.pointerDown(firstToken as Element, { pointerId: 1, clientX: 1, clientY: 1 });
    fireEvent.pointerMove(passage, { pointerId: 1, clientX: 40, clientY: 1 });
    fireEvent.pointerUp(passage, { pointerId: 1, clientX: 40, clientY: 1 });
    await user.click(screen.getByRole("button", { name: "Mark selection" }));

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({
        text: "Everyone thinks I am weird.",
        start: 0,
        end: 27,
        source: "manual",
      }),
    ]);
  });
});
