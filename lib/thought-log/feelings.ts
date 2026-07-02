/**
 * Quick-pick feeling words, grouped loosely by family.
 * Users can always type their own; these just lower the friction of naming.
 */

export interface FeelingGroup {
  family: string;
  words: string[];
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
