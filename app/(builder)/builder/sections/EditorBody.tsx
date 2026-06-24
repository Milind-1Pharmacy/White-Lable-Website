/**
 * @file EditorBody.tsx
 * @description The centre editor column: step title/subtitle, the editor body
 *  (sections canvas on the Sections step, or the FieldRow list), and the
 *  Back / Continue footer nav. Keeps the `wb-editor-body` id the GSAP stagger
 *  effect targets.
 * @dependencies react, ../builderData, ../builderHelpers, ../builderStyles,
 *  ../icons, ../components/{Hoverable,FieldRow}, ./SectionsCanvas, ../useBuilderState
 * @author WhiteLabel Platform Team
 * @created 2026-06-23
 */
"use client";

import React from "react";
import { STEPS, LEGAL_SECTIONS } from "../builderData";
import { stepSub, stepTitle } from "../builderHelpers";
import { BTN_BACK, BTN_BACK_DETAIL, BTN_NEXT, BTN_PRIMARY, STEP_INDEX } from "../builderStyles";
import { icon } from "../icons";
import { Hoverable } from "../components/Hoverable";
import { FieldRow } from "../components/FieldRow";
import { SectionsCanvas } from "./SectionsCanvas";
import type { BuilderApi } from "../useBuilderState";

export function EditorBody({ api }: { api: BuilderApi }) {
  const { step, setStep, editing, detailLabel, idx, cur, setEditingKey, fields, doPublish, legalSection, setLegalSection } = api;
  return (
    <section style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "#F7F7F9" }}>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: 660, margin: "0 auto", padding: "34px 40px 120px" }}>
          <div style={{ marginBottom: 26 }}>
            <div style={STEP_INDEX}>
              {editing ? "SECTIONS · " + detailLabel.toUpperCase() : "STEP " + (idx + 1) + " / " + STEPS.length + " · " + cur.label.toUpperCase()}
            </div>
            <h1 style={{ fontSize: 27, fontWeight: 700, letterSpacing: "-.02em", margin: "0 0 6px", color: "#18181B" }}>
              {editing ? detailLabel : stepTitle(cur.id)}
            </h1>
            <p style={{ fontSize: 14.5, color: "#71717A", margin: 0, lineHeight: 1.55 }}>
              {editing ? "Edit this block. Changes preview live on the right." : stepSub(cur.id)}
            </p>
          </div>

          <div id="wb-editor-body">
            {/* Sections list */}
            {step === "sections" && !editing && <SectionsCanvas api={api} />}

            {/* Legal step: pick a sub-section (Contact / Terms / Privacy / …);
                the fields below show only that section's content. */}
            {step === "legal" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 26 }}>
                {LEGAL_SECTIONS.map((ls) => {
                  const active = legalSection === ls.id;
                  return (
                    <Hoverable
                      as="button"
                      key={ls.id}
                      onClick={() => setLegalSection(ls.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 11, textAlign: "left",
                        padding: "13px 14px", borderRadius: 13, cursor: "pointer",
                        border: active ? "1.5px solid #2E6ACF" : "1px solid #E6E6EA",
                        background: active ? "#F1F6FD" : "#fff",
                        boxShadow: active ? "0 2px 10px rgba(46,106,207,.10)" : "none",
                      }}
                      hover={active ? {} : { borderColor: "#C7C7CE", background: "#FAFAFB" }}
                    >
                      <span style={{ width: 36, height: 36, borderRadius: 10, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: active ? "#2E6ACF" : "#F1F1F4", color: active ? "#fff" : "#71717A" }}>
                        {icon(ls.icon, 17)}
                      </span>
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: active ? "#1F4FA0" : "#27272A" }}>{ls.label}</span>
                        <span style={{ display: "block", fontSize: 11.5, color: "#A1A1AA", lineHeight: 1.35 }}>{ls.blurb}</span>
                      </span>
                    </Hoverable>
                  );
                })}
              </div>
            )}

            {/* Detail back button */}
            {editing && (
              <Hoverable as="button" onClick={() => setEditingKey(null)} style={BTN_BACK_DETAIL} hover={{ background: "#FAFAFB", borderColor: "#D4D4DB" }}>
                {icon("arrowLeft", 15)}All sections
              </Hoverable>
            )}

            {/* Fields */}
            {(step !== "sections" || editing) &&
              fields.map((f, i) => <FieldRow key={i} f={f} />)}
          </div>

          {/* Footer nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 30, paddingTop: 22, borderTop: "1px solid #ECECEF" }}>
            {editing ? (
              // Editing a single section: the footer isn't wizard navigation, so don't
              // say "Continue" (it implies the next step). Both controls just return to
              // the section list — a "Return to all sections" link + a small "Done".
              <>
                <Hoverable as="button" onClick={() => setEditingKey(null)} style={BTN_BACK} hover={{ background: "#FAFAFB" }}>
                  {icon("arrowLeft", 15)}Return to all sections
                </Hoverable>
                <Hoverable as="button" onClick={() => setEditingKey(null)} style={BTN_PRIMARY} hover={{ background: "#2459B8" }}>
                  {icon("check", 15)}Done
                </Hoverable>
              </>
            ) : (
              <>
                {idx > 0 ? (
                  <Hoverable as="button" onClick={() => { if (idx > 0) { setStep(STEPS[idx - 1].id); setEditingKey(null); } }} style={BTN_BACK} hover={{ background: "#FAFAFB" }}>
                    {icon("arrowLeft", 15)}Back
                  </Hoverable>
                ) : (
                  <span />
                )}
                <Hoverable as="button" onClick={() => { if (idx < STEPS.length - 1) { setStep(STEPS[idx + 1].id); setEditingKey(null); } else doPublish(); }} style={BTN_NEXT} hover={{ background: "#000" }}>
                  {idx < STEPS.length - 1 ? "Continue" : "Review & publish"}
                  {icon("arrowRight", 15)}
                </Hoverable>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
