/**
 * Local file export: JSON (portable data) and printable HTML (readable copy).
 *
 * All user-entered text is escaped before it reaches HTML — worksheet
 * content is untrusted even when it belongs to the current user. (R21, KTD9)
 */

import type { Worksheet } from "@/lib/thought-log/types";
import { worksheetTitle, WORKSHEET_SCHEMA_VERSION } from "@/lib/thought-log/types";
import { getDistortion } from "@/lib/thought-log/distortions";

export const BACKUP_APP_ID = "thought-record";

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function worksheetToJson(w: Worksheet): string {
  return JSON.stringify(w, null, 2);
}

/**
 * Full-device backup: every saved entry in one portable JSON file.
 * This is the user's safety net — the app itself is not long-term storage.
 */
export function backupToJson(entries: Worksheet[]): string {
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

/**
 * Parse a backup file (or a single exported entry) back into worksheets.
 * Throws a user-facing Error when the file isn't one of ours.
 */
export function parseBackupJson(text: string): Worksheet[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }

  // A single exported entry is also importable.
  if (isWorksheetLike(data)) return [data];

  if (typeof data === "object" && data !== null && Array.isArray((data as { entries?: unknown }).entries)) {
    const entries = (data as { entries: unknown[] }).entries.filter(isWorksheetLike);
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
 */
export function worksheetToPrintableHtml(w: Worksheet): string {
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
</body>
</html>`;
}

/** Trigger a browser file download. No network involved. */
export function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportFilename(w: Worksheet, ext: "json" | "html"): string {
  const date = w.createdAt.slice(0, 10);
  const slug =
    worksheetTitle(w)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "entry";
  return `thinking-errors-${date}-${slug}.${ext}`;
}
