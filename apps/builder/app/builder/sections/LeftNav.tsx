/**
 * @file LeftNav.tsx
 * @description The left drawer: brand lockup, the wizard stepper, and the
 *  completion meter. A premium icon RAIL by default that expands on hover and
 *  can be PINNED open.
 *  - Collapsed: an INVERTED deep-blue (#2E6ACF) rail with white foreground.
 *  - Hovered (not pinned): the full LIGHT panel floats OVER the editor (a peek).
 *  - Pinned: the LIGHT panel takes real layout width so the editor reflows beside
 *    it (content never hidden).
 * @dependencies react, ../builderData, ../builderStyles, ../icons, ../useBuilderState
 * @author WhiteLabel Platform Team
 * @created 2026-06-23
 * @lastUpdated 2026-06-24
 */
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { DONE, STEPS } from "../builderData";
import { NAV_LABEL, navItemStyle } from "../builderStyles";
import { icon } from "../icons";
import type { BuilderApi } from "../useBuilderState";

/** Rail widths: slim icon rail vs the expanded panel. */
const RAIL_W = 84;
const PANEL_W = 272;
/** localStorage key for the pinned-open preference. */
const PIN_KEY = "wb:navPinned";

/** Icon-chip style for a step. `dark` = the inverted collapsed rail (white on blue). */
function iconChip(active: boolean, done: boolean, dark: boolean): React.CSSProperties {
  const base: React.CSSProperties = {
    width: 34, height: 34, borderRadius: 9, flex: "none",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all .2s",
  };
  if (dark) {
    return {
      ...base,
      background: active ? "#fff" : "rgba(255,255,255,.12)",
      color: active ? "#2E6ACF" : "rgba(255,255,255,.92)",
    };
  }
  return {
    ...base,
    ...(active
      ? { background: "#2E6ACF", color: "#fff" }
      : done
      ? { background: "#E9F0FB", color: "#2E6ACF" }
      : { background: "#F3F3F5", color: "#9CA3AF" }),
  };
}

