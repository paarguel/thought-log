import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WorksheetFlow } from "../worksheet-flow";
import { MarkedPassage } from "../review-step";
import { newWorksheet } from "@/lib/thought-log/types";

describe("WorksheetFlow", () => {
  it("opens on the Situation step with one primary action", async () => {
    render(<WorksheetFlow />);
    expect(await screen.findByText("What happened?")).toBeInTheDocument();
    const cta = screen.getByRole("button", { name: "Continue" });
    expect(cta).toBeDisabled();
  });

  it("advances situation → feelings → thoughts", async () => {
    const user = userEvent.setup();
    render(<WorksheetFlow />);
    const situation = await screen.findByLabelText("Describe the situation");
    await user.type(situation, "Boss emailed about a talk tomorrow");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("How did it feel?")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Anxious" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("Write it all out.")).toBeInTheDocument();
    const passage = screen.getByLabelText("Write your thoughts freely");
    await user.type(passage, "I am going to get fired. Everyone will know.");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("Circle the thoughts.")).toBeInTheDocument();
  });
});

describe("MarkedPassage render safety (R21)", () => {
  it("renders script-like worksheet input as inert text", () => {
    const w = newWorksheet("x");
    w.thoughtText = `<img src=x onerror="window.__pwned=true"> everything is ruined`;
    w.phrases = [
      { id: "p", start: 0, end: 10, text: "<img src=x", distortionIds: [] },
    ];
    const { container } = render(<MarkedPassage worksheet={w} />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toContain("<img src=x");
    expect((window as unknown as { __pwned?: boolean }).__pwned).toBeUndefined();
  });
});
