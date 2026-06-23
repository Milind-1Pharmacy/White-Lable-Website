/**
 * @file Overlays.tsx
 * @description The builder's full-screen overlays: the section picker, the
 *  publish spinner + success/confetti card, and the full-page preview sheet.
 *  Keeps the ids the GSAP effects target (wb-picker-pop, wb-publish-card,
 *  wb-check-path, [data-confetti], wb-preview-sheet-scroll).
 * @dependencies react, ../builderData, ../builderHelpers, ../builderStyles,
 *  ../icons, ../preview, ../components/Hoverable, ../useBuilderState
 * @author WhiteLabel Platform Team
 * @created 2026-06-23
 */
"use client";

import React from "react";
import { PICKER_ORDER, TYPES } from "../builderData";
import { PUBLISH_DOMAIN } from "../builderHelpers";
import {
  BTN_OUTLINE, CHECK_RING, CONFETTI, PICKER_BACK, PICKER_CLOSE, PICKER_POP, PICK_ITEM,
  PREVIEW_SHEET, PUBLISH_BTN_GHOST, PUBLISH_BTN_PRIMARY, PUBLISH_CARD, PUBLISH_OVERLAY, SPINNER_LG,
} from "../builderStyles";
import { icon } from "../icons";
import { BuilderPreview } from "../preview";
import { Hoverable } from "../components/Hoverable";
import type { BuilderApi } from "../useBuilderState";

