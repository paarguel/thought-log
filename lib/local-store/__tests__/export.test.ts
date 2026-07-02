import { describe, expect, it } from "vitest";
import { escapeHtml, worksheetToJson, worksheetToPrintableHtml, exportFilename } from "../export";
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
    expect(name).toMatch(/^thought-log-2026-07-02-[a-z0-9-]+\.html$/);
  });
});
