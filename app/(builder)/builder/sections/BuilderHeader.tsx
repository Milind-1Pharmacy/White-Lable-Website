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
import Image from "next/image";
import {
  BTN_OUTLINE, BTN_PRIMARY, DRAFT_BADGE, HEADER, SPINNER_SM,
} from "../builderStyles";
import { icon } from "../icons";
import { Hoverable } from "../components/Hoverable";
import { safeSrc } from "@/lib/safeUrl";
import type { BuilderApi } from "../useBuilderState";

export function BuilderHeader({ api }: { api: BuilderApi }) {
  const { config, saved, publishing, doPublish, setPreviewSheetOpen } = api;
  // The website's own logo (if the config has one) + its name. NOT a tenant
  // switcher — there's no multi-site dropdown here, just an identity label.
  const siteLogo = safeSrc(config.branding?.logo) || safeSrc(config.branding?.logoFull);
  return (
    // Brand lockup (1Pharmacy) lives in the left drawer; the header just identifies
    // the website being edited — its logo (when present) and name.
    <header style={HEADER}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        {siteLogo && (
          <Image
            src={siteLogo}
            alt={config.tenant.name}
            width={24}
            height={24}
            style={{ height: 22, width: "auto", maxWidth: 80, display: "block", objectFit: "contain" }}
          />
        )}
        <span style={{ fontSize: 14, fontWeight: 600, color: "#27272A" }}>{config.tenant.name}</span>
      </div>
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
