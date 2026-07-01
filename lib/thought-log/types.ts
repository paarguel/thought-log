export type DistortionId =
  | "all-or-nothing"
  | "mind-reading"
  | "fortune-telling"
  | "labeling"
  | "catastrophizing"
  | "emotional-reasoning"
  | "should-statements"
  | "mental-filter"
  | "discounting-positive"
  | "overgeneralization";

export type ExtractedThought = {
  id: string;
  text: string;
  start: number;
  end: number;
  source: "manual" | "auto";
};

export type LabelAssignment = {
  thoughtId: string;
  distortionIds: DistortionId[];
};

export type RationalResponse = {
  thoughtId: string;
  text: string;
};

export type ReviewMode = "original" | "all" | "one";

export type ThoughtLogEntry = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  situation: string;
  feelings: string[];
  thoughtText: string;
  extractedThoughts: ExtractedThought[];
  labelAssignments: LabelAssignment[];
  rationalThought: string;
  rationalResponses: RationalResponse[];
  reviewModeLastUsed: ReviewMode;
  schemaVersion: 1 | 2;
};

export type ThoughtLogDraft = Omit<ThoughtLogEntry, "createdAt" | "updatedAt">;

export const createEmptyThoughtLogDraft = (): ThoughtLogDraft => ({
  id: crypto.randomUUID(),
  title: "Untitled thought log",
  situation: "",
  feelings: [],
  thoughtText: "",
  extractedThoughts: [],
  labelAssignments: [],
  rationalThought: "",
  rationalResponses: [],
  reviewModeLastUsed: "original",
  schemaVersion: 2,
});

export const finalizeDraft = (draft: ThoughtLogDraft): ThoughtLogEntry => {
  const now = new Date().toISOString();
  const title = draft.situation.trim().slice(0, 72) || "Untitled thought log";

  return {
    ...draft,
    title,
    createdAt: now,
    updatedAt: now,
  };
};
