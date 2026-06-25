/**
 * @file PublishLoader.tsx
 * @description The "deploy console" loader shown while a site publishes. A real
 *  publish runs a CodeBuild (~3–5 min), so a bland spinner reads as "stuck". This
 *  is a dark mission-control card: an orbital build animation, a 4-phase vertical
 *  stepper that advances with the backend status, a live elapsed timer, an ease-in
 *  progress arc, an explicit "~5 minutes" expectation, and a Cancel control.
 * @responsibilities
 *  - Map the deploy `stage` to the active stepper phase + a target progress %.
 *  - Animate a determinate-feeling arc that eases toward the phase target.
 *  - Surface elapsed time + the live URL being built, and let the user cancel.
 * @dependencies react, ../icons, ../components/Hoverable
 * @author WhiteLabel Platform Team
 * @created 2026-06-25
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

const ACCENT = "#5B9DFF";
const ACCENT_DEEP = "#2E6ACF";

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
  // correct whether a build takes 3 min or 30 — only the within-phase creep is timed.
  const target = PHASE_TARGET[stage];
  const base = activeIdx > 0 ? PHASE_TARGET[PHASES[activeIdx - 1].key] : 0;
  // Asymptotic creep within the current phase: a slow time-constant (~4 min) so the
  // bar doesn't sprint to the phase target early on a long build, yet always inches
  // forward toward it. The real jump happens when the stage actually advances.
  const sinceStage = Math.min(elapsed, 600);
  const creep = (target - base) * (1 - Math.exp(-sinceStage / 240));
  const pct = Math.min(99, Math.round(base + creep));

  // Past the comfortable window (~10 min): reassure rather than imply it's stuck.
  const slow = elapsed > 600;

  return (
    <div style={CARD}>
      {/* drifting grid texture + top glow */}
      <div aria-hidden style={GRID} />
      <div aria-hidden style={TOPGLOW} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* ── Orbital build animation ── */}
        <div style={ORBIT_WRAP}>
          <div style={{ ...ORBIT, animation: "wb-orbit 7s linear infinite" }} />
          <div style={{ ...ORBIT2, animation: "wb-orbit-rev 11s linear infinite" }} />
          <div style={CORE}>
            <span style={{ ...CORE_GLOW, animation: "wb-glow 2.2s ease-in-out infinite" }} />
            <span style={{ color: "#fff", display: "flex" }}>{icon(PHASES[activeIdx]?.icon ?? "rocket", 26)}</span>
          </div>
        </div>

        {/* ── Headline + expectation ── */}
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <h2 style={HEAD}>Publishing your site</h2>
          <p style={SUB}>
            This usually takes <strong style={{ color: "#fff", fontWeight: 600 }}>a few minutes</strong> — occasionally up to
            ~30 for a first build. Keep this tab open and we&apos;ll show your live link the moment it&apos;s ready.
          </p>
        </div>

        {/* ── Progress bar (ease-in shimmer) ── */}
        <div style={BAR_TRACK}>
          <div style={{ ...BAR_FILL, width: `${pct}%` }}>
            <span style={BAR_SHIMMER} />
          </div>
        </div>
        <div style={METER_ROW}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ ...LIVEDOT, animation: "wb-glow 1.4s ease-in-out infinite" }} />
            <span style={{ color: ACCENT, fontWeight: 600 }}>{pct}%</span>
          </span>
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{clock(elapsed)} elapsed</span>
        </div>

        {/* ── Vertical phase stepper ── */}
        <div style={STEPS}>
          {PHASES.map((p, i) => {
            const done = i < activeIdx;
            const active = i === activeIdx;
            return (
              <div key={p.key} style={{ ...STEP_ROW, opacity: done || active ? 1 : 0.45 }}>
                {/* connector rail */}
                {i < PHASES.length - 1 && (
                  <span style={{ ...RAIL, background: done ? ACCENT_DEEP : "rgba(255,255,255,.12)" }} />
                )}
                {/* node */}
                <span
                  style={{
                    ...NODE,
                    background: done ? ACCENT_DEEP : active ? "rgba(91,157,255,.16)" : "rgba(255,255,255,.05)",
                    borderColor: done ? ACCENT_DEEP : active ? ACCENT : "rgba(255,255,255,.14)",
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
                    <span style={{ color: "rgba(255,255,255,.4)", display: "flex" }}>{icon(p.icon, 13)}</span>
                  )}
                </span>
                {/* labels */}
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ ...STEP_LABEL, color: active ? "#fff" : done ? "rgba(255,255,255,.85)" : "rgba(255,255,255,.6)" }}>
                    {p.label}
                  </span>
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
          <span style={{ display: "flex", color: ACCENT }}>{icon("globe", 14)}</span>
          <span style={URL_TXT}>{liveUrl}</span>
        </div>
        <Hoverable as="button" onClick={onCancel} style={CANCEL} hover={{ background: "rgba(255,255,255,.08)", borderColor: "rgba(255,255,255,.28)" }}>
          Cancel
        </Hoverable>
      </div>
    </div>
  );
}

