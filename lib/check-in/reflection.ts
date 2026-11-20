/**
 * The reflection: the check-in read back as a few plain sentences.
 *
 * Built by string assembly only. It repeats what the user picked and typed,
 * leaves out whatever they skipped, and never infers, ranks or explains a
 * feeling. No model reads this text.
 */

import type { EmotionCheckIn } from "./types";

export const REFLECTION_CLOSING = "I don't have to figure this out perfectly.";

/** "a", "a and b", "a, b and c" */
function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** Lowercase a leading capital so a phrase can sit mid-sentence; "I" stays. */
function midSentence(text: string): string {
  if (/^I(\b|')/.test(text)) return text;
  // Leave acronyms and names that are clearly not sentence case ("PTO day").
  if (/^[A-Z]{2}/.test(text)) return text;
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function stripEnd(text: string): string {
  return text.trim().replace(/[.!?…\s]+$/, "");
}

function withPeriod(text: string): string {
  const trimmed = text.trim();
  return /[.!?…]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

/** Picked suggestions plus typed text, as one list of mid-sentence phrases. */
function phrases(picked: string[], typed: string, drop: string[] = []): string[] {
  const out = picked.filter((p) => !drop.includes(p)).map(midSentence);
  const text = stripEnd(typed);
  if (text) out.push(midSentence(text));
  return out;
}

/** One sentence per answered question, then the closing line. */
export function reflectionLines(c: EmotionCheckIn): string[] {
  const lines: string[] = [];

  const situation = c.situation.trim();
  if (situation) lines.push(`Something happened: ${withPeriod(situation)}`);

  if (c.emotions.length > 0) {
    lines.push(`I might be feeling ${joinList(c.emotions.map(midSentence))}.`);
  }

  const noticed = phrases(c.sensations, c.sensationText);
  if (noticed.length > 0) lines.push(`I notice ${joinList(noticed)}.`);

  const needs = phrases(c.needs, c.needText, ["Not sure"]);
  const unsure = c.needs.includes("Not sure");
  if (needs.length > 0) {
    lines.push(
      `I might need ${joinList(needs)}${unsure ? ", though I'm not sure" : ""}.`
    );
  } else if (unsure) {
    lines.push("I'm not sure what I need.");
  }

  if (lines.length === 0) lines.push("I stopped to notice.");
  lines.push(REFLECTION_CLOSING);
  return lines;
}

export function reflectionText(c: EmotionCheckIn): string {
  return reflectionLines(c).join("\n");
}
