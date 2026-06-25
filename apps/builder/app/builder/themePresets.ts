/**
 * @file themePresets.ts
 * @description The color-theme presets the builder's Branding step offers. A "theme"
 *  here is just a saved set of the SIX brand colours (primary, secondary, background,
 *  text, accent, ink) — NOT a separate stylesheet. Picking a preset fills the colour
 *  fields; the user can then override any one by typing a hex. Each preset's `name`
 *  also selects the matching token file the published site loads
 *  (public/site-css/themes/<name>.tokens.css) as the default-colour baseline.
 * @dependencies @wl/config-types
 * @author WhiteLabel Platform Team
 * @created 2026-06-24
 */
import type { BrandingColors } from "@wl/config-types";

/** A selectable colour theme: a display label + the six brand colours it sets. */
export type ThemePreset = {
  /** Stable id; also the token-file name shipped to the live site. */
  name: string;
  /** Human label shown in the picker. */
  label: string;
  /** The six brand colours this preset applies to branding.colors. */
  colors: Required<BrandingColors>;
};

/**
 * The built-in presets. `default` (premium neutral) is first so it's the default
 * selection. UrMedz and Aarav reproduce the two original palettes.
 */
export const THEME_PRESETS: ThemePreset[] = [
  {
    name: "default",
    label: "Studio — premium / neutral",
    colors: {
      primary: "#14181F",
      secondary: "#1F8F6B",
      background: "#F6F4EF",
      text: "#14181F",
      accent: "#1F8F6B",
      ink: "#14181F",
    },
  },
  {
    name: "urmedz",
    label: "UrMedz — editorial / cream",
    colors: {
      primary: "#1B2A5B",
      secondary: "#1FAFA6",
      background: "#F4EFE6",
      text: "#1B2A5B",
      accent: "#1FAFA6",
      ink: "#1B2A5B",
    },
  },
  {
    name: "aarav",
    label: "Aarav — blue / teal",
    colors: {
      primary: "#1F5FB8",
      secondary: "#14C6C0",
      background: "#F7FAFC",
      text: "#0E1B2A",
      accent: "#14C6C0",
      ink: "#0E1B2A",
    },
  },
  {
    name: "noir",
    label: "Noir — charcoal / amber",
    colors: {
      primary: "#17171A",
      secondary: "#C8892B",
      background: "#F3F1EC",
      text: "#1A1A1D",
      accent: "#C8892B",
      ink: "#0F0F11",
    },
  },
  {
    name: "botanica",
    label: "Botanica — forest / sand",
    colors: {
      primary: "#1E3D2F",
      secondary: "#9C6B3F",
      background: "#F4F1E8",
      text: "#1E2A22",
      accent: "#3E7C5A",
      ink: "#16241C",
    },
  },
  {
    name: "coral",
    label: "Coral — terracotta / ivory",
    colors: {
      primary: "#7A2E22",
      secondary: "#E0633E",
      background: "#FBF5EE",
      text: "#2B1B16",
      accent: "#E0633E",
      ink: "#3A1E16",
    },
  },
];

/** Default theme name when a config doesn't specify one. */
export const DEFAULT_THEME = "default";

/** Look up a preset by name (falls back to the default premium theme). */
export function presetByName(name: string | undefined): ThemePreset {
  return THEME_PRESETS.find((p) => p.name === name) ?? THEME_PRESETS[0];
}
