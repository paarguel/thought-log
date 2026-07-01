import { describe, expect, it } from "vitest";
import { createEmptyThoughtLogDraft, finalizeDraft } from "@/lib/thought-log/types";
import { createPrintableHtml, escapeHtml } from "../export";

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
});
