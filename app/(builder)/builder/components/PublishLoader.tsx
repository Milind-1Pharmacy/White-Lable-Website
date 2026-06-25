/**
 * @file PublishLoader.tsx
 * @description The light "launch pad" loader shown while a site publishes. A real
 *  publish runs a backend CodeBuild (minutes), so a bare spinner reads as "stuck".
 *  This is a refined WHITE card on the brand blue (#2E6ACF): a glowing orbital core,
 *  a soft aurora + dotted-grid backdrop for depth, a 4-phase stepper that advances
 *  with the backend status, a live elapsed timer, an ease-in progress arc, a clear
 *  "up to ~10 min" expectation, and a Cancel control.
 * @responsibilities
 *  - Map the deploy `stage` to the active stepper phase + a target progress %.
 *  - Animate a determinate-feeling arc that eases toward the phase target.
 *  - Surface elapsed time + the live URL being built, and let the user cancel.
 * @dependencies react, ../icons, ../components/Hoverable
 * @author WhiteLabel Platform Team
 * @created 2026-06-25
 * @lastUpdated 2026-06-25
 */
"use client";

import React from "react";
import { icon } from "../icons";
import { Hoverable } from "./Hoverable";

/** The deploy stages, in order — each is one row in the vertical stepper. */
const PHASES = [
  { key: "building", label: "Building your site", sub: "Compiling pages & assets", icon: "layers" },
  { key: "bucket", label: "Provisioning storage", sub: "Creating the S3 bucket", icon: "grid" },
  { key: "deploying", label: "Deploying to the edge", sub: "Syncing to the CDN", icon: "globe" },
  { key: "live", label: "Going live", sub: "Final checks & cache warm-up", icon: "sparkles" },
] as const;

type Stage = (typeof PHASES)[number]["key"];

/** Each phase ends at this cumulative % — the arc eases toward the active one. */
const PHASE_TARGET: Record<Stage, number> = { building: 38, bucket: 64, deploying: 88, live: 99 };

/* ── Brand palette (light theme) ──────────────────────────────── */
const BRAND = "#2E6ACF";       // primary accent
const BRAND_DEEP = "#1E4E9E";  // deeper accent (done / hover)
const BRAND_SOFT = "#EAF1FC";  // tinted fill
const BRAND_LINE = "#D3E3F8";  // tinted border
const INK = "#16233B";         // headings
const MUTE = "#6B7686";        // body / secondary
const FAINT = "#9AA4B2";       // tertiary

