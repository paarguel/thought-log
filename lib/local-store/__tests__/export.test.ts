import { describe, expect, it } from "vitest";
import { createEmptyThoughtLogDraft, finalizeDraft } from "@/lib/thought-log/types";
import { createPrintableHtml, createReadableTextExport, escapeHtml } from "../export";

describe("export helpers", () => {
  it("escapes user-entered HTML", () => {
    expect(escapeHtml("<script>alert('x')</script>")).toBe("&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;");
  });

  it("does not inject raw worksheet content into printable HTML", () => {
    const entry = finalizeDraft({
      ...createEmptyThoughtLogDraft(),
      situation: "<img src=x onerror=alert(1)>",
      thoughtText: "<script>alert(1)</script>",
    });
    const html = createPrintableHtml(entry);
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("formats printable HTML like the worksheet instead of raw data", () => {
    const entry = finalizeDraft({
      ...createEmptyThoughtLogDraft(),
      situation: "At a social gathering",
      feelings: ["Anxious", "Insecure"],
      thoughtText: "Everyone thinks I am weird.",
      extractedThoughts: [{ id: "thought-1", text: "Everyone thinks I am weird.", start: 0, end: 27, source: "manual" }],
      labelAssignments: [{ thoughtId: "thought-1", distortionIds: ["mind-reading"] }],
      rationalThought: "I do not know what others are thinking.",
    });

    const html = createPrintableHtml(entry);

    expect(html).toContain("Mood and Thinking Log");
    expect(html).toContain("Negative thoughts that led to this emotion");
    expect(html).toContain("<mark>Everyone thinks I am weird.</mark>");
    expect(html).toContain("Mind reading");
    expect(html).not.toContain('"labelAssignments"');
  });

  it("creates a readable text worksheet copy", () => {
    const entry = finalizeDraft({
      ...createEmptyThoughtLogDraft(),
      situation: "At a social gathering",
      feelings: ["Anxious"],
      thoughtText: "Everyone thinks I am weird.",
      extractedThoughts: [{ id: "thought-1", text: "Everyone thinks I am weird.", start: 0, end: 27, source: "manual" }],
      labelAssignments: [{ thoughtId: "thought-1", distortionIds: ["mind-reading"] }],
      rationalThought: "I can stay grounded.",
    });

    const text = createReadableTextExport(entry);

    expect(text).toContain("Mood and Thinking Log");
    expect(text).toContain("Situation\nAt a social gathering");
    expect(text).toContain("Patterns: Mind reading");
    expect(text).toContain("Realistic / Rational Thoughts\nI can stay grounded.");
  });

  it("includes one-by-one rational responses in exports", () => {
    const entry = finalizeDraft({
      ...createEmptyThoughtLogDraft(),
      situation: "At a social gathering",
      thoughtText: "Everyone thinks I am weird.",
      extractedThoughts: [{ id: "thought-1", text: "Everyone thinks I am weird.", start: 0, end: 27, source: "manual" }],
      rationalResponses: [{ thoughtId: "thought-1", text: "I cannot know what people are thinking." }],
    });

    expect(createPrintableHtml(entry)).toContain("I cannot know what people are thinking.");
    expect(createReadableTextExport(entry)).toContain("One-by-one responses");
  });
});
