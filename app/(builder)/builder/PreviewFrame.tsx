/**
 * @file PreviewFrame.tsx
 * @description An isolated <iframe> that renders real site modules with the tenant CSS.
 * @responsibilities
 *  - Own a document whose <head> loads the tenant stylesheet + webfonts + colour overrides.
 *  - Portal real React module children into the iframe body (live data, full styling).
 *  - Auto-measure content height and report it so the parent can fit/scale the frame.
 *  - Keep all of the tenant CSS's global selectors out of the builder chrome.
 * @dependencies react, react-dom (createPortal), @/types/config.types
 * @author WhiteLabel Platform Team
 * @created 2026-06-23
 * @lastUpdated 2026-06-23
 */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { BrandingColors } from "@/types/config.types";

type PreviewFrameProps = {
  /** Canvas width the document lays out at (1040 desktop, 375 mobile). */
  width: number;
  /** Tenant stylesheet URL, e.g. "/urmedz.css" or "/aarav_pharmacy.css". */
  stylesheet?: string;
  /** Brand colours from the draft — re-injected so the picker drives the preview. */
  colors: BrandingColors;
  /** Reported whenever the rendered content height changes (CSS px, unscaled). */
  onMeasure?: (height: number) => void;
  /** Marker class so fitPreview can target this frame's <iframe>. */
  bodyClassName?: string;
  children: React.ReactNode;
};

/** Google Fonts the live modules expect (Instrument Serif display + Geist sans). */
const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap";

/**
 * Validate a colour string before it's interpolated into the injected <style>.
 * Only hex (#rgb/#rrggbb/#rrggbbaa) and rgb()/rgba()/hsl()/hsla() with safe chars
 * are allowed; anything else (e.g. a CSS-injection breakout like `red}body{…`)
 * falls back to a neutral default, so config/localStorage can't break out of the
 * rule. Defends against CSS injection / exfiltration in the preview iframe.
 */
const HEX_RE = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const FUNC_RE = /^(?:rgb|rgba|hsl|hsla)\(\s*[0-9.,%\s/]+\)$/i;
function safeColor(v: string | undefined, fallback = "#000000"): string {
  if (!v || typeof v !== "string") return fallback;
  const s = v.trim();
  return HEX_RE.test(s) || FUNC_RE.test(s) ? s : fallback;
}

/** Build the colour-override <style> so the draft's colours win over the sheet's :root. */
function overrideCss(raw: BrandingColors): string {
  // Sanitize EVERY colour up-front — none of these strings may reach the <style>
  // text unchecked (the colour fields accept free text + restore from localStorage).
  const c: BrandingColors = {
    primary: safeColor(raw.primary),
    secondary: safeColor(raw.secondary),
    background: safeColor(raw.background, "#ffffff"),
    text: safeColor(raw.text),
    accent: safeColor(raw.accent),
    ink: safeColor(raw.ink),
  };
  const accent = c.accent || c.primary;
  const ink = c.ink || c.text;
  // Map the builder's six brand tokens onto BOTH the module vars (--accent, --ink,
  // …) and the --brand-* vars, overriding the tenant stylesheet's hardcoded :root.
  return `:root{
    --accent:${accent};
    --ink:${ink};
    --cream:${c.background};
    --mute:${hexToRgba(c.text, 0.62)};
    --line:${hexToRgba(c.text, 0.12)};
    --brand-primary:${c.primary};
    --brand-secondary:${c.secondary};
    --brand-background:${c.background};
    --brand-text:${c.text};
    --brand-accent:${accent};
    --brand-ink:${ink};
    --font-instrument-serif:"Instrument Serif";
    --font-geist-sans:"Geist";
  }
  html,body{margin:0;padding:0;background:transparent;}`;
}

