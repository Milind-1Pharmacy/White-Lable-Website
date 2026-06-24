/**
 * @file BuilderHeader.tsx
 * @description Top bar: product logo + name, tenant chip, DRAFT badge, the
 *  Saving/Saved indicator, and the Preview / Publish actions.
 * @dependencies react, ../builderHelpers, ../builderStyles, ../icons,
 *  ../components/Hoverable, ../useBuilderState
 * @author WhiteLabel Platform Team
 * @created 2026-06-23
 */
"use client";

import React from "react";
import { PRODUCT_NAME } from "../builderHelpers";
import {
  BTN_OUTLINE, BTN_PRIMARY, DRAFT_BADGE, HEADER, LOGO_MARK, SPINNER_SM, TENANT_BADGE, TENANT_CHIP,
} from "../builderStyles";
import { icon } from "../icons";
import { Hoverable } from "../components/Hoverable";
import type { BuilderApi } from "../useBuilderState";

export function BuilderHeader({ api }: { api: BuilderApi }) {
  const { config, saved, publishing, doPublish, setPreviewSheetOpen } = api;
  return (
    <header style={HEADER}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        {/* TODO: replace this placeholder mark with the 1Pharmacy logo (drop in an <img src=... />). */}
        <div style={LOGO_MARK}>{icon("mark", 15, 2)}</div>
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-.01em" }}>{PRODUCT_NAME}</span>
      </div>
      <div style={{ width: 1, height: 22, background: "#EAEAEE" }} />
      <Hoverable style={TENANT_CHIP} hover={{ background: "#F4F4F6" }} as="button">
        <span style={TENANT_BADGE}>N</span>
        <span style={{ fontSize: 13.5, fontWeight: 600 }}>{config.tenant.name}</span>
        <span style={{ color: "#A1A1AA", display: "flex" }}>{icon("chevronDown", 15)}</span>
      </Hoverable>
      <span style={DRAFT_BADGE}>DRAFT</span>

      <div style={{ flex: 1 }} />

      <div style={{ display: "flex", alignItems: "center", gap: 7, marginRight: 4 }}>
        {!saved ? (
          <>
            <span style={SPINNER_SM} />
            <span style={{ fontSize: 12.5, color: "#9CA3AF" }}>Saving…</span>
          </>
        ) : (
          <>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
            <span style={{ fontSize: 12.5, color: "#9CA3AF" }}>Saved</span>
          </>
        )}
      </div>

      <Hoverable as="button" onClick={() => setPreviewSheetOpen(true)} style={BTN_OUTLINE} hover={{ background: "#FAFAFB", borderColor: "#D4D4DB" }}>
        <span style={{ display: "flex" }}>{icon("eye", 16)}</span>Preview live site
      </Hoverable>
      <Hoverable as="button" onClick={doPublish} style={BTN_PRIMARY} hover={{ background: "#2457B0" }}>
        <span style={{ display: "flex" }}>{icon("send", 16)}</span>
        {publishing ? "Publishing…" : "Publish"}
      </Hoverable>
    </header>
  );
}
