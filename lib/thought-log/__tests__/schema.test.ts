import { describe, expect, it } from "vitest";
import { finalizeDraft, createEmptyThoughtLogDraft } from "../types";
import { thoughtLogEntrySchema } from "../schema";

describe("thoughtLogEntrySchema", () => {
  it("validates a finalized empty worksheet", () => {
    const entry = finalizeDraft(createEmptyThoughtLogDraft());
    expect(thoughtLogEntrySchema.parse(entry).schemaVersion).toBe(2);
    expect(thoughtLogEntrySchema.parse(entry).rationalResponses).toEqual([]);
  });

  it("rejects invalid distortion ids", () => {
    const entry = finalizeDraft({
      ...createEmptyThoughtLogDraft(),
      labelAssignments: [{ thoughtId: "t1", distortionIds: ["made-up"] as never }],
    });
    expect(() => thoughtLogEntrySchema.parse(entry)).toThrow();
  });
});
