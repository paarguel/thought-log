import type { ThoughtLogEntry } from "@/lib/thought-log/types";
import { getDistortion } from "@/lib/thought-log/distortions";

export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const createJsonExport = (entry: ThoughtLogEntry) =>
  new Blob([JSON.stringify(entry, null, 2)], {
    type: "application/json;charset=utf-8",
  });

const createFilenameStem = (entry: ThoughtLogEntry) => {
  const date = entry.createdAt.slice(0, 10);
  const title = entry.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

  return `${date}-${title || "thought-log"}`;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const getLabelsForThought = (entry: ThoughtLogEntry, thoughtId: string) =>
  entry.labelAssignments.find((assignment) => assignment.thoughtId === thoughtId)?.distortionIds ?? [];

const getLabelText = (entry: ThoughtLogEntry, thoughtId: string) => {
  const labels = getLabelsForThought(entry, thoughtId)
    .map((id) => getDistortion(id)?.label ?? id)
    .join(", ");

  return labels || "Unlabeled";
};

const createMarkedThoughtPassage = (entry: ThoughtLogEntry) => {
  if (entry.extractedThoughts.length === 0) {
    return escapeHtml(entry.thoughtText || "No thought passage entered.");
  }

  const parts: string[] = [];
  let cursor = 0;

  [...entry.extractedThoughts]
    .sort((a, b) => a.start - b.start)
    .forEach((thought) => {
      if (thought.start < cursor) {
        return;
      }

      parts.push(escapeHtml(entry.thoughtText.slice(cursor, thought.start)));
      parts.push(`<mark>${escapeHtml(entry.thoughtText.slice(thought.start, thought.end))}</mark>`);
      cursor = thought.end;
    });

  parts.push(escapeHtml(entry.thoughtText.slice(cursor)));
  return parts.join("");
};

const createThoughtLabelRows = (entry: ThoughtLogEntry) => {
  if (entry.extractedThoughts.length === 0) {
    return `<p class="empty">No thoughts marked yet.</p>`;
  }

  return entry.extractedThoughts
    .map((thought, index) => {
      const labels = getLabelsForThought(entry, thought.id);
      const labelList =
        labels.length > 0
          ? labels
              .map((id) => {
                const distortion = getDistortion(id);
                return `<li><strong>${escapeHtml(distortion?.label ?? id)}</strong><span>${escapeHtml(distortion?.definition ?? "")}</span></li>`;
              })
              .join("")
          : `<li><strong>Unlabeled</strong><span>No thinking pattern selected.</span></li>`;

      return `<article class="thought-row">
        <div class="thought-number">${index + 1}</div>
        <div>
          <p class="thought-text">${escapeHtml(thought.text)}</p>
          <ul class="label-list">${labelList}</ul>
        </div>
      </article>`;
    })
    .join("");
};

export const createPrintableHtml = (entry: ThoughtLogEntry) => {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(entry.title)}</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #f7f4ee;
      color: #202321;
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.45;
    }
    main {
      max-width: 8.5in;
      min-height: 11in;
      margin: 0 auto;
      padding: 0.45in;
      background: #fff;
    }
    header {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      align-items: flex-start;
      padding-bottom: 18px;
      border-bottom: 2px solid #202321;
    }
    h1 {
      margin: 0;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 30px;
      letter-spacing: 0;
    }
    h2 {
      margin: 0;
      font-size: 15px;
    }
    p {
      margin: 0;
    }
    .meta {
      color: #5c625c;
      font-size: 12px;
      text-align: right;
    }
    .worksheet {
      display: grid;
      border: 2px solid #202321;
      border-bottom: 0;
      margin-top: 22px;
    }
    .worksheet-row {
      display: grid;
      grid-template-columns: 1.25in 1fr;
      min-height: 0.8in;
      border-bottom: 2px solid #202321;
    }
    .worksheet-label {
      padding: 14px;
      border-right: 2px solid #202321;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 16px;
    }
    .worksheet-content {
      padding: 16px 20px;
      white-space: pre-wrap;
    }
    .tall {
      min-height: 1.55in;
    }
    .x-tall {
      min-height: 2.25in;
    }
    mark {
      border: 1px solid #d8b85b;
      border-radius: 999px;
      background: #ffe9a8;
      padding: 0 3px;
    }
    .thought-row {
      display: grid;
      grid-template-columns: 30px 1fr;
      gap: 10px;
      padding: 10px 0;
      border-bottom: 1px solid #d9d3c8;
      break-inside: avoid;
    }
    .thought-row:first-child {
      padding-top: 0;
    }
    .thought-row:last-child {
      border-bottom: 0;
      padding-bottom: 0;
    }
    .thought-number {
      display: grid;
      place-items: center;
      width: 26px;
      height: 26px;
      border-radius: 999px;
      background: #d9eef5;
      color: #244657;
      font-weight: 700;
      font-size: 13px;
    }
    .thought-text {
      font-weight: 700;
    }
    .label-list {
      display: grid;
      gap: 5px;
      margin: 8px 0 0;
      padding: 0;
      list-style: none;
    }
    .label-list li {
      display: grid;
      gap: 2px;
    }
    .label-list span,
    .empty {
      color: #5c625c;
      font-size: 12px;
    }
    .print-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin: 14px auto 0;
      max-width: 8.5in;
      padding: 0 0.45in 0.2in;
    }
    .print-actions button {
      border: 1px solid #202321;
      border-radius: 8px;
      background: #202321;
      color: #fff;
      padding: 10px 12px;
      font: inherit;
      font-weight: 700;
    }
    @media print {
      body { background: #fff; }
      main { width: auto; min-height: 0; margin: 0; padding: 0; }
      .print-actions { display: none; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>Mood and Thinking Log</h1>
        <p>${escapeHtml(entry.title)}</p>
      </div>
      <p class="meta">${escapeHtml(formatDate(entry.createdAt))}</p>
    </header>
    <section class="worksheet" aria-label="Mood and Thinking Log worksheet">
      <div class="worksheet-row">
        <h2 class="worksheet-label">Situation</h2>
        <div class="worksheet-content">${escapeHtml(entry.situation || "No situation entered.")}</div>
      </div>
      <div class="worksheet-row">
        <h2 class="worksheet-label">Feeling</h2>
        <div class="worksheet-content">${escapeHtml(entry.feelings.join(", ") || "No feelings selected.")}</div>
      </div>
      <div class="worksheet-row tall">
        <h2 class="worksheet-label">Negative thoughts that led to this emotion</h2>
        <div class="worksheet-content">${createMarkedThoughtPassage(entry)}</div>
      </div>
      <div class="worksheet-row x-tall">
        <h2 class="worksheet-label">Errors / Distortions</h2>
        <div class="worksheet-content">${createThoughtLabelRows(entry)}</div>
      </div>
      <div class="worksheet-row x-tall">
        <h2 class="worksheet-label">Realistic / Rational Thoughts</h2>
        <div class="worksheet-content">${escapeHtml(entry.rationalThought || "No rational thought entered.")}</div>
      </div>
    </section>
  </main>
  <div class="print-actions">
    <button type="button" onclick="window.print()">Print / Save as PDF</button>
  </div>
</body>
</html>`;
};

export const createReadableTextExport = (entry: ThoughtLogEntry) => {
  const markedThoughts =
    entry.extractedThoughts.length > 0
      ? entry.extractedThoughts
          .map((thought, index) => `${index + 1}. ${thought.text}\n   Patterns: ${getLabelText(entry, thought.id)}`)
          .join("\n")
      : "No marked thoughts.";

  return [
    "Mood and Thinking Log",
    `Date: ${formatDate(entry.createdAt)}`,
    "",
    "Situation",
    entry.situation || "No situation entered.",
    "",
    "Feeling",
    entry.feelings.join(", ") || "No feelings selected.",
    "",
    "Negative thoughts that led to this emotion",
    entry.thoughtText || "No thought passage entered.",
    "",
    "Errors / Distortions",
    markedThoughts,
    "",
    "Realistic / Rational Thoughts",
    entry.rationalThought || "No rational thought entered.",
    "",
  ].join("\n");
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportEntryAsJson = (entry: ThoughtLogEntry) => {
  downloadBlob(createJsonExport(entry), `${createFilenameStem(entry)}-backup-data.json`);
};

export const exportEntryAsHtml = (entry: ThoughtLogEntry) => {
  const blob = new Blob([createPrintableHtml(entry)], {
    type: "text/html;charset=utf-8",
  });
  downloadBlob(blob, `${createFilenameStem(entry)}-worksheet.html`);
};

export const exportEntryAsText = (entry: ThoughtLogEntry) => {
  const blob = new Blob([createReadableTextExport(entry)], {
    type: "text/plain;charset=utf-8",
  });
  downloadBlob(blob, `${createFilenameStem(entry)}-worksheet.txt`);
};

export const printEntryWorksheet = (entry: ThoughtLogEntry) => {
  const html = createPrintableHtml(entry);
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    exportEntryAsHtml(entry);
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.setTimeout(() => {
    printWindow.print();
  }, 250);
};
