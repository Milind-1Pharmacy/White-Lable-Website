/**
 * @file builderStyles.ts
 * @description All static inline-style constants and pure style helpers for the
 *  Website Builder UI, extracted from WebsiteBuilder.tsx. None of these read
 *  component state — they are plain CSS-in-JS objects + pure functions.
 * @responsibilities
 *  - Hold the ~45 named React.CSSProperties constants the builder chrome uses.
 *  - Provide pure style functions (active/disabled/toggle variants).
 *  - Provide the deterministic CONFETTI particle data (SSR-safe).
 * @dependencies react (CSSProperties type only)
 * @author WhiteLabel Platform Team
 * @created 2026-06-23
 */
import type React from "react";

// ---------- confetti particles (deterministic to stay SSR-safe) ----------
const CONFETTI_COLORS = ["#2E6ACF", "#22C55E", "#F59E0B", "#EC4899", "#0EA5E9", "#A855F7"];
export const CONFETTI: React.CSSProperties[] = Array.from({ length: 26 }, (_, i) => {
  const c = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
  const w = 6 + ((i * 5) % 8);
  return {
    position: "absolute",
    left: "50%",
    top: "42%",
    width: w,
    height: w * 0.6 + 3,
    background: c,
    borderRadius: 2,
    opacity: 0,
  } as React.CSSProperties;
});

