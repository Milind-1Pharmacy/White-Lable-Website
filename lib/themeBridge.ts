/**
 * @file themeBridge.ts
 * @description Single source of truth that maps the SIX user-edited brand colours
 *  (primary, secondary, background, text, accent, ink) onto the CSS variables the
 *  shared site stylesheet actually reads (--accent, --ink, --cream, --mute, --line,
 *  plus the --brand-* mirror). Used by BOTH the builder preview (PreviewFrame) and
 *  the deployed site ((site)/layout via themeLoader), so the colours a user picks
 *  apply identically in preview and on the live site. Before this existed the live
 *  site only set --brand-* — which the stylesheet ignores — so it fell back to the
 *  stylesheet's hardcoded colours and the user's choices didn't fully show up.
 * @responsibilities
 *  - safeColor: validate a colour string (defends the injected <style> sink).
 *  - hexToRgba: derive the muted/line translucent colours from the text colour.
 *  - bridgeVars: produce the { cssVarName: value } map from the six brand colours.
 *  - bridgeCss: serialise that map into a `:root{…}` string for an injected <style>.
 * @dependencies @wl/config-types
 * @author WhiteLabel Platform Team
 * @created 2026-06-24
 */
import type { BrandingColors } from "@wl/config-types";

/**
 * Validate a colour string before it reaches an injected <style>. Only hex
 * (#rgb/#rrggbb/#rrggbbaa) and rgb()/rgba()/hsl()/hsla() with safe characters are
 * allowed; anything else (e.g. a CSS-injection breakout like `red}body{…`) falls
 * back to a neutral default. Mirrors the guard PreviewFrame used previously.
 */
const HEX_RE = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const FUNC_RE = /^(?:rgb|rgba|hsl|hsla)\(\s*[0-9.,%\s/]+\)$/i;
export function safeColor(v: string | undefined, fallback = "#000000"): string {
  if (!v || typeof v !== "string") return fallback;
  const s = v.trim();
  return HEX_RE.test(s) || FUNC_RE.test(s) ? s : fallback;
}

/** Minimal hex→rgba (derives the muted/line translucent tones from a base colour). */
export function hexToRgba(hex: string | undefined, a: number): string {
  if (!hex) return `rgba(0,0,0,${a})`;
  let s = hex.replace("#", "");
  if (s.length === 3) s = s.split("").map((x) => x + x).join("");
  const r = parseInt(s.slice(0, 2), 16);
  const g = parseInt(s.slice(2, 4), 16);
  const b = parseInt(s.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return `rgba(0,0,0,${a})`;
  return `rgba(${r},${g},${b},${a})`;
}

/**
 * Map the six brand colours onto every CSS variable the shared stylesheet reads.
 * Both the stylesheet's own tokens (--accent, --ink, --cream, --mute, --line, --navy)
 * and the --brand-* mirror are set, so component rules referencing either name pick
 * up the user's colours. `accent` falls back to `primary`, `ink` falls back to `text`.
 * @returns an object of { "--var": "value" } pairs.
 */
export function bridgeVars(raw: BrandingColors): Record<string, string> {
  const c = {
    primary: safeColor(raw.primary),
    secondary: safeColor(raw.secondary),
    background: safeColor(raw.background, "#ffffff"),
    text: safeColor(raw.text),
    accent: safeColor(raw.accent),
    ink: safeColor(raw.ink),
  };
  const accent = c.accent || c.primary;
  const ink = c.ink || c.text;
  return {
    // Stylesheet's own tokens (what the component rules actually read).
    "--accent": accent,
    "--accent-ink": "#ffffff",
    "--ink": ink,
    "--navy": ink,
    "--cream": c.background,
    "--white": "#ffffff",
    "--mute": hexToRgba(c.text, 0.62),
    "--line": hexToRgba(c.text, 0.12),
    "--line-2": hexToRgba(c.text, 0.06),
    // --brand-* mirror (kept for any rule / inline style referencing these).
    "--brand-primary": c.primary,
    "--brand-secondary": c.secondary,
    "--brand-background": c.background,
    "--brand-text": c.text,
    "--brand-accent": accent,
    "--brand-ink": ink,
  };
}

/** Serialise bridgeVars into a `:root{…}` CSS string for an injected <style>. */
export function bridgeCss(raw: BrandingColors): string {
  const vars = bridgeVars(raw);
  const body = Object.entries(vars)
    .map(([k, v]) => `${k}:${v};`)
    .join("");
  return `:root{${body}}`;
}
