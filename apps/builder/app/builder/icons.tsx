/**
 * @file icons.tsx
 * @description Inline SVG icon set for the Website Builder UI.
 * @responsibilities
 *  - Hold the raw SVG path markup for every builder icon.
 *  - Expose an `icon()` helper that renders a stroked 24x24 <svg>.
 * @dependencies react
 * @author WhiteLabel Platform Team
 * @created 2026-06-22
 * @lastUpdated 2026-06-22
 */
import React from "react";

/** Raw inner SVG markup keyed by icon name (24x24 viewBox, stroke-based). */
export const ICON: Record<string, string> = {
  mark: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5" opacity=".55"/>',
  identity:
    '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6.4 16.2c.5-1.4 1.6-2.1 2.6-2.1s2.1.7 2.6 2.1"/><path d="M14.5 10h4M14.5 13.5h4"/>',
  palette:
    '<circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="9.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="9.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="9" cy="15" r="1.1" fill="currentColor" stroke="none"/><path d="M12 21a3 3 0 0 0 0-6 2 2 0 0 1 0-4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.4-3.4"/>',
  sparkles:
    '<path d="M12 4.5l1.5 4 4 1.5-4 1.5L12 15.5l-1.5-4-4-1.5 4-1.5z"/><path d="M18.5 15l.7 1.7 1.8.8-1.8.8-.7 1.7-.7-1.7-1.8-.8 1.8-.8z"/>',
  fileText:
    '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h5"/>',
  briefcase:
    '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  shield:
    '<path d="M12 3l7 3v5c0 4.4-3 7.4-7 9-4-1.6-7-4.6-7-9V6z"/><path d="m9 12 2 2 4-4"/>',
  grip: '<circle cx="9" cy="6" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="1.4" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r="1.4" fill="currentColor" stroke="none"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
  trash:
    '<path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  smartphone: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>',
  check: '<path d="m5 12 5 5 9-11"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  send: '<path d="M22 3 11 14"/><path d="M22 3 15 21l-4-7-7-4z"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  image:
    '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.8"/><path d="m4 18 5-5 4 4 3-3 4 4"/>',
  bar: '<path d="M5 20V10M12 20V4M19 20v-7"/>',
  percent: '<path d="M5 19 19 5"/><circle cx="7.5" cy="7.5" r="2.3"/><circle cx="16.5" cy="16.5" r="2.3"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5l5.5 3.5L10 15.5z" fill="currentColor" stroke="none"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  list: '<path d="M10 6h10M10 12h10M10 18h10"/><path d="M4.5 5 6 4.4V9M4.5 17h2l-2 2.2H6.6"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.6a2.4 2.4 0 0 1 3.9 1.7c0 1.4-1.9 1.9-1.9 2.9"/><circle cx="12" cy="17" r="0.7" fill="currentColor" stroke="none"/>',
  users:
    '<circle cx="9" cy="8" r="3"/><path d="M3.6 20a5.4 5.4 0 0 1 10.8 0"/><path d="M16 5.4a3 3 0 0 1 0 5.5"/><path d="M17.8 14.4A5.4 5.4 0 0 1 20.4 19"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.6 2.5 2.6 15.5 0 18M12 3c-2.6 2.5-2.6 15.5 0 18"/>',
  history:
    '<path d="M3 5v5h5"/><path d="M3.5 10a9 9 0 1 1-.9 4"/><path d="M12 8v4l3 2"/>',
  minus: '<path d="M5 12h14"/>',
  shapes: '<circle cx="8" cy="8" r="3.4"/><rect x="13" y="13" width="7" height="7" rx="1.5"/><path d="M8 14.5 5 20h6z"/>',
  zoomReset: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v4h4"/>',
};

/**
 * icon - Render a named icon as a stroked SVG element.
 * @param {string} name - Key into the ICON map.
 * @param {number} [size=18] - Width/height in px.
 * @param {number} [sw=1.7] - Stroke width.
 * @returns A React <svg> element (empty path if the name is unknown).
 */
export function icon(name: string, size = 18, sw = 1.7): React.ReactElement {
  return React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: sw,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    dangerouslySetInnerHTML: { __html: ICON[name] || "" },
  });
}