// ---------- static styles ----------
export const ROOT: React.CSSProperties = { height: "100vh", width: "100%", display: "flex", flexDirection: "column", overflow: "hidden", background: "#F1F1F4", fontFamily: "'Hanken Grotesk',-apple-system,system-ui,sans-serif", color: "#1A1A1F" };
export const HEADER: React.CSSProperties = { height: 58, flex: "none", display: "flex", alignItems: "center", gap: 14, padding: "0 18px", background: "#fff", borderBottom: "1px solid #EAEAEE", zIndex: 40, position: "relative" };
export const LOGO_MARK: React.CSSProperties = { width: 28, height: 28, borderRadius: 8, background: "#2E6ACF", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 2px 8px rgba(46,106,207,.35)" };
export const TENANT_CHIP: React.CSSProperties = { display: "flex", alignItems: "center", gap: 7, padding: "5px 10px", borderRadius: 9, border: "1px solid transparent", background: "transparent", cursor: "pointer", color: "#3F3F46" };
export const TENANT_BADGE: React.CSSProperties = { width: 18, height: 18, borderRadius: 5, background: "#1C1917", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700 };
export const DRAFT_BADGE: React.CSSProperties = { fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 500, letterSpacing: ".06em", color: "#9CA3AF", border: "1px solid #EAEAEE", borderRadius: 6, padding: "3px 7px" };
export const SPINNER_SM: React.CSSProperties = { width: 13, height: 13, border: "2px solid #D4D4DB", borderTopColor: "#2E6ACF", borderRadius: "50%", animation: "wb-spin .7s linear infinite", display: "inline-block" };
export const SPINNER_LG: React.CSSProperties = { width: 46, height: 46, border: "3px solid rgba(255,255,255,.25)", borderTopColor: "#fff", borderRadius: "50%", animation: "wb-spin .8s linear infinite" };
export const BTN_OUTLINE: React.CSSProperties = { display: "flex", alignItems: "center", gap: 7, padding: "8px 13px", borderRadius: 10, border: "1px solid #E2E2E8", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#3F3F46" };
export const BTN_PRIMARY: React.CSSProperties = { display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 10, border: "none", background: "#2E6ACF", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#fff", boxShadow: "0 2px 10px rgba(46,106,207,.32)" };
export const NAV: React.CSSProperties = { flex: "none", background: "#fff", borderRight: "1px solid #EAEAEE", display: "flex", flexDirection: "column", padding: "16px 12px", transition: "width .25s" };
export const NAV_LABEL: React.CSSProperties = { fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: ".14em", color: "#B4B4BE", padding: "4px 8px 12px" };
export const STEP_INDEX: React.CSSProperties = { fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: ".1em", color: "#2E6ACF", marginBottom: 9 };
export const ASIDE: React.CSSProperties = { width: "clamp(440px, 42vw, 800px)", flex: "none", background: "#E9E9ED", borderLeft: "1px solid #E0E0E6", display: "flex", flexDirection: "column", minWidth: 0 };
export const DEVICE_LABEL: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: ".14em", color: "#9CA3AF", marginBottom: 10 };
export const ZOOM_CLUSTER: React.CSSProperties = { display: "flex", alignItems: "center", gap: 2, background: "#fff", border: "1px solid #E2E2E8", borderRadius: 9, padding: "2px" };
export const ZOOM_PCT: React.CSSProperties = { fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#52525B", minWidth: 38, textAlign: "center", fontVariantNumeric: "tabular-nums" };
export const ZOOM_RESET_BTN: React.CSSProperties = { width: 26, height: 26, border: "none", background: "transparent", borderRadius: 6, cursor: "pointer", color: "#71717A", display: "flex", alignItems: "center", justifyContent: "center" };
/** Device-view toggle button; tinted when its view is active. */
export function viewBtnStyle(active: boolean): React.CSSProperties {
  return {
    width: 28,
    height: 26,
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: active ? "#2E6ACF" : "transparent",
    color: active ? "#fff" : "#71717A",
  };
}

/** +/- zoom button style; dimmed + non-interactive at a clamp boundary. */
export function zoomBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    width: 26,
    height: 26,
    border: "none",
    borderRadius: 6,
    cursor: disabled ? "default" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    color: disabled ? "#CBD0D6" : "#52525B",
  };
}
export const FIELD_LABEL: React.CSSProperties = { display: "block", fontSize: 12.5, fontWeight: 600, color: "#3F3F46", marginBottom: 7 };
export const FIELD_HELP: React.CSSProperties = { fontSize: 12, color: "#A1A1AA", margin: "7px 0 0", lineHeight: 1.5 };
// Border declared as longhands (not the `border` shorthand) so the focus style can
// toggle `borderColor` alone — mixing shorthand + longhand trips a React rerender warning.
export const TEXT_INPUT: React.CSSProperties = { width: "100%", padding: "11px 13px", borderWidth: 1, borderStyle: "solid", borderColor: "#E4E4EA", borderRadius: 11, fontSize: 14, color: "#18181B", background: "#fff", outline: "none", transition: "border-color .15s,box-shadow .15s" };
export const TEXT_AREA: React.CSSProperties = { ...TEXT_INPUT, lineHeight: 1.55, resize: "none" };
export const UPLOAD_BOX: React.CSSProperties = { display: "flex", alignItems: "center", gap: 14, padding: 16, border: "1.5px dashed #DDDDE3", borderRadius: 13, background: "#FBFBFC", cursor: "pointer", transition: "border-color .15s,background .15s" };
export const TAG_X: React.CSSProperties = { width: 17, height: 17, border: "none", background: "transparent", cursor: "pointer", color: "#A1A1AA", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 5 };
export const SERVICE_X: React.CSSProperties = { position: "absolute", top: 11, right: 11, width: 28, height: 28, border: "none", background: "transparent", cursor: "pointer", color: "#C4C4CC", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 7 };
export const ITEM_COL_LABEL: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 600, color: "#9CA3AF", marginBottom: 4, letterSpacing: ".01em" };
export const ITEM_INPUT: React.CSSProperties = { width: "100%", padding: "7px 9px", border: "1px solid #E4E4EA", borderRadius: 8, fontSize: 13.5, color: "#18181B", background: "#fff", outline: "none" };
export const FRAG_X: React.CSSProperties = { width: 30, height: 30, border: "none", background: "transparent", cursor: "pointer", color: "#C4C4CC", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8 };
export const ADD_DASHED: React.CSSProperties = { alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, padding: "9px 13px", borderRadius: 10, border: "1px dashed #D4D4DB", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#71717A" };
export const ADD_FRAG: React.CSSProperties = { alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 5, marginTop: 3, padding: "6px 11px", borderRadius: 8, border: "1px dashed #D4D4DB", background: "transparent", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "#71717A" };
export const CARD_BTN: React.CSSProperties = { width: 30, height: 30, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: "#9CA3AF", display: "flex", alignItems: "center", justifyContent: "center" };
// Accent drop-indicator line shown where a dragged section card will land.
export const DROP_LINE: React.CSSProperties = { height: 3, borderRadius: 2, margin: "-4px 2px", background: "#2E6ACF", boxShadow: "0 0 0 3px rgba(46,106,207,.18)" };
export const BTN_ADD: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 10, border: "1px solid #CBDDF6", background: "#F1F6FD", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#2E6ACF" };
export const BTN_BACK_DETAIL: React.CSSProperties = { display: "flex", alignItems: "center", gap: 7, marginBottom: 18, padding: "7px 12px 7px 9px", borderRadius: 9, border: "1px solid #E2E2E8", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#52525B" };
export const BTN_BACK: React.CSSProperties = { display: "flex", alignItems: "center", gap: 7, padding: "9px 15px", borderRadius: 10, border: "1px solid #E2E2E8", background: "#fff", cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: "#52525B" };
export const BTN_NEXT: React.CSSProperties = { display: "flex", alignItems: "center", gap: 7, padding: "9px 17px", borderRadius: 10, border: "none", background: "#18181B", cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: "#fff" };
export const PICKER_BACK: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(20,20,26,.36)", backdropFilter: "blur(3px)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 };
export const PICKER_POP: React.CSSProperties = { width: 600, maxWidth: "100%", maxHeight: "84vh", overflowY: "auto", background: "#fff", borderRadius: 20, boxShadow: "0 40px 100px rgba(16,16,20,.4)", padding: 24 };
export const PICKER_CLOSE: React.CSSProperties = { width: 32, height: 32, border: "none", background: "#F4F4F6", borderRadius: 9, cursor: "pointer", color: "#71717A", display: "flex", alignItems: "center", justifyContent: "center" };
export const PICK_ITEM: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12, padding: 14, border: "1px solid #ECECEF", borderRadius: 14, background: "#fff", cursor: "pointer", textAlign: "left", transition: "border-color .15s,box-shadow .15s,transform .12s" };
export const PUBLISH_OVERLAY: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(20,20,26,.5)", backdropFilter: "blur(5px)", zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflow: "hidden" };
export const PUBLISH_CARD: React.CSSProperties = { position: "relative", zIndex: 1, width: 420, maxWidth: "100%", background: "#fff", borderRadius: 22, padding: "36px 32px", textAlign: "center", boxShadow: "0 40px 100px rgba(16,16,20,.45)" };
export const CHECK_RING: React.CSSProperties = { width: 76, height: 76, margin: "0 auto 20px", borderRadius: "50%", background: "#ECFDF3", display: "flex", alignItems: "center", justifyContent: "center" };
export const PUBLISH_BTN_GHOST: React.CSSProperties = { flex: 1, padding: 11, borderRadius: 11, border: "1px solid #E2E2E8", background: "#fff", cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: "#52525B" };
export const PUBLISH_BTN_PRIMARY: React.CSSProperties = { flex: 1, padding: 11, borderRadius: 11, border: "none", background: "#2E6ACF", cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 };
export const PREVIEW_SHEET: React.CSSProperties = { position: "fixed", inset: 0, background: "#E9E9ED", zIndex: 65, display: "flex", flexDirection: "column" };

