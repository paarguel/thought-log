import { describe, expect, it } from "vitest";
import { segmentAt, segmentPassage } from "../segmenter";

describe("segmentPassage", () => {
  it("returns nothing for empty input", () => {
    expect(segmentPassage("")).toEqual([]);
    expect(segmentPassage("   \n ")).toEqual([]);
  });

  it("splits on sentence boundaries", () => {
    const text = "I always mess things up. Nobody will ever trust me again!";
    const segments = segmentPassage(text);
    expect(segments.map((s) => s.text)).toEqual([
      "I always mess things up.",
      "Nobody will ever trust me again!",
    ]);
  });

  it("offsets map back into the original text", () => {
    const text = "First bad thought here. Second bad thought there.";
    for (const s of segmentPassage(text)) {
      expect(text.slice(s.start, s.end)).toBe(s.text);
    }
  });

  it("splits on line breaks", () => {
    const text = "everything is falling apart\nno one actually cares about me";
    const segments = segmentPassage(text);
    expect(segments).toHaveLength(2);
  });

  it("splits long sentences on conjunctions", () => {
    const text =
      "I keep thinking that the meeting went terribly and everyone noticed every single mistake I made, but maybe I am the only one who even remembers it happened at all.";
    const segments = segmentPassage(text);
    expect(segments.length).toBeGreaterThan(1);
  });

  it("drops fragments that are too short to be thoughts", () => {
    const text = "No. I will definitely lose my job over this.";
    const segments = segmentPassage(text);
    expect(segments.map((s) => s.text)).toEqual([
      "I will definitely lose my job over this.",
    ]);
  });

  it("segmentAt returns the sentence containing an offset", () => {
    const text = "I ruined everything today. They must hate me now.";
    const seg = segmentAt(text, text.indexOf("must"));
    expect(seg?.text).toBe("They must hate me now.");
    expect(segmentAt(text, 3)?.text).toBe("I ruined everything today.");
  });

  it("segmentAt returns null outside any segment", () => {
    expect(segmentAt("", 0)).toBeNull();
    expect(segmentAt("Too short.", 2)).toBeNull(); // dropped as fragment
  });

  it("is deterministic", () => {
    const text = "I ruined it. They hate me now. Nothing works out for me.";
    expect(segmentPassage(text)).toEqual(segmentPassage(text));
  });
});
