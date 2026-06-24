/**
 * @file PreviewPane.tsx
 * @description The right-hand live-preview aside: device-view toggle (all /
 *  desktop / mobile), zoom controls, and the desktop + mobile BuilderPreview
 *  frames. Keeps the `wb-preview-scroll` id the pane ResizeObserver targets.
 * @dependencies react, ../builderStyles, ../icons, ../preview, ../useBuilderState
 * @author WhiteLabel Platform Team
 * @created 2026-06-23
 */
"use client";

import React from "react";
import {
  ASIDE, DEVICE_LABEL, ZOOM_CLUSTER, ZOOM_PCT, ZOOM_RESET_BTN, viewBtnStyle, zoomBtnStyle,
} from "../builderStyles";
import { icon } from "../icons";
import { BuilderPreview } from "../preview";
import type { BuilderApi } from "../useBuilderState";

export function PreviewPane({ api }: { api: BuilderApi }) {
  const {
    previewView, setPreviewView, zoomFactor, setZoomFactor, zoomBy, ZOOM_MIN, ZOOM_MAX, ZOOM_STEP,
    previewConfig, sections, step, selectedSectionId, slug, previewScale, setDeskH, setMobH,
    legalSection,
  } = api;
  return (
    <aside style={ASIDE}>
      <div style={{ height: 50, flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px 0 16px", borderBottom: "1px solid #E0E0E6" }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, letterSpacing: ".1em", color: "#9CA3AF" }}>LIVE PREVIEW</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Device view toggle: all / desktop only / mobile only. */}
          <div style={ZOOM_CLUSTER}>
            <button onClick={() => setPreviewView("all")} title="Desktop + mobile" style={viewBtnStyle(previewView === "all")}>{icon("layers", 14)}</button>
            <button onClick={() => setPreviewView("desktop")} title="Desktop only" style={viewBtnStyle(previewView === "desktop")}>{icon("monitor", 15)}</button>
            <button onClick={() => setPreviewView("mobile")} title="Mobile only" style={viewBtnStyle(previewView === "mobile")}>{icon("smartphone", 15)}</button>
          </div>
          {/* Zoom controls: minus / % / plus, with a reset-to-fit button. */}
          <div style={ZOOM_CLUSTER}>
            <button onClick={() => zoomBy(-ZOOM_STEP)} disabled={zoomFactor <= ZOOM_MIN + 1e-6} title="Zoom out" style={zoomBtnStyle(zoomFactor <= ZOOM_MIN + 1e-6)}>
              {icon("minus", 15)}
            </button>
            <span style={ZOOM_PCT}>{Math.round(zoomFactor * 100)}%</span>
            <button onClick={() => zoomBy(ZOOM_STEP)} disabled={zoomFactor >= ZOOM_MAX - 1e-6} title="Zoom in" style={zoomBtnStyle(zoomFactor >= ZOOM_MAX - 1e-6)}>
              {icon("plus", 15)}
            </button>
            <span style={{ width: 1, height: 16, background: "#E2E2E8", margin: "0 1px" }} />
            <button onClick={() => setZoomFactor(1)} title="Reset to fit" style={ZOOM_RESET_BTN}>
              {icon("zoomReset", 14)}
            </button>
          </div>
        </div>
      </div>

      <div id="wb-preview-scroll" style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "center", gap: 22 }}>
        {/* Desktop frame — real modules in an isolated iframe; shown in "all"/"desktop". */}
        {previewView !== "mobile" && (
          <div style={{ flex: "none" }}>
            <div style={DEVICE_LABEL}>{icon("monitor", 13)}DESKTOP</div>
            <div style={{ borderRadius: 12, overflow: "hidden", boxShadow: "0 6px 22px rgba(16,16,20,.07)" }}>
              <BuilderPreview config={previewConfig} sections={sections} full={false} step={step} selectedSectionId={selectedSectionId} slug={slug} legalSection={legalSection} device="desktop" scale={previewScale} onMeasure={setDeskH} />
            </div>
          </div>
        )}

        {/* Mobile frame — real modules at 375px, content-driven height; "all"/"mobile". */}
        {previewView !== "desktop" && (
          <div style={{ flex: "none" }}>
            <div style={DEVICE_LABEL}>{icon("smartphone", 13)}MOBILE · 375</div>
            <div style={{ borderRadius: 12, overflow: "hidden", boxShadow: "0 6px 22px rgba(16,16,20,.07)" }}>
              <BuilderPreview config={previewConfig} sections={sections} full={false} step={step} selectedSectionId={selectedSectionId} slug={slug} legalSection={legalSection} device="mobile" scale={previewScale} onMeasure={setMobH} />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
