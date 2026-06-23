/**
 * @file WebsiteBuilder.tsx
 * @description Composition root for the 1Pharmacy Website Builder. All state and
 *  logic live in useBuilderState(); this file wires that `BuilderApi` into the
 *  page-level layout and the section sub-components (header, left nav, editor,
 *  preview pane, overlays).
 * @dependencies react, ./useBuilderState, ./builderStyles, ./sections/*
 * @author WhiteLabel Platform Team
 * @created 2026-06-22
 * @lastUpdated 2026-06-23
 */
"use client";

import React from "react";
import { ROOT } from "./builderStyles";
import { useBuilderState } from "./useBuilderState";
import { BuilderHeader } from "./sections/BuilderHeader";
import { LeftNav } from "./sections/LeftNav";
import { EditorBody } from "./sections/EditorBody";
import { PreviewPane } from "./sections/PreviewPane";
import { Overlays } from "./sections/Overlays";

export default function WebsiteBuilder() {
  const api = useBuilderState();
  return (
    <div id="wb-root" style={ROOT}>
      <BuilderHeader api={api} />
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <LeftNav api={api} />
        <EditorBody api={api} />
        {!api.veryNarrow && <PreviewPane api={api} />}
      </div>
      <Overlays api={api} />
    </div>
  );
}
