import type { BrandingColors, ResolvedConfig } from "@/types/config.types";

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

export function themeStyle(config: ResolvedConfig): React.CSSProperties {
  const colors = resolveColors(config);
  return {
    ["--brand-primary" as string]: colors.primary,
    ["--brand-secondary" as string]: colors.secondary,
    ["--brand-background" as string]: colors.background,
    ["--brand-text" as string]: colors.text,
    ["--brand-accent" as string]: colors.accent,
    ["--brand-ink" as string]: colors.ink,
  } as React.CSSProperties;
}
