/**
 * Core worksheet domain types.
 *
 * A worksheet is one pass through the CBT-style thought log:
 * situation → feelings → free-written thought passage → marked phrases
 * → distortion labels → review → rational thought.
 *
 * Marked phrases reference the passage by character offsets so the
 * original text remains the single source of truth (like circling
 * words on paper — the page itself is never rewritten).
 */

export const WORKSHEET_SCHEMA_VERSION = 1;

export interface Feeling {
  id: string;
  name: string;
  /** 1–5 intensity, optional — naming the feeling matters more than rating it. */
  intensity?: number;
}

export interface MarkedPhrase {
  id: string;
  /** Character offset range into `thoughtText` (start inclusive, end exclusive). */
  start: number;
  end: number;
  /** Snapshot of the phrase text at time of marking. */
  text: string;
  /** IDs from the distortion catalog. */
  distortionIds: string[];
  /** True when produced by the deterministic auto-segmenter. */
  auto?: boolean;
}

export type ReviewMode = "original" | "all-together" | "one-by-one";

export interface Worksheet {
  id: string;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
  title: string;
  situation: string;
  feelings: Feeling[];
  thoughtText: string;
  phrases: MarkedPhrase[];
  rationalThought: string;
  reviewModeLastUsed: ReviewMode;
}

export type StepId =
  | "situation"
  | "feelings"
  | "thoughts"
  | "circle"
  | "label"
  | "review"
  | "rational"
  | "save";

export const STEP_ORDER: StepId[] = [
  "situation",
  "feelings",
  "thoughts",
  "circle",
  "label",
  "review",
  "rational",
  "save",
];

export function newWorksheet(id: string): Worksheet {
  const now = new Date().toISOString();
  return {
    id,
    schemaVersion: WORKSHEET_SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    title: "",
    situation: "",
    feelings: [],
    thoughtText: "",
    phrases: [],
    rationalThought: "",
    reviewModeLastUsed: "original",
  };
}

/** A worksheet counts as "has content" once the user has typed anything meaningful. */
export function worksheetHasContent(w: Worksheet): boolean {
  return (
    w.situation.trim().length > 0 ||
    w.thoughtText.trim().length > 0 ||
    w.feelings.length > 0 ||
    w.rationalThought.trim().length > 0
  );
}

/** Default title derived from the situation, for history lists. */
export function worksheetTitle(w: Worksheet): string {
  if (w.title.trim()) return w.title.trim();
  const situation = w.situation.trim();
  if (situation) {
    return situation.length > 60 ? `${situation.slice(0, 57)}…` : situation;
  }
  return "Untitled entry";
}

export function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
