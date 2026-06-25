/**
 * @file themeLoader.ts
 * @description Resolves brand colors and exposes them as CSS variables.
 * @responsibilities
 *  - Merge tenant colors with system fallbacks.
 *  - Emit brand CSS variable strings and React style objects.
 * @dependencies @wl/config-types
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import type { BrandingColors, ResolvedConfig } from "@wl/config-types";
import { bridgeVars } from "@/lib/themeBridge";

/**
 * resolveColors - Merges tenant brand colors with system fallbacks.
 * @param {ResolvedConfig} config - The resolved tenant config.
 * @returns A complete set of six brand colors.
 */
export function resolveColors(config: ResolvedConfig): Required<BrandingColors> {
  const fallback = config.system.branding.fallbackColors;
  const supplied = config.app.branding?.colors;
  const text = supplied?.text || fallback.text;
  return {
    primary: supplied?.primary || fallback.primary,
    secondary: supplied?.secondary || fallback.secondary,
    background: supplied?.background || fallback.background,
    text,
    accent: supplied?.accent || fallback.accent || text,
    ink: supplied?.ink || fallback.ink || text,
  };
}

/**
 * colorsToCssVars - Serializes brand colors into a CSS variable string.
 * @param {Required<BrandingColors>} colors - The resolved brand colors.
 * @returns A CSS declaration string of --brand-* variables.
 */
export function colorsToCssVars(colors: Required<BrandingColors>): string {
  return [
    `--brand-primary: ${colors.primary};`,
    `--brand-secondary: ${colors.secondary};`,
    `--brand-background: ${colors.background};`,
    `--brand-text: ${colors.text};`,
    `--brand-accent: ${colors.accent};`,
    `--brand-ink: ${colors.ink};`,
  ].join(" ");
}

/**
 * themeStyle - Builds an inline style object of the CSS variables the shared site
 * stylesheet reads. Uses the SAME themeBridge the builder preview uses, so a user's
 * brand colours map onto --accent/--ink/--cream/--mute/--line (and the --brand-*
 * mirror) on the LIVE site exactly as they do in preview. Previously this set only
 * --brand-*, which the stylesheet ignores — so the live site fell back to the
 * stylesheet's hardcoded colours and the user's choices didn't fully apply.
 * @param {ResolvedConfig} config - The resolved tenant config.
 * @returns React CSSProperties with the bridged theme variables.
 */
export function themeStyle(config: ResolvedConfig): React.CSSProperties {
  const colors = resolveColors(config);
  return bridgeVars(colors) as React.CSSProperties;
}
