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
    publishing, published, setPublishing, setPublished, slug, siteUrl, siteIsLive, publishError, setPublishError,
    publishStage,
    publishIssues, setPublishIssues, jumpToIssue,
    previewSheetOpen, setPreviewSheetOpen, previewConfig, sections, step, selectedSectionId,
  } = api;
  // Blocking validation errors gate publishing; warnings are advisory only.
  const blockingCount = publishIssues.filter((x) => x.severity === "error").length;
  // Group issues by their section/step label for the summary panel.
  const issueGroups = publishIssues.reduce<Record<string, typeof publishIssues>>((acc, x) => {
    (acc[x.group] ||= []).push(x);
    return acc;
  }, {});
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
                <p style={{ fontSize: 13, color: "#A1A1AA", margin: 0 }}>
                  Pick a block to append to your page.
                  <span style={{ color: "#52525B", fontWeight: 600 }}> {sections.length} section{sections.length === 1 ? "" : "s"} on your page.</span>
                </p>
              </div>
              <Hoverable as="button" onClick={() => setPickerOpen(false)} style={PICKER_CLOSE} hover={{ background: "#EAEAEE" }}>{icon("x", 17)}</Hoverable>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {PICKER_ORDER.map((t) => {
                const m = TYPES[t];
                // How many of THIS section type are already on the page.
                const added = sections.filter((s) => s.type === t).length;
                return (
                  <Hoverable as="button" key={t} onClick={() => addSection(t)} style={{ ...PICK_ITEM, position: "relative" }} hover={{ borderColor: "#A9C6EF", boxShadow: "0 6px 18px rgba(16,16,20,.08)", transform: "translateY(-1px)" }}>
                    <span style={{ width: 40, height: 40, borderRadius: 11, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: m.tint, color: m.dot }}>{icon(m.icon, 18)}</span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: "#27272A" }}>{m.label}</span>
                      <span style={{ display: "block", fontSize: 11.5, color: "#A1A1AA", lineHeight: 1.35 }}>{m.blurb}</span>
                    </span>
                    {added > 0 && (
                      <span title={`${added} already on your page`} style={{ position: "absolute", top: 9, right: 10, display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999, background: "#EAF1FC", border: "1px solid #D3E3F8", fontSize: 10.5, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", color: "#2457B0" }}>
                        {icon("check", 11)}{added} added
                      </span>
                    )}
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
                  {siteIsLive && siteUrl && (
                    <Hoverable as="button" onClick={() => {
                      // Only ever open a REAL deployed URL in a new tab. There is no
                      // in-app "preview of the not-yet-deployed site" anymore.
                      window.open(/^https?:\/\//.test(siteUrl) ? siteUrl : `https://${siteUrl}`, "_blank", "noopener,noreferrer");
                      setPublishing(false); setPublished(false);
                    }} style={PUBLISH_BTN_PRIMARY} hover={{ background: "#2457B0" }}>Visit site {icon("arrowRight", 15)}</Hoverable>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pre-publish validation summary — shown when Publish is blocked by content
          issues. Issues are grouped by section; each row jumps to that section/step. */}
      {publishIssues.length > 0 && (
        <div style={PUBLISH_OVERLAY}>
          <div style={{ ...PUBLISH_CARD, width: "min(520px, 92vw)", textAlign: "left", maxHeight: "82vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
              <span style={{ width: 38, height: 38, flex: "none", borderRadius: 11, background: "#FEF2F2", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon("x", 19)}</span>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.02em", margin: "0 0 3px" }}>Fix {blockingCount} {blockingCount === 1 ? "issue" : "issues"} before publishing</h2>
                <p style={{ fontSize: 13, color: "#71717A", margin: 0, lineHeight: 1.5 }}>Your site can&apos;t go live until these are resolved. Click one to jump to it.</p>
              </div>
            </div>
            <div style={{ overflowY: "auto", margin: "10px -4px 0", padding: "0 4px", display: "flex", flexDirection: "column", gap: 16 }}>
              {Object.entries(issueGroups).map(([group, items]) => (
                <div key={group}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 7 }}>{group}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {items.map((iss, k) => (
                      <Hoverable
                        as="button"
                        key={k}
                        onClick={() => jumpToIssue(iss)}
                        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 10, border: "1px solid #ECECEF", background: "#fff", cursor: "pointer", fontSize: 13, color: "#3F3F46" }}
                        hover={{ borderColor: "#A9C6EF", background: "#FAFBFE" }}
                      >
                        <span style={{ width: 7, height: 7, borderRadius: "50%", flex: "none", background: iss.severity === "error" ? "#DC2626" : "#D97706" }} />
                        <span style={{ flex: 1 }}>{iss.message}</span>
                        <span style={{ display: "flex", color: "#C4C4CC" }}>{icon("arrowRight", 14)}</span>
                      </Hoverable>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
              <Hoverable as="button" onClick={() => setPublishIssues([])} style={PUBLISH_BTN_GHOST} hover={{ background: "#FAFAFB" }}>Back to editor</Hoverable>
            </div>
          </div>
        </div>
      )}

      {/* Full preview sheet */}
      {previewSheetOpen && (
        <div style={PREVIEW_SHEET}>
          <div style={{ height: 54, flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", background: "#fff", borderBottom: "1px solid #E0E0E6" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#71717A" }}>
              <span style={{ display: "flex", color: "#16A34A" }}>{icon("eye", 14)}</span>
              <span>How your site will look deployed · <b style={{ color: "#3F3F46", fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>{slug + "." + PUBLISH_DOMAIN}</b></span>
            </span>
            <Hoverable as="button" onClick={() => setPreviewSheetOpen(false)} style={BTN_OUTLINE} hover={{ background: "#FAFAFB" }}>{icon("x", 17)}Close</Hoverable>
          </div>
          <div id="wb-preview-sheet-scroll" style={{ flex: 1, overflow: "hidden", background: "#fff" }}>
            {/* Full-bleed, 100%-width render in published mode: real tenant stylesheet,
                real viewport width, natural scroll — a true ditto of the deployed site.
                No centered max-content card / scale cap. */}
            <BuilderPreview config={previewConfig} sections={sections} full published step={step} selectedSectionId={selectedSectionId} slug={slug} device="desktop" />
          </div>
        </div>
      )}
    </>
  );
}
