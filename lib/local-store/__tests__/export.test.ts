import { describe, expect, it } from "vitest";
import {
  escapeHtml,
  worksheetToJson,
  worksheetToPrintableHtml,
  exportFilename,
  backupToJson,
  parseBackupJson,
} from "../export";
import { newWorksheet } from "@/lib/thought-log/types";

function sampleWorksheet() {
  const w = newWorksheet("test-id");
  w.createdAt = "2026-07-02T10:00:00.000Z";
  w.situation = "Boss emailed <b>“talk tomorrow”</b>";
  w.feelings = [{ id: "f1", name: "Anxious" }];
  w.thoughtText = "I'm going to get fired. <script>alert(1)</script> everyone knows.";
  w.phrases = [
    {
      id: "p1",
      start: 0,
      end: 24,
      text: "I'm going to get fired.",
      distortionIds: ["fortune-telling"],
    },
  ];
  w.rationalThought = "A talk isn't a firing.";
  return w;
}

describe("escapeHtml", () => {
  it("escapes HTML-significant characters", () => {
    expect(escapeHtml(`<script>"a" & 'b'</script>`)).toBe(
      "&lt;script&gt;&quot;a&quot; &amp; &#39;b&#39;&lt;/script&gt;"
    );
  });
});

describe("worksheetToPrintableHtml", () => {
  it("escapes user content so script-like input cannot execute", () => {
    const html = worksheetToPrintableHtml(sampleWorksheet());
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<b>“talk");
  });

  it("includes situation, feelings, marked phrase, and rational thought", () => {
    const html = worksheetToPrintableHtml(sampleWorksheet());
    expect(html).toContain("Anxious");
    expect(html).toContain("Fortune telling");
    expect(html).toContain("A talk isn&#39;t a firing.");
    expect(html).toContain("<mark>");
  });
});

describe("worksheetToJson", () => {
  it("round-trips the worksheet", () => {
    const w = sampleWorksheet();
    expect(JSON.parse(worksheetToJson(w))).toEqual(w);
  });
});

describe("exportFilename", () => {
  it("builds a safe slug", () => {
    const w = sampleWorksheet();
    const name = exportFilename(w, "html");
    expect(name).toMatch(/^thinking-errors-2026-07-02-[a-z0-9-]+\.html$/);
  });
});

describe("notes in exports", () => {
  function withNotes() {
    const w = sampleWorksheet();
    w.notes = "Therapist: <em>still</em> bracing for bad news.\nAsk before assuming.";
    return w;
  }

  it("leaves notes out of the printable copy by default", () => {
    const html = worksheetToPrintableHtml(withNotes());
    expect(html).not.toContain("bracing for bad news");
    expect(html).not.toContain("<h2>Notes</h2>");
  });

  it("includes notes in the printable copy when asked", () => {
    const html = worksheetToPrintableHtml(withNotes(), { includeNotes: true });
    expect(html).toContain("<h2>Notes</h2>");
    expect(html).toContain("Ask before assuming.");
  });

  it("escapes notes in the printable copy", () => {
    const html = worksheetToPrintableHtml(withNotes(), { includeNotes: true });
    expect(html).not.toContain("<em>still</em>");
    expect(html).toContain("&lt;em&gt;still&lt;/em&gt;");
  });

  it("produces the same printable copy either way when there are no notes", () => {
    const w = sampleWorksheet();
    expect(worksheetToPrintableHtml(w, { includeNotes: true })).toBe(
      worksheetToPrintableHtml(w)
    );
  });

  it("round-trips notes through a backup, and entries without notes stay without", () => {
    const noted = withNotes();
    const plain = sampleWorksheet();
    plain.id = "plain-id";

    const parsed = parseBackupJson(backupToJson([noted, plain]));

    expect(parsed).toHaveLength(2);
    expect(parsed.find((w) => w.id === noted.id)?.notes).toBe(noted.notes);
    expect(parsed.find((w) => w.id === "plain-id")?.notes).toBeUndefined();
  });

  it("still imports a version-1 backup written before notes existed", () => {
    const legacy = JSON.stringify({
      app: "thought-record",
      schemaVersion: 1,
      exportedAt: "2026-07-02T10:00:00.000Z",
      entries: [{ ...sampleWorksheet(), schemaVersion: 1 }],
    });

    const parsed = parseBackupJson(legacy);

    expect(parsed).toHaveLength(1);
    expect(parsed[0].notes).toBeUndefined();
  });
});
