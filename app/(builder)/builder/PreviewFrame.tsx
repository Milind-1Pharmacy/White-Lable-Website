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

/** Build the colour-override <style> so the draft's colours win over the sheet's :root. */
function overrideCss(c: BrandingColors): string {
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

  // (Re)inject the tenant stylesheet, webfonts, and colour overrides into the head.
  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc || !headReady) return;
    const head = doc.head;
    head.querySelectorAll("[data-wb-inject]").forEach((n) => n.remove());

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

    const override = doc.createElement("style");
    override.setAttribute("data-wb-inject", "override");
    override.textContent = overrideCss(colors);
    head.appendChild(override);
  }, [stylesheet, colors, headReady]);

  // Measure the rendered content height and report it (for the parent's fit logic).
  // The tenant stylesheet + webfonts load async and change the layout height, so we
  // re-measure on body resize, on font readiness, and via a few timed retries.
  useEffect(() => {
    const win = iframeRef.current?.contentWindow;
    const doc = iframeRef.current?.contentDocument;
    if (!win || !doc || !body || !onMeasure) return;
    const measure = () => {
      // Measure the content's natural height: the body is set to inline-size so
      // its scrollHeight reflects the laid-out modules, not the iframe's 150px box.
      const h = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
      if (h > 0) {
        setFrameHeight(h);
        onMeasure(h);
      }
    };
    measure();
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      // Observe the body (content) only — observing documentElement would react to
      // our own iframe-height writes and feedback-loop.
      ro = new ResizeObserver(measure);
      ro.observe(doc.body);
    }
    // Webfonts settling shifts heights; re-measure when they're ready.
    doc.fonts?.ready?.then(measure).catch(() => {});
    const timers = [80, 200, 500, 1000].map((ms) => win.setTimeout(measure, ms));
    return () => {
      ro?.disconnect();
      timers.forEach((t) => win.clearTimeout(t));
    };
  }, [body, onMeasure, children, colors, stylesheet]);

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
