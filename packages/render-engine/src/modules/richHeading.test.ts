/**
 * @file richHeading.test.ts
 * @description Tests the smart between-fragment spacing — the single rule shared by
 *  the live renderer, the builder preview, and the plain-text join. Guards the bug
 *  where adjacent heading fragments rendered with no space ("fingertip-fast"), and
 *  guards against the opposite (double-spacing already-spaced seed data).
 */
import { describe, it, expect } from "vitest";
import { needsSpaceBetween, richHeadingToText } from "./RichHeading";

describe("needsSpaceBetween", () => {
  it("inserts a space between two bare adjacent fragments (the bug)", () => {
    expect(needsSpaceBetween("fingertip-", false, "fast.")).toBe(true);
  });
  it("does NOT double-space when the left already ends with a space", () => {
    expect(needsSpaceBetween("Download the ", false, "pharmacy")).toBe(false);
  });
  it("does NOT add a space when the right already starts with a space", () => {
    expect(needsSpaceBetween("pharmacy", false, " app")).toBe(false);
  });
  it("does NOT add a space before closing punctuation", () => {
    expect(needsSpaceBetween("how we work", false, ".")).toBe(false);
    expect(needsSpaceBetween("Questions", false, ",")).toBe(false);
    expect(needsSpaceBetween("done", false, ")")).toBe(false);
  });
  it("does NOT add a space after a line break", () => {
    expect(needsSpaceBetween("Authentic", true, "medicines")).toBe(false);
  });
  it("handles empty fragments without adding a space", () => {
    expect(needsSpaceBetween("", false, "x")).toBe(false);
    expect(needsSpaceBetween("x", false, "")).toBe(false);
  });
});

describe("richHeadingToText", () => {
  it("flattens the cramped hero seed WITH the missing space", () => {
    const v = { parts: [
      { text: "Authentic", br: true },
      { text: "medicines, " },
      { text: "fingertip-", emphasis: "italic" as const },
      { text: "fast." },
    ] };
    // br → space, "medicines, " already has its space, "fingertip-"+"fast." → space.
    expect(richHeadingToText(v)).toBe("Authentic medicines, fingertip- fast.");
  });
  it("does not double-space already-spaced data", () => {
    const v = { parts: [
      { text: "Download the " },
      { text: "pharmacy", emphasis: "italic-accent" as const },
      { text: " app" },
    ] };
    expect(richHeadingToText(v)).toBe("Download the pharmacy app");
    expect(richHeadingToText(v)).not.toMatch(/ {2}/);
  });
  it("passes through a plain string and handles undefined", () => {
    expect(richHeadingToText("Plain heading")).toBe("Plain heading");
    expect(richHeadingToText(undefined)).toBe("");
  });
});
