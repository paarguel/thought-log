/**
 * Quick-pick feeling words, grouped loosely by family.
 * Users can always type their own; these just lower the friction of naming.
 */

export interface FeelingGroup {
  family: string;
  words: string[];
}

const WORD_TO_FAMILY = new Map<string, string>();

/**
 * Collapse picked feelings to their family names ("Worried" → "Anxious"),
 * deduped in first-picked order. Custom typed feelings pass through as-is.
 */
export function feelingFamilies(feelings: Array<{ name: string }>): string[] {
  const families: string[] = [];
  for (const f of feelings) {
    const name = f.name.trim();
    const family = WORD_TO_FAMILY.get(name.toLowerCase()) ?? name;
    if (family && !families.includes(family)) families.push(family);
  }
  return families;
}

export const FEELING_GROUPS: FeelingGroup[] = [
  {
    family: "Anxious",
    words: ["Anxious", "Worried", "Overwhelmed", "Panicked", "On edge", "Dread"],
  },
  {
    family: "Sad",
    words: ["Sad", "Hopeless", "Lonely", "Disappointed", "Hurt", "Empty"],
  },
  {
    family: "Angry",
    words: ["Angry", "Frustrated", "Irritated", "Resentful", "Betrayed"],
  },
  {
    family: "Ashamed",
    words: ["Ashamed", "Guilty", "Embarrassed", "Inadequate", "Worthless"],
  },
  {
    family: "Afraid",
    words: ["Afraid", "Insecure", "Helpless", "Trapped", "Unsafe"],
  },
];

for (const group of FEELING_GROUPS) {
  for (const word of group.words) {
    WORD_TO_FAMILY.set(word.toLowerCase(), group.family);
  }
}
