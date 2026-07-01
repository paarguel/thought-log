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

export const createPrintableHtml = (entry: ThoughtLogEntry) => {
  const labels = entry.labelAssignments
    .map((assignment) => {
      const thought = entry.extractedThoughts.find((item) => item.id === assignment.thoughtId);
      const names = assignment.distortionIds.map((id) => getDistortion(id)?.label ?? id).join(", ");
      return `<li><strong>${escapeHtml(thought?.text ?? "Thought")}</strong><br>${escapeHtml(names || "Unlabeled")}</li>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(entry.title)}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 2rem; line-height: 1.5; color: #202321; }
    h1 { font-size: 1.5rem; }
    section { border-top: 1px solid #d9d3c8; padding-top: 1rem; margin-top: 1rem; }
    pre { white-space: pre-wrap; font-family: inherit; }
  </style>
</head>
<body>
  <h1>${escapeHtml(entry.title)}</h1>
  <p>${escapeHtml(new Date(entry.createdAt).toLocaleString())}</p>
  <section><h2>Situation</h2><pre>${escapeHtml(entry.situation)}</pre></section>
  <section><h2>Feelings</h2><p>${escapeHtml(entry.feelings.join(", "))}</p></section>
  <section><h2>Thought Passage</h2><pre>${escapeHtml(entry.thoughtText)}</pre></section>
  <section><h2>Labels</h2><ul>${labels}</ul></section>
  <section><h2>Realistic / Rational Thought</h2><pre>${escapeHtml(entry.rationalThought)}</pre></section>
</body>
</html>`;
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
  downloadBlob(createJsonExport(entry), `${entry.id}.json`);
};

export const exportEntryAsHtml = (entry: ThoughtLogEntry) => {
  const blob = new Blob([createPrintableHtml(entry)], {
    type: "text/html;charset=utf-8",
  });
  downloadBlob(blob, `${entry.id}.html`);
};
