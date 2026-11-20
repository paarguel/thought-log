/**
 * Local file export: JSON (portable data) and printable HTML (readable copy).
 *
 * All user-entered text is escaped before it reaches HTML — worksheet
 * content is untrusted even when it belongs to the current user. (R21, KTD9)
 */

import { Capacitor, registerPlugin } from "@capacitor/core";

import type { Worksheet } from "@/lib/thought-log/types";
import { worksheetTitle, WORKSHEET_SCHEMA_VERSION } from "@/lib/thought-log/types";
import { getDistortion } from "@/lib/thought-log/distortions";
import {
  checkInTitle,
  isCheckIn,
  type EmotionCheckIn,
  type Entry,
} from "@/lib/check-in/types";
import { REFLECTION_CLOSING } from "@/lib/check-in/reflection";

export const BACKUP_APP_ID = "thought-record";

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function worksheetToJson(entry: Entry): string {
  return JSON.stringify(entry, null, 2);
}

/**
 * Full-device backup: every saved entry in one portable JSON file.
 * This is the user's safety net — the app itself is not long-term storage.
 */
export function backupToJson(entries: Entry[]): string {
  return JSON.stringify(
    {
      app: BACKUP_APP_ID,
      schemaVersion: WORKSHEET_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      entries,
    },
    null,
    2
  );
}

export function backupFilename(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `thought-record-backup-${date}.json`;
}