export function Overlays({ api }: { api: BuilderApi }) {
  const {
    pickerOpen, setPickerOpen, addSection,
    publishing, published, setPublishing, setPublished, slug, siteUrl, publishError, setPublishError,
    publishStage, publishedSiteOpen, setPublishedSiteOpen,
    previewSheetOpen, setPreviewSheetOpen, previewConfig, sections, step, selectedSectionId, sheetScale,
  } = api;
  // Shown live URL: the backend's siteUrl once live, else the placeholder slug domain.
  const liveUrl = siteUrl || slug + "." + PUBLISH_DOMAIN;
  // Human label for the current deploy stage shown while publishing.
  const stageLabel = {
    building: "Building your site…",
    bucket: "Creating storage bucket…",
    deploying: "Deploying to the edge…",
    live: "Live!",
  }[publishStage];
  return (
    <>
      {/* Section picker */}
      {pickerOpen && (
        <div id="wb-picker-back" onClick={() => setPickerOpen(false)} style={PICKER_BACK}>
          <div id="wb-picker-pop" onClick={(e) => e.stopPropagation()} style={PICKER_POP}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
              <div>
                <h2 style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-.01em", margin: "0 0 4px" }}>Add a section</h2>
                <p style={{ fontSize: 13, color: "#A1A1AA", margin: 0 }}>Pick a block to append to your page.</p>
              </div>
              <Hoverable as="button" onClick={() => setPickerOpen(false)} style={PICKER_CLOSE} hover={{ background: "#EAEAEE" }}>{icon("x", 17)}</Hoverable>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {PICKER_ORDER.map((t) => {
                const m = TYPES[t];
                return (
                  <Hoverable as="button" key={t} onClick={() => addSection(t)} style={PICK_ITEM} hover={{ borderColor: "#A9C6EF", boxShadow: "0 6px 18px rgba(16,16,20,.08)", transform: "translateY(-1px)" }}>
                    <span style={{ width: 40, height: 40, borderRadius: 11, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: m.tint, color: m.dot }}>{icon(m.icon, 18)}</span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: "#27272A" }}>{m.label}</span>
                      <span style={{ display: "block", fontSize: 11.5, color: "#A1A1AA", lineHeight: 1.35 }}>{m.blurb}</span>
                    </span>
                  </Hoverable>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Publish overlay */}
      {(publishing || published || publishError) && (
        <div style={PUBLISH_OVERLAY}>
          {publishing && !published && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center" }}>
              <span style={SPINNER_LG} />
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{stageLabel}</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12.5, color: "rgba(255,255,255,.6)", marginTop: 6, letterSpacing: ".04em" }}>{slug + "." + PUBLISH_DOMAIN}</div>
              </div>
            </div>
          )}
          {publishError && !publishing && !published && (
            <div style={PUBLISH_CARD}>
              <h2 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-.02em", margin: "0 0 7px" }}>Couldn&apos;t publish</h2>
              <p style={{ fontSize: 14, color: "#71717A", margin: "0 0 20px", lineHeight: 1.5 }}>{publishError}</p>
              <div style={{ display: "flex", gap: 10 }}>
                <Hoverable as="button" onClick={() => { setPublishError(null); setPublishing(false); setPublished(false); }} style={PUBLISH_BTN_GHOST} hover={{ background: "#FAFAFB" }}>Back to editor</Hoverable>
              </div>
            </div>
          )}
          {published && (
            <div style={{ position: "relative" }}>
              <div id="wb-confetti" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2 }}>
                {CONFETTI.map((c, i) => (
                  <span key={i} data-confetti style={c} />
                ))}
              </div>
              <div id="wb-publish-card" style={PUBLISH_CARD}>
                <div id="wb-check-ring" style={CHECK_RING}>
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="17" stroke="#BBF7D0" strokeWidth="3" />
                    <path id="wb-check-path" d="M12 20.5l5.5 5.5L29 14.5" stroke="#16A34A" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 style={{ fontSize: 23, fontWeight: 700, letterSpacing: "-.02em", margin: "0 0 7px" }}>You&apos;re live! 🎉</h2>
                <p style={{ fontSize: 14, color: "#71717A", margin: "0 0 20px", lineHeight: 1.5 }}>Your site has been published to the edge and is ready to share.</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 14px", background: "#F7F7F9", border: "1px solid #ECECEF", borderRadius: 11, marginBottom: 20 }}>
                  <span style={{ display: "flex", color: "#2E6ACF" }}>{icon("globe", 15)}</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: "#3F3F46" }}>{liveUrl}</span>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Hoverable as="button" onClick={() => { setPublishing(false); setPublished(false); }} style={PUBLISH_BTN_GHOST} hover={{ background: "#FAFAFB" }}>Back to editor</Hoverable>
                  <Hoverable as="button" onClick={() => { setPublishedSiteOpen(true); setPublishing(false); setPublished(false); }} style={PUBLISH_BTN_PRIMARY} hover={{ background: "#2457B0" }}>Visit site {icon("arrowRight", 15)}</Hoverable>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full preview sheet */}
      {previewSheetOpen && (
        <div style={PREVIEW_SHEET}>
          <div style={{ height: 54, flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", background: "#fff", borderBottom: "1px solid #E0E0E6" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: ".1em", color: "#9CA3AF" }}>PREVIEW · {slug + "." + PUBLISH_DOMAIN}</span>
            <Hoverable as="button" onClick={() => setPreviewSheetOpen(false)} style={BTN_OUTLINE} hover={{ background: "#FAFAFB" }}>{icon("x", 17)}Close</Hoverable>
          </div>
          <div id="wb-preview-sheet-scroll" style={{ flex: 1, overflow: "auto", padding: 30 }}>
            <div style={{ width: "max-content", margin: "0 auto", background: "#fff", border: "1px solid #E2E2E8", borderRadius: 14, boxShadow: "0 18px 50px rgba(16,16,20,.14)", overflow: "hidden" }}>
              <BuilderPreview config={previewConfig} sections={sections} full step={step} selectedSectionId={selectedSectionId} slug={slug} device="desktop" scale={sheetScale} />
            </div>
          </div>
        </div>
      )}

      {/* Published "live site" view — the generated site rendered with the real
          modules + chosen theme, dressed as a browser window at the mock URL.
          Demo-only: nothing is actually deployed, this just shows what shipped. */}
      {publishedSiteOpen && (
        <div style={PREVIEW_SHEET}>
          {/* Mock browser chrome — sells the "this is your live site" framing. */}
          <div style={{ height: 48, flex: "none", display: "flex", alignItems: "center", gap: 12, padding: "0 16px", background: "#fff", borderBottom: "1px solid #E0E0E6" }}>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FF5F57" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FEBC2E" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28C840" }} />
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, height: 30, padding: "0 12px", background: "#F4F4F6", borderRadius: 8, color: "#52525B" }}>
              <span style={{ display: "flex", color: "#16A34A" }}>{icon("lock", 13)}</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12.5 }}>{liveUrl}</span>
            </div>
            <Hoverable as="button" onClick={() => setPublishedSiteOpen(false)} style={BTN_OUTLINE} hover={{ background: "#FAFAFB" }}>{icon("x", 17)}Close</Hoverable>
          </div>
          <div style={{ flex: 1, overflow: "auto", background: "#fff", display: "flex", justifyContent: "center" }}>
            {/* Full-width desktop canvas at scale 1 so it reads as a real page. */}
            <BuilderPreview config={previewConfig} sections={sections} full step={step} selectedSectionId={selectedSectionId} slug={slug} device="desktop" scale={1} />
          </div>
        </div>
      )}
    </>
  );
}