/** A compact circular progress ring for the collapsed rail. Inverts on the blue rail. */
function ProgressRing({ pct, dark }: { pct: number; dark: boolean }) {
  const r = 15;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div style={{ position: "relative", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={40} height={40} viewBox="0 0 40 40" style={{ transform: "rotate(-90deg)" }}>
        <circle cx={20} cy={20} r={r} fill="none" stroke={dark ? "rgba(255,255,255,.22)" : "#ECECF1"} strokeWidth={3.5} />
        <circle
          cx={20} cy={20} r={r} fill="none" stroke={dark ? "#fff" : "#2E6ACF"} strokeWidth={3.5}
          strokeLinecap="round" strokeDasharray={`${dash} ${c}`}
          style={{ transition: "stroke-dasharray .45s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <span style={{ position: "absolute", fontSize: 9.5, fontWeight: 700, color: dark ? "#fff" : "#2E6ACF", fontFamily: "'JetBrains Mono',monospace" }}>
        {pct}
      </span>
    </div>
  );
}

export function LeftNav({ api }: { api: BuilderApi }) {
  const { step, setStep, setEditingKey, veryNarrow, doneCount, pct } = api;
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Restore the pin preference AFTER mount (not in useState's initializer) so the
  // server and first client render agree (no hydration mismatch).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try { setPinned(localStorage.getItem(PIN_KEY) === "1"); } catch { /* ignore */ }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const togglePin = () => {
    setPinned((p) => {
      const next = !p;
      try { localStorage.setItem(PIN_KEY, next ? "1" : "0"); } catch { /* ignore */ }
      return next;
    });
  };

  const canExpand = !veryNarrow;
  const open = canExpand && (pinned || hovered);
  // dark = the inverted collapsed look (only when truly collapsed).
  const dark = !open;
  // Pinned reserves real layout width; hover peeks as an overlay over a slim slot.
  const slotWidth = pinned && canExpand ? PANEL_W : RAIL_W;
  const floating = open && !pinned;

  return (
    <div style={{ position: "relative", flex: "none", width: slotWidth, transition: "width .22s cubic-bezier(.4,0,.2,1)", zIndex: 50 }}>
      <nav
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "absolute",
          inset: 0,
          width: open ? PANEL_W : RAIL_W,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: dark ? "#2E6ACF" : "#fff",
          borderRight: dark ? "none" : "1px solid #EAEAEE",
          transition: "width .22s cubic-bezier(.4,0,.2,1), box-shadow .22s ease, background .2s ease",
          boxShadow: floating ? "10px 0 34px rgba(16,16,20,.16)" : "none",
        }}
      >
        {/* Brand lockup — aligned to the header height (58) for a clean top line. */}
        <div style={{ display: "flex", alignItems: "center", gap: 11, height: 58, flex: "none", padding: open ? "0 16px" : "0 25px", borderBottom: "1px solid " + (dark ? "rgba(255,255,255,.14)" : "#F0F0F3") }}>
          {/* The 1Pharmacy mark on a white chip in BOTH states, so the blue glyph
              stays visible on the blue collapsed rail and the white expanded panel. */}
          <span
            style={{
              width: 36, height: 36, borderRadius: 10, flex: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "#fff",
              border: dark ? "none" : "1px solid #ECECF1",
              boxShadow: dark ? "0 2px 8px rgba(0,0,0,.14)" : "0 1px 3px rgba(16,16,20,.06)",
              transition: "all .2s",
            }}
          >
            <Image src="/1p_logo.png" alt="1Pharmacy" width={20} height={28} style={{ height: 22, width: "auto", display: "block" }} priority />
          </span>
          <span style={{ display: open ? "flex" : "none", flexDirection: "column", lineHeight: 1.15, whiteSpace: "nowrap" }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: "-.01em", color: "#18181B" }}>1Pharmacy</span>
            <span style={{ fontSize: 10.5, fontWeight: 500, color: "#9CA3AF", letterSpacing: ".02em" }}>Website Builder</span>
          </span>
        </div>

        {/* Body: SETUP label + pin toggle — shown ONLY when expanded. The collapsed
            rail is just the logo + step icons (no confusing lock chip). */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: open ? "14px 12px 4px" : "14px 0 4px", minHeight: 0 }}>
          {open && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2px 10px", minHeight: 24 }}>
              <span style={{ ...NAV_LABEL, padding: 0, whiteSpace: "nowrap" }}>SETUP</span>
              <button
                onClick={togglePin}
                title={pinned ? "Unpin sidebar" : "Pin sidebar open"}
                aria-label={pinned ? "Unpin sidebar" : "Pin sidebar open"}
                style={{
                  width: 30, height: 30, borderRadius: 8, flex: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "1px solid " + (pinned ? "#D8E4F7" : "transparent"),
                  background: pinned ? "#F1F6FD" : "transparent",
                  color: pinned ? "#2E6ACF" : "#B4B4BE",
                  transition: "all .15s",
                }}
              >
                {icon(pinned ? "lock" : "chevronRight", 15)}
              </button>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: open ? "stretch" : "center" }}>
            {STEPS.map((s) => {
              const active = s.id === step;
              const done = !!DONE[s.id];
              const lightActive = !dark && active;
              return (
                <button
                  key={s.id}
                  onClick={() => { setStep(s.id); setEditingKey(null); }}
                  title={open ? undefined : s.label}
                  style={{
                    ...(open ? navItemStyle(lightActive) : { display: "flex", alignItems: "center", justifyContent: "center", padding: 0, width: 44, height: 44, borderRadius: 11, border: "none", cursor: "pointer", background: "transparent", fontFamily: "inherit" }),
                    justifyContent: open ? "flex-start" : "center",
                  }}
                >
                  {/* The step's OWN icon (so it's identifiable), with a small tick
                      BADGE overlaid when that step is complete. */}
                  <span style={{ position: "relative", flex: "none" }}>
                    <span style={iconChip(active, done, dark)}>{icon(s.icon, 16)}</span>
                    {done && !active && (
                      <span
                        aria-label="complete"
                        style={{
                          position: "absolute", right: -3, bottom: -3,
                          width: 15, height: 15, borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: "#22C55E", color: "#fff",
                          border: "2px solid " + (dark ? "#2E6ACF" : "#fff"),
                        }}
                      >
                        {icon("check", 9, 3)}
                      </span>
                    )}
                  </span>
                  <span
                    style={{
                      display: open ? "flex" : "none",
                      flexDirection: "column", alignItems: "flex-start", lineHeight: 1.25, minWidth: 0,
                    }}
                  >
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#27272A", whiteSpace: "nowrap" }}>{s.label}</span>
                    <span style={{ fontSize: 11.5, color: "#A1A1AA", whiteSpace: "nowrap" }}>{s.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Progress: a compact % ring when collapsed (inverted), full bar when open. */}
          <div style={{ marginTop: "auto", padding: open ? "14px 8px 8px" : "14px 0 12px", display: "flex", justifyContent: "center" }}>
            {open ? (
              <div style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5, color: "#A1A1AA", marginBottom: 8 }}>
                  <span style={{ whiteSpace: "nowrap" }}>{doneCount + " of " + STEPS.length + " complete"}</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", color: "#2E6ACF", fontWeight: 500 }}>{pct}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: "#EFEFF2", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#5A8EE0,#2E6ACF)", width: pct + "%", transition: "width .4s" }} />
                </div>
              </div>
            ) : (
              <ProgressRing pct={pct} dark={dark} />
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
