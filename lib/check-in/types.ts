/**
 * Emotion check-in: a short, separate kind of entry.
 *
 * Where a worksheet works a thought through, a check-in only notices: what
 * happened, what the feeling might be, what the body is doing, what might
 * help. Every field is optional. Nothing here is scored, interpreted or
 * treated as more or less complete, and an empty check-in is a valid one.
 *
 * Check-ins share the `entries` store with worksheets and are told apart by
 * `kind`. Worksheets saved before check-ins existed have no `kind` at all.
 */

import { generateId, type Worksheet } from "@/lib/thought-log/types";

export const CHECK_IN_SCHEMA_VERSION = 1;

/** Naming more than a few feelings turns noticing into sorting. */
export const MAX_EMOTIONS = 3;

export interface EmotionCheckIn {
  id: string;
  kind: "check-in";
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
  situation: string;
  /** Up to MAX_EMOTIONS words, picked or typed, in the order chosen. */
  emotions: string[];
  /** 1–10, absent unless the user moved the slider. */
  intensity?: number;
  /** Picked body/behavior suggestions, plus anything typed. */
  sensations: string[];
  sensationText: string;
  /** Picked need suggestions, plus anything typed. */
  needs: string[];
  needText: string;
  /** Notes added later from the entry page, same as a worksheet's. */
  notes?: string;
}

/** Anything the `entries` store can hold. */
export type Entry = Worksheet | EmotionCheckIn;

export function isCheckIn(entry: Entry): entry is EmotionCheckIn {
  return (entry as { kind?: unknown }).kind === "check-in";
}

export function newCheckIn(id: string = generateId()): EmotionCheckIn {
  const now = new Date().toISOString();
  return {
    id,
    kind: "check-in",
    schemaVersion: CHECK_IN_SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    situation: "",
    emotions: [],
    sensations: [],
    sensationText: "",
    needs: [],
    needText: "",
  };
}

export function checkInHasContent(c: EmotionCheckIn): boolean {
  return (
    c.situation.trim().length > 0 ||
    c.emotions.length > 0 ||
    c.intensity !== undefined ||
    c.sensations.length > 0 ||
    c.sensationText.trim().length > 0 ||
    c.needs.length > 0 ||
    c.needText.trim().length > 0
  );
}

/** Add or remove a feeling word. A fourth word is ignored, never swapped in. */
export function toggleEmotion(emotions: string[], word: string): string[] {
  const name = word.trim();
  if (!name) return emotions;
  const existing = emotions.find((e) => e.toLowerCase() === name.toLowerCase());
  if (existing) return emotions.filter((e) => e !== existing);
  if (emotions.length >= MAX_EMOTIONS) return emotions;
  return [...emotions, name];
}

export function toggleItem(items: string[], item: string): string[] {
  return items.includes(item) ? items.filter((i) => i !== item) : [...items, item];
}

/** Title for history lists: the situation, else the feelings, else a plain name. */
export function checkInTitle(c: EmotionCheckIn): string {
  const situation = c.situation.trim();
  if (situation) {
    return situation.length > 60 ? `${situation.slice(0, 57)}…` : situation;
  }
  if (c.emotions.length > 0) return c.emotions.join(", ");
  return "Check-in";
}

export interface EmotionGroup {
  label: string;
  words: string[];
}

/** Everyday words, grouped loosely. Guesses to pick from, not a taxonomy. */
export const EMOTION_GROUPS: EmotionGroup[] = [
  {
    label: "Sadness and connection",
    words: ["Sad", "Lonely", "Hurt", "Disappointed", "Grieving"],
  },
  {
    label: "Fear and uncertainty",
    words: ["Scared", "Anxious", "Insecure", "Vulnerable", "Overwhelmed"],
  },
  {
    label: "Anger and frustration",
    words: ["Frustrated", "Angry", "Resentful", "Irritated"],
  },
  {
    label: "Self-conscious",
    words: ["Ashamed", "Guilty", "Embarrassed"],
  },
  {
    label: "Positive",
    words: ["Happy", "Relieved", "Proud", "Excited", "Content", "Grateful"],
  },
  {
    label: "Other",
    words: ["Emotionally exhausted", "Numb", "Conflicted", "Unsure"],
  },
];

export const KNOWN_EMOTIONS = new Set(
  EMOTION_GROUPS.flatMap((g) => g.words.map((w) => w.toLowerCase()))
);

/** A few common ones to tap. Deliberately short; the text field takes the rest. */
export const SENSATION_SUGGESTIONS = [
  "Tight shoulders",
  "Heavy chest",
  "Restlessness",
  "Fatigue",
  "Wanting to withdraw",
  "Crying",
  "Feeling calm",
  "Nothing in particular",
];

export const NEED_SUGGESTIONS = [
  "Rest",
  "Connection",
  "Understanding",
  "Support",
  "Space",
  "Affection",
  "Recognition",
  "Safety",
  "Permission to be imperfect",
  "Not sure",
];
