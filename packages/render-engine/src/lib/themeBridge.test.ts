/**
 * @file themeBridge.test.ts
 * @description Tests the colour bridge that drives user brand colours onto the CSS
 *  variables the shared stylesheet reads — in BOTH the builder preview's injected
 *  <style> and the live (site) layout. safeColor() is the guard on that injected
 *  <style> sink (a tampered config / localStorage draft could carry a CSS-injection
 *  breakout like `red}body{…`), so its accept/reject matrix is exhaustive.
 */
import { describe, it, expect } from "vitest";
import { safeColor, hexToRgba, bridgeVars, bridgeCss } from "./themeBridge";

describe("safeColor", () => {
  it("accepts hex (3/4/6/8) and rgb/rgba/hsl/hsla", () => {
    expect(safeColor("#fff")).toBe("#fff");
    expect(safeColor("#ffff")).toBe("#ffff");
    expect(safeColor("#1FAFA6")).toBe("#1FAFA6");
    expect(safeColor("#1FAFA6AA")).toBe("#1FAFA6AA");
    expect(safeColor("rgb(10, 20, 30)")).toBe("rgb(10, 20, 30)");
    expect(safeColor("rgba(10,20,30,.5)")).toBe("rgba(10,20,30,.5)");
    expect(safeColor("hsl(120, 50%, 40%)")).toBe("hsl(120, 50%, 40%)");
    expect(safeColor("hsla(120,50%,40%,.5)")).toBe("hsla(120,50%,40%,.5)");
  });
  it("trims surrounding whitespace before validating", () => {
    expect(safeColor("  #abc  ")).toBe("#abc");
  });
  it("rejects a CSS-injection breakout and returns the fallback", () => {
    expect(safeColor("red}body{display:none")).toBe("#000000");
    expect(safeColor("#fff;}*{color:red")).toBe("#000000");
    expect(safeColor("url(javascript:alert(1))")).toBe("#000000");
    expect(safeColor("expression(alert(1))")).toBe("#000000");
  });
  it("rejects named colours and bare keywords (not hex/func)", () => {
    expect(safeColor("red")).toBe("#000000");
    expect(safeColor("transparent")).toBe("#000000");
  });
  it("honours a custom fallback verbatim (caller-controlled, not re-validated)", () => {
    expect(safeColor(undefined, "var(--accent)")).toBe("var(--accent)");
    expect(safeColor("bogus", "transparent")).toBe("transparent");
  });
  it("handles undefined/empty/non-string input", () => {
    expect(safeColor(undefined)).toBe("#000000");
    expect(safeColor("")).toBe("#000000");
    // @ts-expect-error — guarding the runtime path, not the type
    expect(safeColor(123)).toBe("#000000");
  });
});

describe("hexToRgba", () => {
  it("expands 3-char hex and applies alpha", () => {
    expect(hexToRgba("#fff", 0.5)).toBe("rgba(255,255,255,0.5)");
    expect(hexToRgba("fff", 0.5)).toBe("rgba(255,255,255,0.5)");
  });
  it("converts 6-char hex", () => {
    expect(hexToRgba("#0A174C", 0.62)).toBe("rgba(10,23,76,0.62)");
  });
  it("falls back to black-rgba on invalid/empty hex", () => {
    expect(hexToRgba(undefined, 0.3)).toBe("rgba(0,0,0,0.3)");
    expect(hexToRgba("#GGGGGG", 0.3)).toBe("rgba(0,0,0,0.3)");
  });
});

describe("bridgeVars / bridgeCss", () => {
  const COLORS = {
    primary: "#0A174C",
    secondary: "#F4EFE6",
    background: "#F4EFE6",
    text: "#0A174C",
    accent: "#1FAFA6",
    ink: "#0A174C",
  };
  it("maps all six colours onto stylesheet + --brand-* vars", () => {
    const v = bridgeVars(COLORS);
    expect(v["--accent"]).toBe("#1FAFA6");
    expect(v["--ink"]).toBe("#0A174C");
    expect(v["--cream"]).toBe("#F4EFE6");
    expect(v["--brand-primary"]).toBe("#0A174C");
    expect(v["--brand-accent"]).toBe("#1FAFA6");
  });
  it("sanitizes empty/invalid accent+ink to the neutral fallback", () => {
    // safeColor("") yields the "#000000" fallback, so an empty accent/ink resolves
    // to that neutral rather than crashing or emitting an empty CSS value.
    const v = bridgeVars({ ...COLORS, accent: "", ink: "" });
    expect(v["--accent"]).toBe("#000000");
    expect(v["--ink"]).toBe("#000000");
  });
  it("sanitizes a malicious colour before it reaches a CSS var", () => {
    const v = bridgeVars({ ...COLORS, accent: "teal}body{display:none" });
    expect(v["--accent"]).toBe("#000000");
  });
  it("bridgeCss wraps the vars in a :root{…} block", () => {
    const css = bridgeCss(COLORS);
    expect(css.startsWith(":root{")).toBe(true);
    expect(css.endsWith("}")).toBe(true);
    expect(css).toContain("--accent:#1FAFA6;");
  });
});
