import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PhraseExtractionStep } from "../phrase-extraction-step";

describe("PhraseExtractionStep", () => {
  it("marks a phrase by tapping its first and last word", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const thoughtText = "Everyone thinks I am weird. I always do this.";

    const { container } = render(<PhraseExtractionStep thoughtText={thoughtText} thoughts={[]} onChange={onChange} />);

    const firstToken = container.querySelector('[data-token-index="0"]');
    const lastToken = container.querySelector('[data-token-index="4"]');

    expect(firstToken).not.toBeNull();
    expect(lastToken).not.toBeNull();

    await user.click(firstToken as Element);
    await user.click(lastToken as Element);
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

  it("keeps Mark selection disabled until a word is tapped", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const thoughtText = "Everyone thinks I am weird.";

    const { container } = render(<PhraseExtractionStep thoughtText={thoughtText} thoughts={[]} onChange={onChange} />);

    expect(screen.getByRole("button", { name: "Mark selection" })).toBeDisabled();

    await user.click(container.querySelector('[data-token-index="0"]') as Element);

    expect(screen.getByRole("button", { name: "Mark selection" })).toBeEnabled();
  });
});
