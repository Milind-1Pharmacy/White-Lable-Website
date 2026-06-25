/**
 * @file safeUrl.test.ts
 * @description Tests for the URL sanitizers that guard every config-driven href/src
 *  sink. These are the platform's first line of defence against javascript:/data:
 *  injection from a tampered tenant config, so the matrix is exhaustive.
 */
import { describe, it, expect } from "vitest";
import { safeHref, safeSrc } from "./safeUrl";

describe("safeHref", () => {
  it("allows http(s), root-relative, anchors, mailto, tel", () => {
    expect(safeHref("https://example.com")).toBe("https://example.com");
    expect(safeHref("http://example.com")).toBe("http://example.com");
    expect(safeHref("/about")).toBe("/about");
    expect(safeHref("#section")).toBe("#section");
    expect(safeHref("mailto:a@b.com")).toBe("mailto:a@b.com");
    expect(safeHref("tel:+15551234")).toBe("tel:+15551234");
    expect(safeHref("relative/path")).toBe("relative/path");
  });

  it("rejects dangerous schemes → fallback", () => {
    expect(safeHref("javascript:alert(1)")).toBe("/");
    expect(safeHref("JavaScript:alert(1)")).toBe("/");
    expect(safeHref("vbscript:msgbox(1)")).toBe("/");
    expect(safeHref("data:text/html,<script>")).toBe("/");
    expect(safeHref("file:///etc/passwd")).toBe("/");
  });

  it("rejects protocol-relative (open redirect) → fallback", () => {
    expect(safeHref("//evil.com")).toBe("/");
  });

  it("uses the supplied fallback and handles empty/nullish", () => {
    expect(safeHref("javascript:x", "/safe")).toBe("/safe");
    expect(safeHref(undefined, "/x")).toBe("/x");
    expect(safeHref(null)).toBe("/");
    expect(safeHref("")).toBe("/");
  });
});

describe("safeSrc", () => {
  it("allows http(s), root-relative, and data:image/*", () => {
    expect(safeSrc("https://cdn.example.com/x.png")).toBe("https://cdn.example.com/x.png");
    expect(safeSrc("/logo.png")).toBe("/logo.png");
    expect(safeSrc("data:image/png;base64,AAAA")).toBe("data:image/png;base64,AAAA");
  });

  it("rejects unsafe schemes → empty string", () => {
    expect(safeSrc("javascript:alert(1)")).toBe("");
    expect(safeSrc("data:text/html,<script>")).toBe("");
    expect(safeSrc("vbscript:x")).toBe("");
    expect(safeSrc("//evil.com/x.png")).toBe("");
  });

  it("handles empty/nullish → empty string", () => {
    expect(safeSrc(undefined)).toBe("");
    expect(safeSrc(null)).toBe("");
    expect(safeSrc("")).toBe("");
  });
});
