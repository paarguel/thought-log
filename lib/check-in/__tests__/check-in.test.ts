import { describe, expect, it } from "vitest";
import {
  checkInHasContent,
  checkInTitle,
  isCheckIn,
  MAX_EMOTIONS,
  newCheckIn,
  toggleEmotion,
} from "../types";
import { reflectionRows, reflectionText, REFLECTION_CLOSING, rowIsBlank } from "../reflection";
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
  it("reads a full check-in back as four labeled sections", () => {
    const c = newCheckIn("c");
    c.situation = "I opened my work laptop";
    c.emotions = ["Anxious", "Overwhelmed"];
    c.intensity = 7;
    c.sensations = ["Tight shoulders"];
    c.sensationText = "My jaw is clenched.";
    c.needs = ["Rest", "Not sure"];
    expect(reflectionRows(c).map((r) => r.label)).toEqual([
      "What happened",
      "I might be feeling",
      "I notice",
      "I might need",
    ]);
    expect(reflectionText(c)).toBe(
      [
        "What happened: I opened my work laptop",
        "I might be feeling: Anxious, Overwhelmed, Strength 7 of 10",
        "I notice: Tight shoulders, My jaw is clenched.",
        "I might need: Rest, Not sure",
        "",
        REFLECTION_CLOSING,
      ].join("\n")
    );
  });

  it("leaves skipped sections out of the copied text, word for word otherwise", () => {
    const c = newCheckIn("c");
    c.emotions = ["Unsure"];
    expect(reflectionText(c)).toBe(`I might be feeling: Unsure\n\n${REFLECTION_CLOSING}`);
    expect(reflectionRows(c).filter(rowIsBlank).map((r) => r.section)).toEqual([
      "happened",
      "body",
      "need",
    ]);
  });

  it("treats an empty check-in as a complete one", () => {
    const c = newCheckIn("c");
    expect(checkInHasContent(c)).toBe(false);
    expect(reflectionText(c)).toBe(REFLECTION_CLOSING);
    expect(checkInTitle(c)).toBe("Check-in");
  });
});