/** Minimal hex→rgba (mirrors the muted/line derivations the live theme uses). */
function hexToRgba(hex: string | undefined, a: number): string {
  if (!hex) return `rgba(0,0,0,${a})`;
  let s = hex.replace("#", "");
  if (s.length === 3) s = s.split("").map((x) => x + x).join("");
  const r = parseInt(s.slice(0, 2), 16);
  const g = parseInt(s.slice(2, 4), 16);
  const b = parseInt(s.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return `rgba(0,0,0,${a})`;
  return `rgba(${r},${g},${b},${a})`;
}

/**
 * PreviewFrame - Renders children inside an isolated iframe styled by the tenant CSS.
 */
export function PreviewFrame({
  width,
  stylesheet,
  colors,
  onMeasure,
  bodyClassName,
  children,
}: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [body, setBody] = useState<HTMLElement | null>(null);
  const [headReady, setHeadReady] = useState(false);
  // The iframe element defaults to 150px tall and would clip content; we set its
  // height to the measured content height so it shows the whole section.
  const [frameHeight, setFrameHeight] = useState(0);

  // Derive the tenant key from the stylesheet filename (e.g. "/urmedz.css" →
  // "urmedz"). Tenant CSS scopes its font bridge + rules to [data-tenant="…"], so
  // the iframe's <html> must carry it for the styling to fully apply.
  const tenant = (stylesheet || "").replace(/^.*\//, "").replace(/\.css$/, "");

  // Write the base document once on mount and capture its <body> as the portal target.
  useEffect(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc) return;
    // A <base href> makes the modules' absolute asset paths (e.g. /urmedz/hero.png)
    // resolve against the app origin instead of the iframe's about:blank URL.
    const base = typeof window !== "undefined" ? window.location.origin + "/" : "/";
    doc.open();
    doc.write(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><base href="${base}"></head><body></body></html>`);
    doc.close();
    setBody(doc.body);
    setHeadReady(true);
  }, []);

  // Keep the tenant attribute on the iframe's <html> in sync.
  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc || !headReady) return;
    if (tenant) doc.documentElement.setAttribute("data-tenant", tenant);
    else doc.documentElement.removeAttribute("data-tenant");
  }, [tenant, headReady]);

  // Inject the webfonts + tenant stylesheet <link>s ONCE per stylesheet. These
  // must NOT be re-created on every render — re-adding the tenant <link> re-fetches
  // and re-applies ~3.6k lines of CSS, flashing the whole frame unstyled (the
  // "everything changes when I edit" symptom). Only the colour override <style>
  // (separate effect below) updates as the picker changes.
  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc || !headReady) return;
    const head = doc.head;
    head.querySelectorAll("[data-wb-inject='fonts'],[data-wb-inject='tenant']").forEach((n) => n.remove());

    const fonts = doc.createElement("link");
    fonts.rel = "stylesheet";
    fonts.href = FONT_LINK;
    fonts.setAttribute("data-wb-inject", "fonts");
    head.appendChild(fonts);

    if (stylesheet) {
      const link = doc.createElement("link");
      link.rel = "stylesheet";
      link.href = stylesheet;
      link.setAttribute("data-wb-inject", "tenant");
      head.appendChild(link);
    }
  }, [stylesheet, headReady]);

  // Update only the colour-override <style> when the picker changes. Keyed on the
  // serialized colour VALUES (not the object identity) so an immutable config
  // clone with unchanged colours doesn't rewrite the head on every keystroke.
  const colorKey = JSON.stringify(colors);
  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc || !headReady) return;
    const head = doc.head;
    let override = head.querySelector<HTMLStyleElement>("[data-wb-inject='override']");
    if (!override) {
      override = doc.createElement("style");
      override.setAttribute("data-wb-inject", "override");
      head.appendChild(override);
    }
    override.textContent = overrideCss(colors);
    // colors is referenced via colorKey to satisfy exhaustive-deps without
    // re-running on a new-but-equal object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorKey, headReady]);

  // Keep the latest onMeasure in a ref so the measure effect below can stay
  // mounted-once. Re-creating it every render (a new closure each time) would
  // otherwise tear down + rebuild the ResizeObserver and re-fit on every
  // keystroke — the "whole preview changes when I edit" churn.
  const onMeasureRef = useRef(onMeasure);
  useEffect(() => {
    onMeasureRef.current = onMeasure;
  }, [onMeasure]);
  // Last reported height — guards against redundant setState/onMeasure calls
  // (the RO can fire with an unchanged height; reporting it would still bubble
  // a new scale up the tree and re-fit the frames for nothing).
  const lastH = useRef(0);

  // Measure the rendered content height and report it (for the parent's fit
  // logic). Set up ONCE (deps: [body]) — the ResizeObserver on the body catches
  // every content/colour/stylesheet-driven layout change, so we never re-arm it
  // per render. The tenant stylesheet + webfonts load async, and on a FAST RELOAD
  // (warm cache) the body can be measured mid-load — laying out narrow/short before
  // the tenant CSS applies. A single measurement then locks the frame at that wrong
  // size. So we re-measure on RO, on font readiness, on stylesheet load, AND poll
  // until the height STABILISES (two consecutive equal reads), which self-corrects
  // regardless of CSS/font timing.
  useEffect(() => {
    const win = iframeRef.current?.contentWindow;
    const doc = iframeRef.current?.contentDocument;
    if (!win || !doc || !body) return;

    // Measure the content's natural height from the BODY only. documentElement's
    // scrollHeight is contaminated by the iframe element height we set below, so
    // using it can feed our own writes back in and lock a stale value.
    const read = () => doc.body.scrollHeight;
    const report = (h: number) => {
      if (h > 0 && Math.abs(h - lastH.current) > 0.5) {
        lastH.current = h;
        setFrameHeight(h);
        onMeasureRef.current?.(h);
      }
    };

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      // Observe the body (content) only — observing documentElement would react to
      // our own iframe-height writes and feedback-loop.
      ro = new ResizeObserver(() => report(read()));
      ro.observe(doc.body);
    }

    // Stabilisation poll: re-measure until two consecutive reads match (layout has
    // settled), capped so we never poll forever. Survives warm-cache fast reloads
    // where the RO + timed retries alone can miss the late reflow.
    let prev = -1;
    let stable = 0;
    let ticks = 0;
    const poll = () => {
      const h = read();
      report(h);
      if (h > 0 && Math.abs(h - prev) < 0.5) stable += 1;
      else stable = 0;
      prev = h;
      ticks += 1;
      // Stop once settled (3 equal reads) or after ~3s of polling.
      if (stable < 3 && ticks < 60) pollT = win.setTimeout(poll, 50);
    };
    let pollT = win.setTimeout(poll, 0);

    // Webfonts settling shifts heights; re-measure (and restart the poll) when ready.
    doc.fonts?.ready?.then(() => { stable = 0; ticks = 0; report(read()); }).catch(() => {});
    // When the injected tenant stylesheet finishes loading, its rules change the
    // layout height — restart the poll so the new height is captured.
    const link = doc.head.querySelector<HTMLLinkElement>("[data-wb-inject='tenant']");
    const onLink = () => { stable = 0; ticks = 0; prev = -1; report(read()); };
    link?.addEventListener("load", onLink);

    return () => {
      ro?.disconnect();
      win.clearTimeout(pollT);
      link?.removeEventListener("load", onLink);
    };
  }, [body, stylesheet, colorKey]);

  return (
    <iframe
      ref={iframeRef}
      title="preview"
      scrolling="no"
      className={bodyClassName}
      style={{ width, height: frameHeight || 600, border: "none", display: "block", overflow: "hidden", background: colors.background }}
    >
      {body ? createPortal(children, body) : null}
    </iframe>
  );
}
