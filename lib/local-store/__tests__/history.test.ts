import { describe, expect, it } from "vitest";
import { dayLabel, groupByDay, matchesSearch } from "../history";
import { newCheckIn } from "@/lib/check-in/types";
import { newWorksheet } from "@/lib/thought-log/types";

const NOW = new Date(2026, 10, 20, 15, 0); // Nov 20, 2026, local time
const at = (day: number, hour: number) => new Date(2026, 10, day, hour).toISOString();

describe("dayLabel", () => {
  it("names today and yesterday, and dates the rest", () => {
    expect(dayLabel(at(20, 9), NOW)).toBe("Today");
    expect(dayLabel(at(19, 23), NOW)).toBe("Yesterday");
    expect(dayLabel(at(16, 9), NOW)).toMatch(/16/);
    expect(dayLabel(new Date(2025, 10, 16).toISOString(), NOW)).toMatch(/2025/);
  });
});

describe("groupByDay", () => {
  it("orders by when an entry was written, not when it was last edited", () => {
    const early = newCheckIn("early");
    early.createdAt = at(20, 8);
    early.updatedAt = at(20, 14); // edited later the same day
    const late = newWorksheet("late");
    late.createdAt = at(20, 11);
    const old = newWorksheet("old");
    old.createdAt = at(18, 11);

    const groups = groupByDay([old, early, late], NOW);
    expect(groups.map((g) => g.label)[0]).toBe("Today");
    expect(groups[0].entries.map((e) => e.id)).toEqual(["late", "early"]);
    expect(groups[1].entries.map((e) => e.id)).toEqual(["old"]);
  });
});

describe("matchesSearch", () => {
  it("finds a thought or a feeling by any word in it, in any order", () => {
    const w = newWorksheet("w");
    w.situation = "Boss emailed about tomorrow";
    w.thoughtText = "I am going to get fired";
    const c = newCheckIn("c");
    c.emotions = ["Overwhelmed"];
    c.needText = "a quiet evening";

    expect(matchesSearch(w, "fired boss")).toBe(true);
    expect(matchesSearch(w, "overwhelmed")).toBe(false);
    expect(matchesSearch(c, "QUIET")).toBe(true);
    expect(matchesSearch(c, "  ")).toBe(true);
  });
});
