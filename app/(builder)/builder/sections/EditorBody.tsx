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
import { STEPS } from "../builderData";
import { stepSub, stepTitle } from "../builderHelpers";
import { BTN_BACK, BTN_BACK_DETAIL, BTN_NEXT, STEP_INDEX } from "../builderStyles";
import { icon } from "../icons";
import { Hoverable } from "../components/Hoverable";
import { FieldRow } from "../components/FieldRow";
import { SectionsCanvas } from "./SectionsCanvas";
import type { BuilderApi } from "../useBuilderState";

export function EditorBody({ api }: { api: BuilderApi }) {
  const { step, setStep, editing, detailLabel, idx, cur, setEditingKey, fields, doPublish } = api;
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
          </div>
        </div>
      </div>
    </section>
  );
}
