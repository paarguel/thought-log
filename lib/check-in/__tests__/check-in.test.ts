import { describe, expect, it } from "vitest";
import {
  checkInHasContent,
  checkInTitle,
  isCheckIn,
  MAX_EMOTIONS,
  newCheckIn,
  toggleEmotion,
} from "../types";
import { reflectionLines, reflectionText, REFLECTION_CLOSING } from "../reflection";
import { newWorksheet } from "@/lib/thought-log/types";

describe("toggleEmotion", () => {
  it("adds and removes a word", () => {
    expect(toggleEmotion([], "Sad")).toEqual(["Sad"]);
    expect(toggleEmotion(["Sad"], "sad")).toEqual([]);
  });

  it("never holds more than three, and does not swap one out", () => {
    const three = ["Sad", "Hurt", "Numb"];
    expect(three).toHaveLength(MAX_EMOTIONS);
    expect(toggleEmotion(three, "Angry")).toEqual(three);
    expect(toggleEmotion(three, "Hurt")).toEqual(["Sad", "Numb"]);
  });
});

describe("isCheckIn", () => {
  it("tells a check-in from a worksheet saved before check-ins existed", () => {
    expect(isCheckIn(newCheckIn("c"))).toBe(true);
    expect(isCheckIn(newWorksheet("w"))).toBe(false);
  });
});

describe("reflection", () => {
  it("reads a full check-in back in plain sentences", () => {
    const c = newCheckIn("c");
    c.situation = "I opened my work laptop";
    c.emotions = ["Anxious", "Overwhelmed"];
    c.sensations = ["Tight shoulders", "Restlessness"];
    c.sensationText = "My jaw is clenched.";
    c.needs = ["Rest", "Space"];
    expect(reflectionLines(c)).toEqual([
      "Something happened: I opened my work laptop.",
      "I might be feeling anxious and overwhelmed.",
      "I notice tight shoulders, restlessness and my jaw is clenched.",
      "I might need rest and space.",
      REFLECTION_CLOSING,
    ]);
  });

  it("leaves out whatever was skipped", () => {
    const c = newCheckIn("c");
    c.emotions = ["Unsure"];
    expect(reflectionLines(c)).toEqual(["I might be feeling unsure.", REFLECTION_CLOSING]);
  });

  it("treats an empty check-in as a complete one", () => {
    const c = newCheckIn("c");
    expect(checkInHasContent(c)).toBe(false);
    expect(reflectionText(c)).toBe(`I stopped to notice.\n${REFLECTION_CLOSING}`);
    expect(checkInTitle(c)).toBe("Check-in");
  });

  it("lets 'Not sure' stand as an answer about needs", () => {
    const c = newCheckIn("c");
    c.needs = ["Not sure"];
    expect(reflectionLines(c)[0]).toBe("I'm not sure what I need.");
    c.needs = ["Rest", "Not sure"];
    expect(reflectionLines(c)[0]).toBe("I might need rest, though I'm not sure.");
  });

  it("keeps 'I' and existing punctuation as typed", () => {
    const c = newCheckIn("c");
    c.situation = "Why did that bother me?";
    c.needText = "I want a quiet evening";
    expect(reflectionLines(c)).toEqual([
      "Something happened: Why did that bother me?",
      "I might need I want a quiet evening.",
      REFLECTION_CLOSING,
    ]);
  });
});