// ---------- per-instance dynamic style helpers ----------
export function navItemStyle(active: boolean): React.CSSProperties {
  return {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 10px",
    borderRadius: 11,
    border: "1px solid " + (active ? "#D8E4F7" : "transparent"),
    cursor: "pointer",
    textAlign: "left",
    transition: "background .15s,border-color .15s",
    fontFamily: "inherit",
    background: active ? "#F1F6FD" : "transparent",
  };
}
export function navIconStyle(active: boolean, done: boolean): React.CSSProperties {
  return {
    width: 32,
    height: 32,
    borderRadius: 9,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "none",
    transition: "all .2s",
    ...(active
      ? { background: "#2E6ACF", color: "#fff" }
      : done
      ? { background: "#E9F0FB", color: "#2E6ACF" }
      : { background: "#F3F3F5", color: "#9CA3AF" }),
  };
}

/** Line-break toggle button style for a rich fragment; tinted when active. */
export function brStyle(on: boolean): React.CSSProperties {
  return {
    width: 30,
    height: 30,
    borderRadius: 8,
    border: "1px solid " + (on ? "#2E6ACF" : "#E4E4EA"),
    background: on ? "#F1F6FD" : "#fff",
    cursor: "pointer",
    color: on ? "#2E6ACF" : "#A1A1AA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "none",
  };
}

/** Toggle switch track + knob styles; `locked` dims and disables. */
export function switchStyles(on: boolean, locked: boolean) {
  return {
    track: {
      width: 42,
      height: 24,
      borderRadius: 99,
      border: "none",
      position: "relative" as const,
      flex: "none",
      transition: "background .2s",
      cursor: locked ? "not-allowed" : "pointer",
      opacity: locked ? 0.6 : 1,
      background: locked ? "#E4E4EA" : on ? "#2E6ACF" : "#D4D4DB",
    } as React.CSSProperties,
    knob: {
      position: "absolute" as const,
      top: 3,
      left: on ? 21 : 3,
      width: 18,
      height: 18,
      borderRadius: "50%",
      background: "#fff",
      transition: "left .2s",
      boxShadow: "0 1px 2px rgba(0,0,0,.2)",
    } as React.CSSProperties,
  };
}
