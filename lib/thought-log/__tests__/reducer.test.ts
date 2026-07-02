import { describe, expect, it } from "vitest";
import {
  flowReducer,
  initialFlowState,
  nextStep,
  overlapsExisting,
  type FlowState,
} from "../reducer";

function withThought(text: string): FlowState {
  const s = initialFlowState();
  return flowReducer(s, { type: "setThoughtText", value: text });
}

describe("flowReducer", () => {
  it("adds a phrase from a valid range", () => {
    const s = withThought("I always fail at everything");
    const next = flowReducer(s, { type: "addPhrase", start: 0, end: 13 });
    expect(next.worksheet.phrases).toHaveLength(1);
    expect(next.worksheet.phrases[0].text).toBe("I always fail");
  });

  it("rejects overlapping phrases", () => {
    let s = withThought("I always fail at everything");
    s = flowReducer(s, { type: "addPhrase", start: 0, end: 13 });
    const next = flowReducer(s, { type: "addPhrase", start: 5, end: 20 });
    expect(next.worksheet.phrases).toHaveLength(1);
  });

  it("undo restores the previous phrase set", () => {
    let s = withThought("I always fail at everything");
    s = flowReducer(s, { type: "addPhrase", start: 0, end: 13 });
    s = flowReducer(s, { type: "addPhrase", start: 14, end: 27 });
    expect(s.worksheet.phrases).toHaveLength(2);
    s = flowReducer(s, { type: "undoPhrase" });
    expect(s.worksheet.phrases).toHaveLength(1);
  });

  it("auto phrases replace manual ones but stay undoable", () => {
    let s = withThought("First thought here. Second thought there.");
    s = flowReducer(s, { type: "addPhrase", start: 0, end: 5 });
    s = flowReducer(s, {
      type: "setAutoPhrases",
      phrases: [
        { start: 0, end: 19 },
        { start: 20, end: 41 },
      ],
    });
    expect(s.worksheet.phrases).toHaveLength(2);
    expect(s.worksheet.phrases.every((p) => p.auto)).toBe(true);
    s = flowReducer(s, { type: "undoPhrase" });
    expect(s.worksheet.phrases).toHaveLength(1);
    expect(s.worksheet.phrases[0].text).toBe("First");
  });

  it("editing the passage clears phrase marks (offsets invalid)", () => {
    let s = withThought("I always fail");
    s = flowReducer(s, { type: "addPhrase", start: 0, end: 13 });
    s = flowReducer(s, { type: "setThoughtText", value: "I always fail." });
    expect(s.worksheet.phrases).toHaveLength(0);
  });

  it("toggles distortion labels per phrase", () => {
    let s = withThought("I always fail");
    s = flowReducer(s, { type: "addPhrase", start: 0, end: 13 });
    const id = s.worksheet.phrases[0].id;
    s = flowReducer(s, { type: "toggleDistortion", phraseId: id, distortionId: "all-or-nothing" });
    expect(s.worksheet.phrases[0].distortionIds).toEqual(["all-or-nothing"]);
    s = flowReducer(s, { type: "toggleDistortion", phraseId: id, distortionId: "all-or-nothing" });
    expect(s.worksheet.phrases[0].distortionIds).toEqual([]);
  });

  it("skips label and review steps when no phrases are marked", () => {
    const s = withThought("some thoughts");
    expect(nextStep("circle", s.worksheet)).toBe("rational");
    const marked = flowReducer(s, { type: "addPhrase", start: 0, end: 13 });
    expect(nextStep("circle", marked.worksheet)).toBe("label");
  });

  it("toggleFeeling adds then removes", () => {
    let s = initialFlowState();
    s = flowReducer(s, { type: "toggleFeeling", name: "Anxious" });
    expect(s.worksheet.feelings.map((f) => f.name)).toEqual(["Anxious"]);
    s = flowReducer(s, { type: "toggleFeeling", name: "Anxious" });
    expect(s.worksheet.feelings).toEqual([]);
  });
});

describe("overlapsExisting", () => {
  it("detects overlap", () => {
    const phrases = [
      { id: "a", start: 5, end: 10, text: "", distortionIds: [] },
    ];
    expect(overlapsExisting(phrases, { start: 8, end: 12 })).toBe(true);
    expect(overlapsExisting(phrases, { start: 10, end: 12 })).toBe(false);
  });
});
