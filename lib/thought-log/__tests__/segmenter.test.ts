import { describe, expect, it } from "vitest";
import { segmentThoughts } from "../segmenter";

describe("segmentThoughts", () => {
  it("suggests deterministic thought phrases from punctuation and cues", () => {
    const result = segmentThoughts("Everyone thinks I am weird. I always mess this up. Maybe I should leave.");
    expect(result.map((item) => item.text)).toEqual([
      "Everyone thinks I am weird.",
      "I always mess this up.",
      "Maybe I should leave.",
    ]);
    expect(result.every((item) => item.source === "auto")).toBe(true);
  });

  it("returns no suggestions for blank text", () => {
    expect(segmentThoughts("   ")).toEqual([]);
  });
});