/** mm:ss from whole seconds. */
function clock(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function PublishLoader({
  stage,
  elapsed,
  liveUrl,
  onCancel,
}: {
  stage: Stage;
  elapsed: number;
  liveUrl: string;
  onCancel: () => void;
}) {
  const activeIdx = PHASES.findIndex((p) => p.key === stage);

  // Ease-in progress that creeps toward the active phase's target so the bar keeps
  // visibly moving between status polls (never sits frozen, never claims 100%). The
  // arc is driven by the real STAGE (backend status), not wall-clock, so it stays
  // correct whether a build takes 3 min or 10 — only the within-phase creep is timed.
  const target = PHASE_TARGET[stage];
  const base = activeIdx > 0 ? PHASE_TARGET[PHASES[activeIdx - 1].key] : 0;
  const sinceStage = Math.min(elapsed, 600);
  const creep = (target - base) * (1 - Math.exp(-sinceStage / 240));
  const pct = Math.min(99, Math.round(base + creep));

  // Past the comfortable window (~6 min): reassure rather than imply it's stuck.
  const slow = elapsed > 360;

  return (
    <div style={CARD}>
      {/* atmosphere: aurora glow + faint dotted grid */}
      <div aria-hidden style={AURORA} />
      <div aria-hidden style={DOTGRID} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* ── Orbital build animation ── */}
        <div style={ORBIT_WRAP}>
          <span aria-hidden style={{ ...HALO, animation: "wb-glow 2.6s ease-in-out infinite" }} />
          <div style={{ ...ORBIT, animation: "wb-orbit 7s linear infinite" }} />
          <div style={{ ...ORBIT2, animation: "wb-orbit-rev 11s linear infinite" }} />
          <div style={CORE}>
            <span style={{ color: "#fff", display: "flex" }}>{icon(PHASES[activeIdx]?.icon ?? "sparkles", 25)}</span>
          </div>
        </div>

        {/* ── Headline + expectation ── */}
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <span style={EYEBROW}>
            <span style={{ ...PULSE, animation: "wb-glow 1.4s ease-in-out infinite" }} />
            PUBLISHING
          </span>
          <h2 style={HEAD}>We&apos;re launching your site</h2>
          <p style={SUB}>
            This usually takes <strong style={{ color: INK, fontWeight: 600 }}>a few minutes</strong> — up to
            ~10 for a first build. Keep this tab open and we&apos;ll show your live link the moment it&apos;s ready.
          </p>
        </div>

        {/* ── Progress bar (ease-in shimmer) ── */}
        <div style={BAR_TRACK}>
          <div style={{ ...BAR_FILL, width: `${pct}%` }}>
            <span style={BAR_SHIMMER} />
          </div>
        </div>
        <div style={METER_ROW}>
          <span style={{ color: BRAND, fontWeight: 700 }}>{pct}%</span>
          <span style={{ fontVariantNumeric: "tabular-nums", color: FAINT }}>{clock(elapsed)} elapsed</span>
        </div>

        {/* ── Vertical phase stepper ── */}
        <div style={STEPS}>
          {PHASES.map((p, i) => {
            const done = i < activeIdx;
            const active = i === activeIdx;
            return (
              <div key={p.key} style={{ ...STEP_ROW, opacity: done || active ? 1 : 0.6 }}>
                {/* connector rail */}
                {i < PHASES.length - 1 && (
                  <span style={{ ...RAIL, background: done ? BRAND : "#E6EAF0" }} />
                )}
                {/* node */}
                <span
                  style={{
                    ...NODE,
                    background: done ? BRAND : active ? BRAND_SOFT : "#fff",
                    borderColor: done ? BRAND : active ? BRAND : "#E2E6EC",
                    boxShadow: active ? `0 0 0 4px rgba(46,106,207,.12)` : "none",
                  }}
                >
                  {done ? (
                    <span style={{ display: "flex", color: "#fff", animation: "wb-tick-in .3s ease both" }}>{icon("check", 14, 3)}</span>
                  ) : active ? (
                    <span style={DOTS}>
                      <i style={{ ...DOT, animation: "wb-dot 1.1s ease-in-out infinite" }} />
                      <i style={{ ...DOT, animation: "wb-dot 1.1s ease-in-out .18s infinite" }} />
                      <i style={{ ...DOT, animation: "wb-dot 1.1s ease-in-out .36s infinite" }} />
                    </span>
                  ) : (
                    <span style={{ color: FAINT, display: "flex" }}>{icon(p.icon, 13)}</span>
                  )}
                </span>
                {/* labels */}
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ ...STEP_LABEL, color: active ? INK : done ? "#3B4961" : MUTE }}>{p.label}</span>
                  <span style={STEP_SUB}>{active && slow ? "Still working — almost there…" : p.sub}</span>
                </span>
                {active && <span style={STATUS_PILL}>In progress</span>}
                {done && <span style={DONE_PILL}>Done</span>}
              </div>
            );
          })}
        </div>

        {/* ── URL + cancel ── */}
        <div style={URL_ROW}>
          <span style={{ display: "flex", color: BRAND }}>{icon("globe", 14)}</span>
          <span style={URL_TXT}>{liveUrl}</span>
        </div>
        <Hoverable as="button" onClick={onCancel} style={CANCEL} hover={{ background: "#F4F6F9", borderColor: "#CBD3DE", color: MUTE }}>
          Cancel
        </Hoverable>
      </div>
    </div>
  );
}

