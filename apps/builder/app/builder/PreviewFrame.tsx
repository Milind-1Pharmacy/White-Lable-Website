/**
 * @file PreviewFrame.tsx
 * @description An isolated <iframe> that renders real site modules with the tenant CSS.
 * @responsibilities
 *  - Own a document whose <head> loads the tenant stylesheet + webfonts + colour overrides.
 *  - Portal real React module children into the iframe body (live data, full styling).
 *  - Auto-measure content height and report it so the parent can fit/scale the frame.
 *  - Keep all of the tenant CSS's global selectors out of the builder chrome.
 * @dependencies react, react-dom (createPortal), @wl/config-types
 * @author WhiteLabel Platform Team
 * @created 2026-06-23
 * @lastUpdated 2026-06-23
 */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { BrandingColors } from "@wl/config-types";
import { bridgeVars } from "@wl/render-engine/lib/themeBridge";

type PreviewFrameProps = {
  /** Canvas width the document lays out at (1040 desktop, 375 mobile). */
  width: number;
  /**
   * Site stylesheet URLs loaded into the iframe head, in cascade order — e.g.
   * ["/site-css/blocks.css", "/site-css/themes/urmedz.tokens.css",
   * "/site-css/preview-overrides.css"]. Same shared files the deployed site uses
   * (plus the preview-only overrides), so preview = live.
   */
  stylesheets?: string[];
  /** Brand colours from the draft — re-injected so the picker drives the preview. */
  colors: BrandingColors;
  /** Reported whenever the rendered content height changes (CSS px, unscaled). */
  onMeasure?: (height: number) => void;
  /** Marker class so fitPreview can target this frame's <iframe>. */
  bodyClassName?: string;
  /**
   * "Live site" mode: fill the parent (100% × 100%) and scroll naturally instead
   * of laying out at a fixed canvas width and locking to a measured height. Used
   * by the published "Visit site" view so it renders as a real, responsive page —
   * a true ditto of the deployed site — rather than a scaled thumbnail.
   */
  fill?: boolean;
  children: React.ReactNode;
};

/** Google Fonts the live modules expect (Instrument Serif display + Geist sans). */
const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap";

/**
 * Build the colour-override <style> so the draft's colours win over the sheet's
 * :root. Uses the SHARED themeBridge (the same mapping the deployed site uses), so
 * preview and live render identically, then appends the preview-iframe-only font
 * aliases + html/body reset. The bridge already sanitizes every colour (defends the
 * injected <style> against CSS-injection from the free-text colour fields / a
 * tampered localStorage draft).
 */
function overrideCss(raw: BrandingColors): string {
  const vars = bridgeVars(raw);
  const body = Object.entries(vars)
    .map(([k, v]) => `${k}:${v};`)
    .join("");
  return `:root{${body}--font-instrument-serif:"Instrument Serif";--font-geist-sans:"Geist";}
  html,body{margin:0;padding:0;background:transparent;}`;
}

/**
 * PreviewFrame - Renders children inside an isolated iframe styled by the tenant CSS.
 */
export function PreviewFrame({
  width,
  stylesheets,
  colors,
  onMeasure,
  bodyClassName,
  fill = false,
  children,
}: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [body, setBody] = useState<HTMLElement | null>(null);
  const [headReady, setHeadReady] = useState(false);
  // The iframe element defaults to 150px tall and would clip content; we set its
  // height to the measured content height so it shows the whole section.
  const [frameHeight, setFrameHeight] = useState(0);

  // The shared theme tokens scope the font bridge to the [data-tenant] attribute
  // (any value matches), so the iframe's <html> just needs the attribute present.
  const tenant = "preview";
  // Serialised list of sheet hrefs — used to re-inject only when the set changes.
  const sheetKey = (stylesheets || []).join("|");

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
    doc.documentElement.setAttribute("data-tenant", tenant);
  }, [tenant, headReady]);

  // Inject the webfonts + the site stylesheet <link>s ONCE per stylesheet set. These
  // must NOT be re-created on every render — re-adding the <link>s re-fetches and
  // re-applies the CSS, flashing the whole frame unstyled (the "everything changes
  // when I edit" symptom). Only the colour override <style> (separate effect below)
  // updates as the picker changes.
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

    // Append each site sheet in order (blocks → theme tokens → preview overrides).
    (stylesheets || []).forEach((href) => {
      const link = doc.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.setAttribute("data-wb-inject", "tenant");
      head.appendChild(link);
    });
    // sheetKey drives re-injection when the set changes; stylesheets is read inside.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetKey, headReady]);

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
    // When an injected site stylesheet finishes loading, its rules change the layout
    // height — restart the poll so the new height is captured. Listen on every sheet.
    const links = Array.from(doc.head.querySelectorAll<HTMLLinkElement>("[data-wb-inject='tenant']"));
    const onLink = () => { stable = 0; ticks = 0; prev = -1; report(read()); };
    links.forEach((l) => l.addEventListener("load", onLink));

    return () => {
      ro?.disconnect();
      win.clearTimeout(pollT);
      links.forEach((l) => l.removeEventListener("load", onLink));
    };
  }, [body, sheetKey, colorKey]);

  // Live-site ("fill") mode: the iframe fills its parent and scrolls itself, so the
  // page lays out at the real viewport width (responsive) — a true ditto of deploy.
  // Default mode: fixed canvas width, height locked to the measured content so the
  // parent can transform-scale it as a thumbnail.
  const frameStyle: React.CSSProperties = fill
    ? { width: "100%", height: "100%", border: "none", display: "block", background: colors.background }
    : { width, height: frameHeight || 600, border: "none", display: "block", overflow: "hidden", background: colors.background };

  return (
    <iframe
      ref={iframeRef}
      title="preview"
      scrolling={fill ? "auto" : "no"}
      className={bodyClassName}
      style={frameStyle}
    >
      {body ? createPortal(children, body) : null}
    </iframe>
  );
}