function isWorksheetLike(value: unknown): value is Worksheet {
  if (typeof value !== "object" || value === null) return false;
  const w = value as Record<string, unknown>;
  return (
    typeof w.id === "string" &&
    typeof w.createdAt === "string" &&
    typeof w.updatedAt === "string" &&
    typeof w.thoughtText === "string" &&
    Array.isArray(w.feelings) &&
    Array.isArray(w.phrases)
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function isCheckInLike(value: unknown): value is EmotionCheckIn {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Record<string, unknown>;
  return (
    c.kind === "check-in" &&
    typeof c.id === "string" &&
    typeof c.createdAt === "string" &&
    typeof c.updatedAt === "string" &&
    typeof c.situation === "string" &&
    typeof c.sensationText === "string" &&
    typeof c.needText === "string" &&
    isStringArray(c.emotions) &&
    isStringArray(c.sensations) &&
    isStringArray(c.needs) &&
    (c.intensity === undefined || typeof c.intensity === "number")
  );
}

function isEntryLike(value: unknown): value is Entry {
  return isCheckInLike(value) || isWorksheetLike(value);
}

/**
 * Parse a backup file (or a single exported entry) back into entries.
 * Throws a user-facing Error when the file isn't one of ours.
 */
export function parseBackupJson(text: string): Entry[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }

  // A single exported entry is also importable.
  if (isEntryLike(data)) return [data];

  if (typeof data === "object" && data !== null && Array.isArray((data as { entries?: unknown }).entries)) {
    const entries = (data as { entries: unknown[] }).entries.filter(isEntryLike);
    if (entries.length === 0) {
      throw new Error("That backup file doesn't contain any entries.");
    }
    return entries;
  }

  throw new Error("That file doesn't look like a Thought Record backup.");
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "long",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

/** Passage HTML with marked phrases wrapped in <mark>, all text escaped. */
function passageHtml(w: Worksheet): string {
  const sorted = [...w.phrases].sort((a, b) => a.start - b.start);
  let cursor = 0;
  let html = "";
  for (const phrase of sorted) {
    if (phrase.start < cursor) continue; // skip overlaps defensively
    html += escapeHtml(w.thoughtText.slice(cursor, phrase.start));
    const labels = phrase.distortionIds
      .map((id) => getDistortion(id)?.label)
      .filter(Boolean)
      .join(", ");
    html += `<mark>${escapeHtml(w.thoughtText.slice(phrase.start, phrase.end))}</mark>`;
    if (labels) html += `<sup class="labels"> ${escapeHtml(labels)}</sup>`;
    cursor = phrase.end;
  }
  html += escapeHtml(w.thoughtText.slice(cursor));
  return html.replace(/\n/g, "<br/>");
}

/**
 * Self-contained printable HTML document. Opens cleanly in any browser,
 * prints like the paper worksheet, and can be shared with a therapist.
 *
 * Notes are left out unless asked for: this is the copy that gets handed to
 * someone else, and a caller that forgets the option should under-share
 * rather than over-share.
 */
export function worksheetToPrintableHtml(
  w: Worksheet,
  { includeNotes = false }: { includeNotes?: boolean } = {}
): string {
  const feelings = w.feelings
    .map((f) => escapeHtml(f.name) + (f.intensity ? ` (${f.intensity}/5)` : ""))
    .join(" · ");

  const phraseRows = w.phrases
    .map((p) => {
      const labels = p.distortionIds
        .map((id) => getDistortion(id)?.label ?? id)
        .map(escapeHtml)
        .join(", ");
      return `<tr><td>“${escapeHtml(p.text)}”</td><td>${labels || "—"}</td></tr>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${escapeHtml(worksheetTitle(w))} — Thought Record</title>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; color: #26221c; background: #faf6f0;
         max-width: 42rem; margin: 2rem auto; padding: 0 1.25rem; line-height: 1.6; }
  h1 { font-size: 1.4rem; border-bottom: 1px solid #d8cfc0; padding-bottom: .5rem; }
  h2 { font-size: .8rem; text-transform: uppercase; letter-spacing: .08em; color: #8a8072; margin: 1.6rem 0 .4rem; }
  mark { background: #ffe9b3; padding: 0 .15em; border-radius: .2em; }
  sup.labels { color: #a8560f; font-size: .7em; font-family: sans-serif; }
  table { width: 100%; border-collapse: collapse; font-size: .95rem; }
  td { border-top: 1px solid #e7dfd3; padding: .5rem .5rem .5rem 0; vertical-align: top; }
  td:last-child { color: #a8560f; font-family: sans-serif; font-size: .85rem; white-space: normal; }
  .meta { color: #8a8072; font-size: .85rem; }
  .rational { background: #f1ece2; border-radius: .5rem; padding: 1rem; }
  @media print { body { background: #fff; margin: 0 auto; } }
</style>
</head>
<body>
<h1>${escapeHtml(worksheetTitle(w))}</h1>
<p class="meta">${escapeHtml(formatDate(w.createdAt))} — Thought Record</p>

<h2>Situation</h2>
<p>${escapeHtml(w.situation) || "—"}</p>

<h2>Feelings</h2>
<p>${feelings || "—"}</p>

<h2>Thoughts</h2>
<p>${passageHtml(w) || "—"}</p>

${
  w.phrases.length
    ? `<h2>Marked thoughts &amp; thinking patterns</h2>
<table>${phraseRows}</table>`
    : ""
}

<h2>A more balanced thought</h2>
<div class="rational"><p>${escapeHtml(w.rationalThought) || "—"}</p></div>
${
  includeNotes && w.notes?.trim()
    ? `<h2>Notes</h2>
<p>${escapeHtml(w.notes).replace(/\n/g, "<br/>")}</p>`
    : ""
}
</body>
</html>`;
}

/**
 * Printable copy of a check-in: exactly what was picked and typed, section
 * by section, then the closing line. Notes follow the same under-share default as worksheets.
 */
export function checkInToPrintableHtml(
  c: EmotionCheckIn,
  { includeNotes = false }: { includeNotes?: boolean } = {}
): string {
  const list = (picked: string[], typed: string) =>
    [...picked, typed.trim()].filter(Boolean).map(escapeHtml).join(" · ");
  const row = (label: string, value: string) =>
    value ? `<h2>${label}</h2>\n<p>${value}</p>\n` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${escapeHtml(checkInTitle(c))} — Thought Record</title>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; color: #26221c; background: #faf6f0;
         max-width: 42rem; margin: 2rem auto; padding: 0 1.25rem; line-height: 1.6; }
  h1 { font-size: 1.4rem; border-bottom: 1px solid #d8cfc0; padding-bottom: .5rem; }
  h2 { font-size: .8rem; text-transform: uppercase; letter-spacing: .08em; color: #8a8072; margin: 1.6rem 0 .4rem; }
  .meta { color: #8a8072; font-size: .85rem; }
  .closing { margin-top: 2rem; font-style: italic; color: #6f6759; }
  @media print { body { background: #fff; margin: 0 auto; } }
</style>
</head>
<body>
<h1>${escapeHtml(checkInTitle(c))}</h1>
<p class="meta">${escapeHtml(formatDate(c.createdAt))} — Emotion check-in, Thought Record</p>

${row("What happened", escapeHtml(c.situation.trim()).replace(/\n/g, "<br/>"))}${row(
    "What I might be feeling",
    c.emotions.map(escapeHtml).join(" · ")
  )}${row("How strong it felt", c.intensity ? `${c.intensity} of 10` : "")}${row(
    "What I notice in my body or behavior",
    list(c.sensations, c.sensationText)
  )}${row("What I might need", list(c.needs, c.needText))}${
    includeNotes && c.notes?.trim()
      ? row("Notes", escapeHtml(c.notes).replace(/\n/g, "<br/>"))
      : ""
  }<p class="closing">${escapeHtml(REFLECTION_CLOSING)}</p>
</body>
</html>`;
}

/** Printable HTML for either kind of entry. */
export function entryToPrintableHtml(
  entry: Entry,
  options: { includeNotes?: boolean } = {}
): string {
  return isCheckIn(entry)
    ? checkInToPrintableHtml(entry, options)
    : worksheetToPrintableHtml(entry, options);
}

const localExport = registerPlugin<{
  save(options: { filename: string; content: string; mime: string }): Promise<{ saved: boolean }>;
}>("LocalExport");

/** Android uses its local file picker; web/iOS retain browser downloads. */
export async function downloadFile(filename: string, content: string, mime: string): Promise<boolean> {
  if (Capacitor.getPlatform() === "android") {
    const result = await localExport.save({ filename, content, mime });
    return result.saved;
  }
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return true;
}

export function exportFilename(entry: Entry, ext: "json" | "html"): string {
  const date = entry.createdAt.slice(0, 10);
  const checkIn = isCheckIn(entry);
  const slug =
    (checkIn ? checkInTitle(entry) : worksheetTitle(entry))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "entry";
  return `${checkIn ? "check-in" : "thinking-errors"}-${date}-${slug}.${ext}`;
}