/* ─────────────────────────── styles ─────────────────────────── */
const CARD: React.CSSProperties = {
  position: "relative", zIndex: 1, width: 444, maxWidth: "100%",
  background: "#FFFFFF", border: "1px solid #EAEDF2", borderRadius: 26,
  padding: "30px 30px 24px", overflow: "hidden",
  boxShadow: "0 32px 80px rgba(30,78,158,.18), 0 4px 16px rgba(16,24,40,.06)",
  animation: "wb-rise .45s cubic-bezier(.2,.7,.2,1) both",
};
const AURORA: React.CSSProperties = {
  position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)",
  width: 420, height: 280, zIndex: 0, pointerEvents: "none",
  background: "radial-gradient(60% 60% at 50% 40%, rgba(46,106,207,.20) 0%, rgba(46,106,207,.07) 45%, transparent 72%)",
  filter: "blur(6px)",
};
const DOTGRID: React.CSSProperties = {
  position: "absolute", inset: 0, zIndex: 0, opacity: 0.7, pointerEvents: "none",
  backgroundImage: "radial-gradient(rgba(46,106,207,.10) 1px, transparent 1px)",
  backgroundSize: "18px 18px",
  maskImage: "radial-gradient(120% 70% at 50% 0%, #000 0%, transparent 62%)",
  WebkitMaskImage: "radial-gradient(120% 70% at 50% 0%, #000 0%, transparent 62%)",
};
const ORBIT_WRAP: React.CSSProperties = { position: "relative", width: 90, height: 90, margin: "4px auto 20px" };
const HALO: React.CSSProperties = {
  position: "absolute", inset: -10, borderRadius: "50%", zIndex: 0,
  background: "radial-gradient(circle, rgba(46,106,207,.28), transparent 68%)", filter: "blur(7px)",
};
const ORBIT: React.CSSProperties = {
  position: "absolute", inset: 0, borderRadius: "50%", zIndex: 1,
  border: "1.5px solid transparent", borderTopColor: BRAND, borderRightColor: "rgba(46,106,207,.28)",
};
const ORBIT2: React.CSSProperties = {
  position: "absolute", inset: 11, borderRadius: "50%", zIndex: 1,
  border: "1.5px solid transparent", borderBottomColor: "rgba(46,106,207,.5)", borderLeftColor: "rgba(46,106,207,.16)",
};
const CORE: React.CSSProperties = {
  position: "absolute", inset: 24, borderRadius: "50%", zIndex: 2,
  background: `linear-gradient(155deg, #4A86E8, ${BRAND_DEEP})`,
  display: "flex", alignItems: "center", justifyContent: "center",
  boxShadow: "0 10px 22px rgba(46,106,207,.40), inset 0 1px 0 rgba(255,255,255,.4)",
};
const EYEBROW: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 12,
  padding: "4px 11px", borderRadius: 999, background: BRAND_SOFT, border: `1px solid ${BRAND_LINE}`,
  fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, fontWeight: 700, letterSpacing: ".14em", color: BRAND,
};
const PULSE: React.CSSProperties = { width: 6, height: 6, borderRadius: "50%", background: BRAND, display: "inline-block", boxShadow: `0 0 6px ${BRAND}` };
const HEAD: React.CSSProperties = { fontSize: 21, fontWeight: 700, letterSpacing: "-.02em", color: INK, margin: "0 0 8px" };
const SUB: React.CSSProperties = { fontSize: 13, lineHeight: 1.55, color: MUTE, margin: "0 auto", maxWidth: 344 };
const BAR_TRACK: React.CSSProperties = {
  position: "relative", height: 8, borderRadius: 999, background: "#EDF1F6", overflow: "hidden", marginBottom: 9,
  boxShadow: "inset 0 1px 2px rgba(16,24,40,.05)",
};
const BAR_FILL: React.CSSProperties = {
  position: "relative", height: "100%", borderRadius: 999,
  background: `linear-gradient(90deg, ${BRAND_DEEP}, #5B9DFF)`, transition: "width .9s cubic-bezier(.2,.7,.2,1)", overflow: "hidden",
};
const BAR_SHIMMER: React.CSSProperties = {
  position: "absolute", inset: 0,
  background: "linear-gradient(90deg, transparent, rgba(255,255,255,.65), transparent)",
  backgroundSize: "200% 100%", animation: "wb-bar 1.3s linear infinite",
};
const METER_ROW: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, marginBottom: 22, letterSpacing: ".02em",
};
const STEPS: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 2, marginBottom: 18 };
const STEP_ROW: React.CSSProperties = { position: "relative", display: "flex", alignItems: "center", gap: 12, padding: "7px 0", transition: "opacity .35s" };
const RAIL: React.CSSProperties = { position: "absolute", left: 15, top: 36, width: 2, height: "calc(100% - 10px)", borderRadius: 2, transition: "background .4s" };
const NODE: React.CSSProperties = {
  position: "relative", zIndex: 1, width: 32, height: 32, flex: "none", borderRadius: "50%",
  border: "1.5px solid", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .35s",
};
const DOTS: React.CSSProperties = { display: "flex", alignItems: "center", gap: 3 };
const DOT: React.CSSProperties = { width: 4.5, height: 4.5, borderRadius: "50%", background: BRAND, display: "block" };
const STEP_LABEL: React.CSSProperties = { display: "block", fontSize: 13.5, fontWeight: 600, letterSpacing: "-.01em" };
const STEP_SUB: React.CSSProperties = { display: "block", fontSize: 11.5, color: FAINT, marginTop: 1 };
const STATUS_PILL: React.CSSProperties = {
  flex: "none", fontSize: 10.5, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace",
  color: BRAND, background: BRAND_SOFT, border: `1px solid ${BRAND_LINE}`,
  padding: "3px 9px", borderRadius: 999, letterSpacing: ".02em",
};
const DONE_PILL: React.CSSProperties = {
  flex: "none", fontSize: 10.5, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace",
  color: "#7C8696", background: "#F2F4F7", padding: "3px 9px", borderRadius: 999,
};
const URL_ROW: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  padding: "10px 14px", background: "#F7F9FC", border: "1px solid #E8EDF3",
  borderRadius: 12, marginBottom: 12,
};
const URL_TXT: React.CSSProperties = { fontFamily: "'JetBrains Mono',monospace", fontSize: 12.5, color: "#41506A" };
const CANCEL: React.CSSProperties = {
  width: "100%", padding: 10, borderRadius: 12, border: "1px solid #E2E6EC",
  background: "#fff", color: FAINT, cursor: "pointer", fontSize: 13, fontWeight: 600,
};
