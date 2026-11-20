/**
 * History helpers: order entries by when they happened, group them by day,
 * and search their text. Pure functions; everything stays on the device.
 */

import { isCheckIn, type Entry } from "@/lib/check-in/types";

/** Everything a person might remember an entry by, lowercased. */
export function entrySearchText(entry: Entry): string {
  const parts = isCheckIn(entry)
    ? [
        entry.situation,
        ...entry.emotions,
        ...entry.sensations,
        entry.sensationText,
        ...entry.needs,
        entry.needText,
        entry.notes ?? "",
      ]
    : [
        entry.title,
        entry.situation,
        ...entry.feelings.map((f) => f.name),
        entry.thoughtText,
        entry.rationalThought,
        entry.notes ?? "",
      ];
  return parts.join("\n").toLowerCase();
}

/** Every word of the query must appear somewhere in the entry. */
export function matchesSearch(entry: Entry, query: string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const text = entrySearchText(entry);
  return words.every((word) => text.includes(word));
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/** "Today", "Yesterday", else "Mon, Nov 16" (with the year once it differs). */
export function dayLabel(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  if (dayKey(date) === dayKey(now)) return "Today";
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (dayKey(date) === dayKey(yesterday)) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: "numeric" }),
  });
}

export interface DayGroup<T extends Entry = Entry> {
  label: string;
  entries: T[];
}

/** Newest first by the moment they were written, one group per calendar day. */
export function groupByDay<T extends Entry>(entries: T[], now: Date = new Date()): DayGroup<T>[] {
  const sorted = [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const groups: DayGroup<T>[] = [];
  let currentKey = "";
  for (const entry of sorted) {
    const key = dayKey(new Date(entry.createdAt));
    if (key !== currentKey) {
      groups.push({ label: dayLabel(entry.createdAt, now), entries: [] });
      currentKey = key;
    }
    groups[groups.length - 1].entries.push(entry);
  }
  return groups;
}