/* ─────────────────────────── styles ─────────────────────────── */
const CARD: React.CSSProperties = {
  position: "relative", zIndex: 1, width: 440, maxWidth: "100%",
  background: "linear-gradient(180deg,#15151D 0%,#0E0E14 100%)",
  border: "1px solid rgba(255,255,255,.08)", borderRadius: 24,
  padding: "32px 30px 26px", overflow: "hidden",
  boxShadow: "0 50px 120px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.06)",
  animation: "wb-rise .4s cubic-bezier(.2,.7,.2,1) both",
};
const GRID: React.CSSProperties = {
  position: "absolute", inset: "-46px 0 0", zIndex: 0, opacity: 0.5,
  backgroundImage: "linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)",
  backgroundSize: "46px 46px", animation: "wb-grid 3s linear infinite",
  maskImage: "radial-gradient(120% 60% at 50% 0%,#000 0%,transparent 70%)",
  WebkitMaskImage: "radial-gradient(120% 60% at 50% 0%,#000 0%,transparent 70%)",
};
const TOPGLOW: React.CSSProperties = {
  position: "absolute", top: -90, left: "50%", transform: "translateX(-50%)",
  width: 280, height: 200, zIndex: 0, pointerEvents: "none",
  background: "radial-gradient(circle,rgba(91,157,255,.32) 0%,transparent 70%)", filter: "blur(8px)",
};
const ORBIT_WRAP: React.CSSProperties = { position: "relative", width: 96, height: 96, margin: "2px auto 22px" };
const ORBIT: React.CSSProperties = {
  position: "absolute", inset: 0, borderRadius: "50%",
  border: "1.5px solid transparent", borderTopColor: ACCENT, borderRightColor: "rgba(91,157,255,.35)",
};
const ORBIT2: React.CSSProperties = {
  position: "absolute", inset: 12, borderRadius: "50%",
  border: "1.5px solid transparent", borderBottomColor: "rgba(91,157,255,.55)", borderLeftColor: "rgba(91,157,255,.2)",
};
const CORE: React.CSSProperties = {
  position: "absolute", inset: 26, borderRadius: "50%",
  background: "linear-gradient(160deg,#2E6ACF,#173B7A)", display: "flex", alignItems: "center", justifyContent: "center",
  boxShadow: "0 8px 24px rgba(46,106,207,.5)",
};
const CORE_GLOW: React.CSSProperties = {
  position: "absolute", inset: -6, borderRadius: "50%",
  background: "radial-gradient(circle,rgba(91,157,255,.6),transparent 70%)", filter: "blur(6px)", zIndex: -1,
};
const HEAD: React.CSSProperties = { fontSize: 21, fontWeight: 700, letterSpacing: "-.02em", color: "#fff", margin: "0 0 8px" };
const SUB: React.CSSProperties = { fontSize: 13, lineHeight: 1.55, color: "rgba(255,255,255,.6)", margin: "0 auto", maxWidth: 340 };
const BAR_TRACK: React.CSSProperties = {
  position: "relative", height: 7, borderRadius: 999, background: "rgba(255,255,255,.08)", overflow: "hidden", marginBottom: 9,
};
const BAR_FILL: React.CSSProperties = {
  position: "relative", height: "100%", borderRadius: 999,
  background: "linear-gradient(90deg,#2E6ACF,#5B9DFF)", transition: "width .9s cubic-bezier(.2,.7,.2,1)", overflow: "hidden",
};
const BAR_SHIMMER: React.CSSProperties = {
  position: "absolute", inset: 0,
  background: "linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent)",
  backgroundSize: "200% 100%", animation: "wb-bar 1.3s linear infinite",
};
const METER_ROW: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, color: "rgba(255,255,255,.5)", marginBottom: 22, letterSpacing: ".02em",
};
const LIVEDOT: React.CSSProperties = { width: 7, height: 7, borderRadius: "50%", background: ACCENT, display: "inline-block", boxShadow: `0 0 8px ${ACCENT}` };
const STEPS: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 2, marginBottom: 20 };
const STEP_ROW: React.CSSProperties = { position: "relative", display: "flex", alignItems: "center", gap: 12, padding: "8px 0", transition: "opacity .35s" };
const RAIL: React.CSSProperties = { position: "absolute", left: 15, top: 38, width: 2, height: "calc(100% - 12px)", borderRadius: 2, transition: "background .4s" };
const NODE: React.CSSProperties = {
  position: "relative", zIndex: 1, width: 32, height: 32, flex: "none", borderRadius: "50%",
  border: "1.5px solid", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .35s",
};
const DOTS: React.CSSProperties = { display: "flex", alignItems: "center", gap: 3 };
const DOT: React.CSSProperties = { width: 4.5, height: 4.5, borderRadius: "50%", background: ACCENT, display: "block" };
const STEP_LABEL: React.CSSProperties = { display: "block", fontSize: 13.5, fontWeight: 600, letterSpacing: "-.01em" };
const STEP_SUB: React.CSSProperties = { display: "block", fontSize: 11.5, color: "rgba(255,255,255,.42)", marginTop: 1 };
const STATUS_PILL: React.CSSProperties = {
  flex: "none", fontSize: 10.5, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace",
  color: ACCENT, background: "rgba(91,157,255,.14)", border: "1px solid rgba(91,157,255,.3)",
  padding: "3px 9px", borderRadius: 999, letterSpacing: ".02em",
};
const DONE_PILL: React.CSSProperties = {
  flex: "none", fontSize: 10.5, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace",
  color: "rgba(255,255,255,.55)", background: "rgba(255,255,255,.06)", padding: "3px 9px", borderRadius: 999,
};
const URL_ROW: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  padding: "10px 14px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
  borderRadius: 11, marginBottom: 14,
};
const URL_TXT: React.CSSProperties = { fontFamily: "'JetBrains Mono',monospace", fontSize: 12.5, color: "rgba(255,255,255,.78)" };
const CANCEL: React.CSSProperties = {
  width: "100%", padding: 10, borderRadius: 11, border: "1px solid rgba(255,255,255,.16)",
  background: "transparent", color: "rgba(255,255,255,.6)", cursor: "pointer", fontSize: 13, fontWeight: 600,
};
