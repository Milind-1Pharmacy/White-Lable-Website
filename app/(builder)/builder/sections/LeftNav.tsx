/**
 * @file LeftNav.tsx
 * @description The left-hand wizard stepper + completion progress meter.
 *  Collapses to icons-only when the window is narrow.
 * @dependencies react, ../builderData, ../builderStyles, ../icons, ../useBuilderState
 * @author WhiteLabel Platform Team
 * @created 2026-06-23
 */
"use client";

import React from "react";
import { DONE, STEPS } from "../builderData";
import { NAV, NAV_LABEL, navIconStyle, navItemStyle } from "../builderStyles";
import { icon } from "../icons";
import type { BuilderApi } from "../useBuilderState";

export function LeftNav({ api }: { api: BuilderApi }) {
  const { step, setStep, setEditingKey, narrow, doneCount, pct } = api;
  return (
    <nav style={{ ...NAV, width: narrow ? 72 : 248 }}>
      {!narrow && <div style={NAV_LABEL}>SETUP</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {STEPS.map((s) => {
          const active = s.id === step;
          const done = !!DONE[s.id];
          return (
            <button key={s.id} onClick={() => { setStep(s.id); setEditingKey(null); }} style={navItemStyle(active)}>
              <span style={navIconStyle(active, done)}>{done && !active ? icon("check", 15, 2.2) : icon(s.icon, 16)}</span>
              {!narrow && (
                <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.25, minWidth: 0 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "#27272A" }}>{s.label}</span>
                  <span style={{ fontSize: 11.5, color: "#A1A1AA", whiteSpace: "nowrap" }}>{s.hint}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
      {!narrow && (
        <div style={{ marginTop: "auto", padding: "14px 8px 4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5, color: "#A1A1AA", marginBottom: 8 }}>
            <span>{doneCount + " of " + STEPS.length + " complete"}</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", color: "#2E6ACF", fontWeight: 500 }}>{pct}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: "#EFEFF2", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#5A8EE0,#2E6ACF)", width: pct + "%", transition: "width .4s" }} />
          </div>
        </div>
      )}
    </nav>
  );
}
