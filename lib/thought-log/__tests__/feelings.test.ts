import { describe, expect, it } from "vitest";
import { feelingFamilies } from "../feelings";

describe("feelingFamilies", () => {
  it("collapses words to their family and dedupes", () => {
    const families = feelingFamilies([
      { name: "Worried" },
      { name: "Panicked" },
      { name: "Hopeless" },
    ]);
    expect(families).toEqual(["Anxious", "Sad"]);
  });

  it("keeps custom feelings as-is and matches case-insensitively", () => {
    const families = feelingFamilies([
      { name: "  overwhelmed " },
      { name: "Restless" },
    ]);
    expect(families).toEqual(["Anxious", "Restless"]);
  });

  it("returns empty for no feelings", () => {
    expect(feelingFamilies([])).toEqual([]);
  });
});
