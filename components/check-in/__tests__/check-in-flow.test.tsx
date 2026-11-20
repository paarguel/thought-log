import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Capture } from "@/components/app/capture";
import { CheckInFlow } from "../check-in-flow";
import { isCheckIn, newCheckIn, type EmotionCheckIn } from "@/lib/check-in/types";
import {
  clearAllLocalData,
  listLocalEntries,
  loadDraft,
  saveLocalEntry,
} from "@/lib/local-store/indexed-db";
import { newWorksheet } from "@/lib/thought-log/types";

beforeEach(async () => {
  await clearAllLocalData();
  localStorage.clear();
});

async function savedCheckIns(): Promise<EmotionCheckIn[]> {
  return (await listLocalEntries()).filter(isCheckIn);
}

describe("first screen", () => {
  it("still opens straight onto a thought", async () => {
    render(<Capture />);
    expect(await screen.findByLabelText("Describe the situation")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "A thought" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("switches to a feeling in one tap and carries the situation across", async () => {
    const user = userEvent.setup();
    render(<Capture />);
    await user.type(await screen.findByLabelText("Describe the situation"), "Kids were loud");
    await user.click(screen.getByRole("button", { name: "A feeling" }));

    expect(await screen.findByLabelText("Describe what happened")).toHaveValue("Kids were loud");
    // The text moved; it is not also left behind as an unfinished thought.
    expect(await loadDraft()).toBeUndefined();

    await user.click(screen.getByRole("button", { name: "A thought" }));
    expect(await screen.findByLabelText("Describe the situation")).toHaveValue("Kids were loud");
  });
});

describe("CheckInFlow", () => {
  it("saves a check-in with nothing answered", async () => {
    const user = userEvent.setup();
    render(<CheckInFlow />);
    for (let i = 0; i < 4; i++) {
      await user.click(await screen.findByRole("button", { name: "Skip" }));
    }
    expect(await screen.findByText("I stopped to notice.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Save to Thought Record" }));
    expect(await screen.findByText("Saved.")).toBeInTheDocument();
    expect(await savedCheckIns()).toHaveLength(1);
  });

  it("keeps the selections and text, not just the reflection", async () => {
    const user = userEvent.setup();
    render(<CheckInFlow />);
    await user.type(await screen.findByLabelText("Describe what happened"), "Opened my laptop");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    await user.click(await screen.findByRole("button", { name: "Anxious" }));
    await user.click(screen.getByRole("button", { name: "Unsure" }));
    await user.click(screen.getByRole("button", { name: "Numb" }));
    // A fourth is not taken, and nothing already picked is pushed out.
    await user.click(screen.getByRole("button", { name: "Sad" }));
    expect(screen.getByRole("button", { name: "Sad" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("That's three. Tap one to take it off.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Continue" }));

    await user.click(await screen.findByRole("button", { name: "Tight shoulders" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(await screen.findByRole("button", { name: "Rest" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(
      await screen.findByText("I might be feeling anxious, unsure and numb.")
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Save to Thought Record" }));
    await screen.findByText("Saved.");

    const [saved] = await savedCheckIns();
    expect(saved).toMatchObject({
      kind: "check-in",
      situation: "Opened my laptop",
      emotions: ["Anxious", "Unsure", "Numb"],
      sensations: ["Tight shoulders"],
      needs: ["Rest"],
    });
    expect(saved.intensity).toBeUndefined();
  });

  it("reopens a saved check-in, changes it, and keeps its original date", async () => {
    const original = newCheckIn("saved-1");
    original.createdAt = "2026-11-01T09:00:00.000Z";
    original.updatedAt = "2026-11-01T09:00:00.000Z";
    original.emotions = ["Sad"];
    await saveLocalEntry(original);
    await saveLocalEntry(newWorksheet("worksheet-1"));

    const onSaved = vi.fn();
    const user = userEvent.setup();
    render(<CheckInFlow editing={original} onSaved={onSaved} />);

    expect(await screen.findByText("I might be feeling sad.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Edit check-in" }));
    await user.click(await screen.findByRole("button", { name: "Skip" }));
    await user.click(await screen.findByRole("button", { name: "Relieved" }));
    for (const _ of [0, 1, 2]) {
      void _;
      await user.click(screen.getByRole("button", { name: /Continue|Skip/ }));
    }
    await user.click(await screen.findByRole("button", { name: "Save changes" }));

    expect(onSaved).toHaveBeenCalled();
    const all = await listLocalEntries();
    expect(all).toHaveLength(2); // edited in place; the worksheet is untouched
    const [saved] = all.filter(isCheckIn);
    expect(saved.emotions).toEqual(["Sad", "Relieved"]);
    expect(saved.createdAt).toBe("2026-11-01T09:00:00.000Z");
    expect(saved.updatedAt > saved.createdAt).toBe(true);
  });
});
