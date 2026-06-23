/**
 * @file WebsiteBuilder.tsx
 * @description The 1Pharmacy Website Builder: a guided wizard that authors an AppConfig draft.
 * @responsibilities
 *  - Hold the in-memory AppConfig draft + UI state (step, selection, overlays).
 *  - Render the header, left-nav stepper, editor fields, sections canvas and preview.
 *  - Mirror compliance rules in the UI (locked payments/cart, safe-CTA hints).
 *  - Animate transitions with GSAP (Flip-gated) and simulate autosave + publish.
 * @dependencies react, gsap, ./builderData, ./preview, ./icons, @/types/config.types
 * @author WhiteLabel Platform Team
 * @created 2026-06-22
 * @lastUpdated 2026-06-22
 */
"use client";

/*
 * react-hooks/refs is disabled for this file: the editor builds its field/handler
 * descriptors during render (buildFields/buildCoreFields/…), and those handlers
 * transitively reach ref-reading helpers (markDirty → saveT/rm). The refs are only
 * ever read when a handler actually fires (an event/effect), never during render,
 * so the rule's "ref accessed during render" warning is a false positive here.
 */
/* eslint-disable react-hooks/refs */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import type { AppConfig } from "@/types/config.types";
import {
  CORE,
  DEFAULTS,
  type BuilderSectionType,
  DONE,
  INITIAL,
  PICKER_ORDER,
  STEPS,
  TYPES,
  type DraftSection,
  type StepId,
} from "./builderData";
import { icon } from "./icons";
import { BuilderPreview, PREVIEW_BASE_WIDTH, PREVIEW_MOBILE_WIDTH } from "./preview";

/** Join a RichHeading's parts (or a plain string) into one display string. */
function headingText(rh: { parts: Array<{ text: string }> } | string | undefined): string {
  if (!rh) return "";
  if (typeof rh === "string") return rh;
  return (rh.parts || []).map((p) => p.text).join("");
}

/** Whether the visitor prefers reduced motion (resolved once on the client). */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** A field descriptor consumed by the editor renderer. */
type Field = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [k: string]: any;
  kind:
    | "text"
    | "area"
    | "color"
    | "upload"
    | "tags"
    | "toggle"
    | "rich"
    | "services"
    | "group"
    | "note";
};

/** Deep clone helper (mirrors the design's JSON round-trip for immutable updates). */
function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

/** Build a RichHeading from a single plain string. */
function richOf(text: string) {
  return { parts: [{ text }] };
}

let SEQ = 100;
/** Generate a stable client-side section id. */
function genId(): string {
  return "s" + SEQ++;
}

/** Product name shown in the header (placeholder until final branding lands). */
const PRODUCT_NAME = "1Pharmacy Website Builder";
/** Short label for the published-site placeholder domain. */
const PUBLISH_DOMAIN = "1pharmacy.site";

/*
 * Builder chrome palette — white theme with a #2E6ACF primary. The original
 * purple accent family maps to blue as: #5B57E6→#2E6ACF (primary),
 * #4A45D9→#2457B0 (hover), #7C79EE→#5A8EE0 (gradient), tints
 * #ECEBFD/#F6F5FE→#E9F0FB/#F1F6FD, borders #C7C4F7/#E4E2FB→#A9C6EF/#D8E4F7,
 * and rgba(91,87,230,*) focus/shadow → rgba(46,106,207,*).
 */

export default function WebsiteBuilder() {
  const [step, setStep] = useState<StepId>("sections");
  const [config, setConfig] = useState<AppConfig>(() => INITIAL().config);
  const [sections, setSections] = useState<DraftSection[]>(() => INITIAL().sections);
  const [saved, setSaved] = useState(true);
  const [dragId, setDragId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [previewSheetOpen, setPreviewSheetOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("hero");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [win, setWin] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1440);
  // Which device frame(s) the preview shows.
  const [previewView, setPreviewView] = useState<"all" | "desktop" | "mobile">("all");
  // Preview zoom: a user multiplier on top of the fit-to-pane base (1 = fit),
  // driven by +/- buttons and clamped to [ZOOM_MIN, ZOOM_MAX].
  const [zoomFactor, setZoomFactor] = useState(1);
  const ZOOM_MIN = 0.4;
  const ZOOM_MAX = 2.5;
  const ZOOM_STEP = 0.1;

  // Measured iframe content heights (CSS px, unscaled) + the preview pane box size.
  // Scale is derived from these so the visible frame(s) fit the pane width AND height.
  const [deskH, setDeskH] = useState(0);
  const [mobH, setMobH] = useState(0);
  const [paneW, setPaneW] = useState(0);
  const [paneH, setPaneH] = useState(0);
  const [sheetW, setSheetW] = useState(0);

  const zoomBy = (delta: number) =>
    setZoomFactor((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round((z + delta) * 100) / 100)));

  const rm = useRef(false);
  const dragRef = useRef<string | null>(null);
  const saveT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pubT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flipState = useRef<unknown>(null);
  const flipAddId = useRef<string | null>(null);
  const FlipRef = useRef<typeof import("gsap/Flip").Flip | null>(null);
  const prevStep = useRef<StepId>(step);
  const prevPicker = useRef(false);
  const prevPublished = useRef(false);

  // ---------- derived ----------
  const narrow = win < 1180;
  const veryNarrow = win < 900;
  const idx = Math.max(0, STEPS.findIndex((s) => s.id === step));
  const cur = STEPS[idx] || STEPS[0];
  const editing = step === "sections" && !!editingKey;

  const slug = useMemo(
    () =>
      (config.tenant.name || "site")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    [config.tenant.name]
  );

  // ---------- lifecycle ----------
  useEffect(() => {
    rm.current = prefersReducedMotion();
    // Register Flip if it's available in this build; degrade gracefully otherwise.
    let alive = true;
    import("gsap/Flip")
      .then((m) => {
        if (!alive) return;
        FlipRef.current = m.Flip;
        try {
          gsap.registerPlugin(m.Flip);
        } catch {
          /* ignore */
        }
      })
      .catch(() => {
        /* Flip not bundled — reorder will skip the FLIP animation */
      });
    const onResize = () => setWin(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => {
      alive = false;
      window.removeEventListener("resize", onResize);
      if (saveT.current) clearTimeout(saveT.current);
      if (pubT.current) clearTimeout(pubT.current);
    };
  }, []);

  // Every view fits the visible frame(s) into the pane BOX (width AND height) so the
  // component is fully visible without scrolling. "all" stacks both frames; the
  // single-frame views fit that one frame. The user zoom factor multiplies on top.
  const previewScale = (() => {
    const LABEL = 26; // per-frame device label row
    const GAP = 22; // gap between stacked frames
    const availW = paneW - 40; // pane horizontal padding (20 each side)
    const availH = paneH - 40;
    if (availW <= 0 || availH <= 0) return 1;
    let scale: number;
    if (previewView === "desktop") {
      const wLimit = availW / PREVIEW_BASE_WIDTH;
      const hLimit = deskH > 0 ? (availH - LABEL) / deskH : wLimit;
      scale = Math.min(wLimit, hLimit);
    } else if (previewView === "mobile") {
      const wLimit = availW / PREVIEW_MOBILE_WIDTH;
      const hLimit = mobH > 0 ? (availH - LABEL) / mobH : wLimit;
      scale = Math.min(wLimit, hLimit);
    } else {
      const wLimit = availW / Math.max(PREVIEW_BASE_WIDTH, PREVIEW_MOBILE_WIDTH);
      const totalH = deskH + mobH;
      const hLimit = totalH > 0 ? (availH - 2 * LABEL - GAP) / totalH : wLimit;
      scale = Math.min(wLimit, hLimit);
    }
    return Math.max(0.05, scale) * zoomFactor;
  })();

  // Full preview sheet: fit-to-width only (it scrolls vertically), capped at 1×.
  const sheetScale = sheetW > 0 ? Math.min(1, (sheetW - 60) / PREVIEW_BASE_WIDTH) : 1;

  // Entry/stagger animations on step change + initial mount.
  const animEditor = useCallback(() => {
    if (rm.current) return;
    gsap.from("#wb-editor-body > *", { y: 14, opacity: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" });
  }, []);
  const animCards = useCallback(() => {
    if (rm.current) return;
    gsap.from(".wb-sec-card", { y: 16, opacity: 0, duration: 0.45, stagger: 0.06, ease: "power2.out", clearProps: "transform,opacity" });
  }, []);

  // Track the preview pane's box size; previewScale derives from it (+ measured
  // frame heights), so no imperative fit pass is needed.
  useEffect(() => {
    const el = document.getElementById("wb-preview-scroll");
    if (!el || typeof ResizeObserver === "undefined") return;
    // RO fires once on observe(), so the initial size is captured without a
    // synchronous setState in the effect body.
    const ro = new ResizeObserver(() => {
      setPaneW(el.clientWidth);
      setPaneH(el.clientHeight);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [veryNarrow]);

  // Track the full preview sheet width (only mounted while open) for its fit scale.
  // ResizeObserver fires its callback once on observe(), so we read width there.
  useEffect(() => {
    if (!previewSheetOpen || typeof ResizeObserver === "undefined") return;
    const el = document.getElementById("wb-preview-sheet-scroll");
    if (!el) return;
    const ro = new ResizeObserver(() => setSheetW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, [previewSheetOpen]);

  // Re-run editor entry animations when the step changes.
  useEffect(() => {
    if (prevStep.current !== step) {
      animEditor();
      if (step === "sections") animCards();
      prevStep.current = step;
    }
  }, [step, animEditor, animCards]);

  // FLIP the section reorder once the new order is committed.
  useEffect(() => {
    const Flip = FlipRef.current;
    if (flipState.current && Flip && !rm.current) {
      const st = flipState.current;
      flipState.current = null;
      Flip.from(st as never, { duration: 0.45, ease: "power2.inOut", absolute: true });
    }
    if (flipAddId.current) {
      const id = flipAddId.current;
      flipAddId.current = null;
      const n = document.querySelector<HTMLElement>('[data-id="' + id + '"]');
      if (n && !rm.current) {
        n.style.overflow = "hidden";
        gsap.from(n, { height: 0, opacity: 0, marginTop: -11, duration: 0.42, ease: "power2.out", clearProps: "height,opacity,marginTop,overflow" });
      }
    }
  }, [sections]);

  // Picker pop-in.
  useEffect(() => {
    if (pickerOpen && !prevPicker.current && !rm.current) {
      gsap.from("#wb-picker-pop", { scale: 0.94, opacity: 0, y: 10, duration: 0.34, ease: "back.out(1.5)" });
      gsap.from("#wb-picker-back", { opacity: 0, duration: 0.2 });
    }
    prevPicker.current = pickerOpen;
  }, [pickerOpen]);

  const animPublish = useCallback(() => {
    const path = document.getElementById("wb-check-path") as unknown as SVGPathElement | null;
    if (path) {
      try {
        const len = path.getTotalLength();
        if (!rm.current) {
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
          gsap.to(path, { strokeDashoffset: 0, duration: 0.5, delay: 0.15, ease: "power2.out" });
        }
      } catch {
        /* ignore */
      }
    }
    if (!rm.current) {
      gsap.from("#wb-check-ring", { scale: 0.5, opacity: 0, duration: 0.4, ease: "back.out(2)" });
      gsap.from("#wb-publish-card", { scale: 0.92, opacity: 0, y: 12, duration: 0.42, ease: "power2.out" });
      document.querySelectorAll<HTMLElement>("[data-confetti]").forEach((n, i) => {
        const a = ((i * 137.5) % 360) * (Math.PI / 180);
        const dist = 110 + (i % 7) * 28;
        gsap.set(n, { opacity: 1, x: 0, y: 0, scale: 0.5 + (i % 5) * 0.16 });
        gsap.to(n, { x: Math.cos(a) * dist, y: Math.sin(a) * dist - 30, rotation: (i % 13) * 32 - 200, opacity: 0, duration: 1.1 + (i % 4) * 0.18, ease: "power2.out", delay: (i % 5) * 0.02 });
      });
    }
  }, []);

  // Publish success animation (check draw + confetti).
  useEffect(() => {
    if (published && !prevPublished.current) animPublish();
    prevPublished.current = published;
  }, [published, animPublish]);

  // ---------- mutations ----------
  const markDirty = useCallback(() => {
    setSaved(false);
    if (saveT.current) clearTimeout(saveT.current);
    saveT.current = setTimeout(() => setSaved(true), 900);
  }, []);

  /** Apply an immutable mutation to the config draft. */
  const setCfg = useCallback(
    (mutator: (c: AppConfig) => void) => {
      setConfig((prev) => {
        const c = clone(prev);
        mutator(c);
        return c;
      });
      markDirty();
    },
    [markDirty]
  );

  function reorderTo(targetId: string) {
    const d = dragRef.current;
    if (!d || d === targetId) return;
    setSections((arr) => {
      const from = arr.findIndex((s) => s.id === d);
      const to = arr.findIndex((s) => s.id === targetId);
      if (from < 0 || to < 0) return arr;
      const next = arr.slice();
      const [m] = next.splice(from, 1);
      next.splice(to, 0, m);
      const Flip = FlipRef.current;
      if (Flip && !rm.current) flipState.current = Flip.getState(".wb-sec-card");
      return next;
    });
    markDirty();
  }

  function dupSection(id: string) {
    setSections((arr) => {
      const i = arr.findIndex((s) => s.id === id);
      if (i < 0) return arr;
      const copy = { id: genId(), type: arr[i].type, data: clone(arr[i].data) } as DraftSection;
      const next = arr.slice();
      next.splice(i + 1, 0, copy);
      flipAddId.current = copy.id;
      return next;
    });
    markDirty();
  }

  function removeSection(id: string) {
    const node = document.querySelector<HTMLElement>('[data-id="' + id + '"]');
    const finish = () => {
      setSections((arr) => arr.filter((s) => s.id !== id));
      markDirty();
    };
    if (node && !rm.current) {
      node.style.height = node.offsetHeight + "px";
      node.style.overflow = "hidden";
      gsap.to(node, { height: 0, opacity: 0, marginTop: -11, duration: 0.32, ease: "power2.in", onComplete: finish });
    } else finish();
  }

  function addSection(type: BuilderSectionType) {
    const sec = { id: genId(), type, data: DEFAULTS(type) } as DraftSection;
    flipAddId.current = sec.id;
    setPickerOpen(false);
    setSections((arr) => arr.concat([sec]));
    setSelectedSectionId(sec.id);
    markDirty();
  }

  function doPublish() {
    if (publishing || published) return;
    setPublishing(true);
    setPublished(false);
    if (pubT.current) clearTimeout(pubT.current);
    pubT.current = setTimeout(() => setPublished(true), 1150);
  }

  // ---------- section heading/eyebrow helpers ----------
  function setSectionHeading(id: string, val: string) {
    setSections((arr) => arr.map((s) => (s.id === id ? ({ ...s, data: { ...s.data, heading: richOf(val) } } as DraftSection) : s)));
    markDirty();
  }
  function setSectionEyebrow(id: string, val: string) {
    setSections((arr) => arr.map((s) => (s.id === id ? ({ ...s, data: { ...s.data, eyebrow: val } } as DraftSection) : s)));
    markDirty();
  }

  function sectionSummary(sec: DraftSection): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d: any = sec.data || {};
    const n = (d.items || d.images || d.steps || d.tiles || d.departments || []).length;
    const t = sec.type;
    if (t === "features") return n + " feature cards";
    if (t === "gallery") return n + " images";
    if (t === "stats") return n + " metrics";
    if (t === "faq") return n + " questions";
    if (t === "howItWorks") return n + " steps";
    if (t === "team") return n + " departments";
    if (t === "savings") return n + " rows";
    if (t === "aiStore") return n + " tiles";
    if (t === "videoFeature") return "Video block";
    if (t === "appStrip") return "App download";
    return n + " items";
  }
  function itemsNote(sec: DraftSection): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d: any = sec.data || {};
    const n = (d.items || d.images || d.steps || d.tiles || d.departments || []).length;
    return n ? "Manage " + n + " item" + (n === 1 ? "" : "s") + " in the full editor" : "No items yet";
  }
  function coreSummary(key: string): string {
    const C = config;
    if (key === "hero") {
      const t = headingText(C.content.hero.headlineRich) || C.content.hero.headline;
      return t.length > 42 ? t.slice(0, 42) + "…" : t;
    }
    if (key === "about") return headingText(C.content.about?.title) || "Your story";
    if (key === "services") {
      const n = (C.content.services || []).length;
      return n + " service" + (n === 1 ? "" : "s");
    }
    return "";
  }

  // ---------- field builders ----------
  function brStyle(on: boolean): React.CSSProperties {
    return {
      width: 30,
      height: 30,
      borderRadius: 8,
      border: "1px solid " + (on ? "#2E6ACF" : "#E4E4EA"),
      background: on ? "#F1F6FD" : "#fff",
      cursor: "pointer",
      color: on ? "#2E6ACF" : "#A1A1AA",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: "none",
    };
  }
  function switchStyles(on: boolean, locked: boolean) {
    return {
      track: {
        width: 42,
        height: 24,
        borderRadius: 99,
        border: "none",
        position: "relative" as const,
        flex: "none",
        transition: "background .2s",
        cursor: locked ? "not-allowed" : "pointer",
        opacity: locked ? 0.6 : 1,
        background: locked ? "#E4E4EA" : on ? "#2E6ACF" : "#D4D4DB",
      } as React.CSSProperties,
      knob: {
        position: "absolute" as const,
        top: 3,
        left: on ? 21 : 3,
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: "#fff",
        transition: "left .2s",
        boxShadow: "0 1px 2px rgba(0,0,0,.2)",
      } as React.CSSProperties,
    };
  }

  function buildFields(s: StepId): Field[] {
    const C = config;
    let out: Field[] = [];
    if (s === "identity")
      out = [
        { kind: "text", label: "Business name", value: C.tenant.name, placeholder: "e.g. Northwind Bakehouse", help: "Shown in the header, footer and browser tab.", onChange: (e: InputEvt) => setCfg((c) => (c.tenant.name = e.target.value)) },
        { kind: "text", label: "Category", value: C.tenant.category, placeholder: "e.g. Artisan Bakery & Café", help: "A short descriptor of what you do.", onChange: (e: InputEvt) => setCfg((c) => (c.tenant.category = e.target.value)) },
      ];
    else if (s === "branding") {
      out = [{ kind: "group", label: "Brand colours", sub: "Six tokens drive every surface of your published site." }];
      (
        [
          ["primary", "Primary"],
          ["secondary", "Secondary"],
          ["background", "Background"],
          ["text", "Text"],
          ["accent", "Accent"],
          ["ink", "Ink"],
        ] as Array<[keyof AppConfig["branding"]["colors"], string]>
      ).forEach(([k, lbl]) =>
        out.push({
          kind: "color",
          label: lbl,
          value: C.branding.colors[k],
          onChange: (e: InputEvt) => setCfg((c) => (c.branding.colors[k] = e.target.value)),
        })
      );
      out.push({ kind: "group", label: "Logo", sub: "Upload a mark, or use your name as a wordmark." });
      out.push({ kind: "upload", label: "Logo mark", hint: "PNG or SVG · square, transparent" });
    } else if (s === "seo")
      out = [
        { kind: "text", label: "Page title", value: C.seo.title, help: "Appears in search results and the browser tab. Aim for ~60 characters.", onChange: (e: InputEvt) => setCfg((c) => (c.seo.title = e.target.value)) },
        { kind: "area", label: "Meta description", value: C.seo.description, help: "A one–two sentence summary shown by search engines.", onChange: (e: AreaEvt) => setCfg((c) => (c.seo.description = e.target.value)) },
        {
          kind: "tags",
          label: "Keywords",
          placeholder: "Type a keyword, press Enter",
          items: C.seo.keywords.map((k, i) => ({ text: k, onRemove: () => setCfg((c) => c.seo.keywords.splice(i, 1)) })),
          onAdd: (e: KeyEvt) => {
            if (e.key === "Enter" && e.currentTarget.value.trim()) {
              const v = e.currentTarget.value.trim();
              e.currentTarget.value = "";
              setCfg((c) => c.seo.keywords.push(v));
            }
          },
        },
        { kind: "upload", label: "Social share image", hint: "1200×630 · shown when the link is shared" },
      ];
    else if (s === "contact")
      out = [
        { kind: "text", label: "Email", value: C.contact.email, onChange: (e: InputEvt) => setCfg((c) => (c.contact.email = e.target.value)) },
        { kind: "text", label: "Phone", value: C.contact.phone, onChange: (e: InputEvt) => setCfg((c) => (c.contact.phone = e.target.value)) },
        { kind: "area", label: "Address", value: C.contact.address, onChange: (e: AreaEvt) => setCfg((c) => (c.contact.address = e.target.value)) },
        { kind: "note", label: "Support only", text: "Contact details power an enquiry form — never a checkout. Orders and payments stay off by design." },
      ];
    else if (s === "legal") {
      const s1 = switchStyles(C.features.enableChat, false);
      const s2 = switchStyles(C.features.enableForms, false);
      const s3 = switchStyles(false, true);
      const s4 = switchStyles(false, true);
      out = [
        { kind: "area", label: "Footer disclaimer", value: C.compliance.disclaimer, placeholder: "Leave blank to use the platform default…", help: "A compliant disclaimer always renders. Override it here if you like.", onChange: (e: AreaEvt) => setCfg((c) => (c.compliance.disclaimer = e.target.value)) },
        { kind: "group", label: "Capabilities", sub: "Toggle what your site can do." },
        { kind: "toggle", label: "Support chat", trackStyle: s1.track, knobStyle: s1.knob, onToggle: () => setCfg((c) => (c.features.enableChat = !c.features.enableChat)) },
        { kind: "toggle", label: "Enquiry forms", trackStyle: s2.track, knobStyle: s2.knob, onToggle: () => setCfg((c) => (c.features.enableForms = !c.features.enableForms)) },
        { kind: "toggle", label: "Payments", lockNote: "Disabled for business-profile sites", trackStyle: s3.track, knobStyle: s3.knob, onToggle: () => {} },
        { kind: "toggle", label: "Shopping cart", lockNote: "Disabled for business-profile sites", trackStyle: s4.track, knobStyle: s4.knob, onToggle: () => {} },
      ];
    }
    return out;
  }

  /** Fields for the three fixed core blocks (hero/about/services), edited inline. */
  function buildCoreFields(key: string): Field[] {
    const C = config;
    if (key === "hero") {
      const hero = C.content.hero;
      const parts = hero.headlineRich?.parts || [];
      return [
        { kind: "group", label: "Headline", sub: "Mix italics and accent colour for emphasis." },
        { kind: "text", label: "Eyebrow", value: hero.eyebrow, placeholder: "Small label above the headline", onChange: (e: InputEvt) => setCfg((c) => (c.content.hero.eyebrow = e.target.value)) },
        {
          kind: "rich",
          label: "Headline",
          richPreview: renderRichInline(parts, C.branding.colors.accent || "#C2410C"),
          fragments: parts.map((p, i) => ({
            text: p.text,
            emphasis: p.emphasis || "",
            brStyle: brStyle(!!p.br),
            onText: (e: InputEvt) => setHeadlinePart(i, (pp) => (pp.text = e.target.value)),
            onEmphasis: (e: SelectEvt) => setHeadlinePart(i, (pp) => { const v = e.target.value; if (v) pp.emphasis = v as never; else delete pp.emphasis; }),
            onBreak: () => setHeadlinePart(i, (pp) => (pp.br = !pp.br)),
            onRemove: () => removeHeadlinePart(i),
          })),
          onAdd: () => addHeadlinePart(),
        },
        { kind: "area", label: "Tagline", value: hero.tagline, onChange: (e: AreaEvt) => setCfg((c) => (c.content.hero.tagline = e.target.value)) },
        { kind: "group", label: "Calls to action", sub: "Transactional labels are auto-rewritten to stay compliant." },
        { kind: "text", label: "Primary button", value: hero.cta.label, onChange: (e: InputEvt) => setCfg((c) => (c.content.hero.cta.label = e.target.value)) },
        { kind: "text", label: "Secondary button", value: hero.secondaryCta?.label || "", onChange: (e: InputEvt) => setCfg((c) => { if (!c.content.hero.secondaryCta) c.content.hero.secondaryCta = { label: "" }; c.content.hero.secondaryCta.label = e.target.value; }) },
        { kind: "group", label: "Proof points", sub: "Short trust lines shown beneath the buttons." },
        {
          kind: "tags",
          label: "Proof points",
          placeholder: "Add a proof point, press Enter",
          items: (hero.proof || []).map((k, i) => ({ text: k, onRemove: () => setCfg((c) => c.content.hero.proof?.splice(i, 1)) })),
          onAdd: (e: KeyEvt) => {
            if (e.key === "Enter" && e.currentTarget.value.trim()) {
              const v = e.currentTarget.value.trim();
              e.currentTarget.value = "";
              setCfg((c) => { if (!c.content.hero.proof) c.content.hero.proof = []; c.content.hero.proof.push(v); });
            }
          },
        },
      ];
    }
    if (key === "about") {
      const a = C.content.about || { description: "" };
      return [
        { kind: "text", label: "Eyebrow", value: a.eyebrow, onChange: (e: InputEvt) => setCfg((c) => ensureAbout(c).eyebrow = e.target.value) },
        { kind: "text", label: "Title", value: headingText(a.title), onChange: (e: InputEvt) => setCfg((c) => (ensureAbout(c).title = richOf(e.target.value))) },
        { kind: "area", label: "Your story", value: a.description, onChange: (e: AreaEvt) => setCfg((c) => (ensureAbout(c).description = e.target.value)) },
        { kind: "upload", label: "About image", hint: "Landscape · 4:3 works best" },
      ];
    }
    // services
    return [
      { kind: "group", label: "Services", sub: "What you offer — rendered as a card grid on the page." },
      {
        kind: "services",
        rows: (C.content.services || []).map((sv, i) => ({
          title: sv.title,
          desc: sv.description,
          onTitle: (e: InputEvt) => setCfg((c) => (c.content.services![i].title = e.target.value)),
          onDesc: (e: AreaEvt) => setCfg((c) => (c.content.services![i].description = e.target.value)),
          onRemove: () => setCfg((c) => c.content.services!.splice(i, 1)),
        })),
        onAdd: () => setCfg((c) => { if (!c.content.services) c.content.services = []; c.content.services.push({ title: "New service", description: "" }); }),
      },
    ];
  }

  function ensureAbout(c: AppConfig) {
    if (!c.content.about) c.content.about = { description: "" };
    return c.content.about;
  }
  function setHeadlinePart(i: number, fn: (p: { text: string; emphasis?: string; br?: boolean }) => void) {
    setCfg((c) => {
      const parts = c.content.hero.headlineRich?.parts;
      if (!parts || !parts[i]) return;
      fn(parts[i] as never);
      c.content.hero.headline = parts.map((p) => p.text).join(" ");
    });
  }
  function addHeadlinePart() {
    setCfg((c) => {
      if (!c.content.hero.headlineRich) c.content.hero.headlineRich = { parts: [] };
      c.content.hero.headlineRich.parts.push({ text: "text" });
      c.content.hero.headline = c.content.hero.headlineRich.parts.map((p) => p.text).join(" ");
    });
  }
  function removeHeadlinePart(i: number) {
    setCfg((c) => {
      c.content.hero.headlineRich?.parts.splice(i, 1);
      c.content.hero.headline = (c.content.hero.headlineRich?.parts || []).map((p) => p.text).join(" ");
    });
  }

  /** Inline RichHeading preview used inside the rich field (serif fragment view). */
  function renderRichInline(parts: Array<{ text: string; emphasis?: string; br?: boolean }>, accent: string): React.ReactNode {
    return parts.map((p, i) => {
      const st: React.CSSProperties = {};
      if (p.emphasis === "italic" || p.emphasis === "italic-accent") st.fontStyle = "italic";
      if (p.emphasis === "accent" || p.emphasis === "italic-accent") st.color = accent;
      return (
        <React.Fragment key={i}>
          <span style={st}>{p.text + " "}</span>
          {p.br ? <br /> : null}
        </React.Fragment>
      );
    });
  }

  /** Section-detail fields (eyebrow + heading + a note pointing at the full editor). */
  function buildSectionDetailFields(sec: DraftSection): Field[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d: any = sec.data || {};
    return [
      { kind: "text", label: "Eyebrow", value: d.eyebrow || "", placeholder: "Small label above the heading", onChange: (e: InputEvt) => setSectionEyebrow(sec.id, e.target.value) },
      { kind: "text", label: "Heading", value: headingText(d.heading), placeholder: "Section heading", onChange: (e: InputEvt) => setSectionHeading(sec.id, e.target.value) },
      { kind: "note", label: "Section content", text: itemsNote(sec) + ". Item-level editing for this block type lands in the full editor." },
    ];
  }

  // ---------- render: cards ----------
  const sectionCards = useMemo(() => {
    const mkCore = (key: string) => {
      const meta = TYPES[key];
      const selected = key === selectedSectionId;
      return {
        id: key,
        core: true,
        label: meta.label,
        tag: "Core",
        dot: meta.tint,
        dotFg: meta.dot,
        iconName: meta.icon,
        summary: coreSummary(key),
        selected,
        canManage: false,
        draggable: false,
      };
    };
    const mkSec = (sec: DraftSection) => {
      const meta = TYPES[sec.type];
      const selected = sec.id === selectedSectionId;
      const dragging = dragId === sec.id;
      return {
        id: sec.id,
        core: false,
        label: meta.label,
        tag: "",
        dot: meta.tint,
        dotFg: meta.dot,
        iconName: meta.icon,
        summary: sectionSummary(sec),
        selected,
        dragging,
        canManage: true,
        draggable: true,
      };
    };
    return [...CORE.map(mkCore), ...sections.map(mkSec)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections, selectedSectionId, dragId, config]);

  // ---------- compute fields for the active surface ----------
  let detailFields: Field[] = [];
  let detailLabel = "";
  if (editing && editingKey) {
    if ((CORE as readonly string[]).indexOf(editingKey) >= 0) {
      detailFields = buildCoreFields(editingKey);
      detailLabel = TYPES[editingKey].label;
    } else {
      const sec = sections.find((s) => s.id === editingKey);
      if (sec) {
        detailFields = buildSectionDetailFields(sec);
        detailLabel = TYPES[sec.type].label;
      }
    }
  }
  const fields = editing ? detailFields : buildFields(step);

  const doneCount = Object.keys(DONE).length;
  const pct = Math.round((doneCount / STEPS.length) * 100);

  // ---------- JSX ----------
  return (
    <div id="wb-root" style={ROOT}>
      {/* Header */}
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
          <span style={{ display: "flex" }}>{icon("eye", 16)}</span>Preview
        </Hoverable>
        <Hoverable as="button" onClick={doPublish} style={BTN_PRIMARY} hover={{ background: "#2457B0" }}>
          <span style={{ display: "flex" }}>{icon("send", 16)}</span>
          {publishing ? "Publishing…" : "Publish"}
        </Hoverable>
      </header>

      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* Left nav */}
        <nav style={{ ...NAV, width: narrow ? 72 : 248 }}>
          {!narrow && <div style={NAV_LABEL}>SETUP</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {STEPS.map((s) => {
              const active = s.id === step;
              const done = !!DONE[s.id];
              return (
                <button key={s.id} onClick={() => { setStep(s.id); setEditingKey(null); }} style={navItemStyle(active)}>
                  <span style={navIconStyle(active, done)}>{done && !active ? icon("check", 15, 2.2) : icon(s.icon, 16)}</span>
                  {!narrow && (
                    <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.25, minWidth: 0 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: "#27272A" }}>{s.label}</span>
                      <span style={{ fontSize: 11.5, color: "#A1A1AA", whiteSpace: "nowrap" }}>{s.hint}</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {!narrow && (
            <div style={{ marginTop: "auto", padding: "14px 8px 4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5, color: "#A1A1AA", marginBottom: 8 }}>
                <span>{doneCount + " of " + STEPS.length + " complete"}</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", color: "#2E6ACF", fontWeight: 500 }}>{pct}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 99, background: "#EFEFF2", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#5A8EE0,#2E6ACF)", width: pct + "%", transition: "width .4s" }} />
              </div>
            </div>
          )}
        </nav>

        {/* Editor */}
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
                {step === "sections" && !editing && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                      <div style={{ fontSize: 13, color: "#71717A" }}>Hero, About &amp; Services come first · drag the rest to reorder</div>
                      <Hoverable as="button" onClick={() => setPickerOpen(true)} style={BTN_ADD} hover={{ background: "#DCE8F8", borderColor: "#A9C6EF" }}>
                        <span style={{ display: "flex" }}>{icon("plus", 15)}</span>Add section
                      </Hoverable>
                    </div>
                    <div id="wb-sec-list" style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                      {sectionCards.map((c) => (
                        <SectionCard
                          key={c.id}
                          card={c}
                          onSelect={() => setSelectedSectionId(c.id)}
                          onEdit={() => { setEditingKey(c.id); setSelectedSectionId(c.id); }}
                          onDup={() => dupSection(c.id)}
                          onDel={() => removeSection(c.id)}
                          onDragStart={(e) => { dragRef.current = c.id; setDragId(c.id); try { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", c.id); } catch { /* */ } }}
                          onDragEnter={(e) => { e.preventDefault(); reorderTo(c.id); }}
                          onDragOver={(e) => e.preventDefault()}
                          onDragEnd={() => { dragRef.current = null; setDragId(null); }}
                        />
                      ))}
                    </div>
                  </>
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

        {/* Preview aside */}
        {!veryNarrow && (
          <aside style={ASIDE}>
            <div style={{ height: 50, flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px 0 16px", borderBottom: "1px solid #E0E0E6" }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, letterSpacing: ".1em", color: "#9CA3AF" }}>LIVE PREVIEW</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Device view toggle: all / desktop only / mobile only. */}
                <div style={ZOOM_CLUSTER}>
                  <button onClick={() => setPreviewView("all")} title="Desktop + mobile" style={viewBtnStyle(previewView === "all")}>{icon("layers", 14)}</button>
                  <button onClick={() => setPreviewView("desktop")} title="Desktop only" style={viewBtnStyle(previewView === "desktop")}>{icon("monitor", 15)}</button>
                  <button onClick={() => setPreviewView("mobile")} title="Mobile only" style={viewBtnStyle(previewView === "mobile")}>{icon("smartphone", 15)}</button>
                </div>
                {/* Zoom controls: minus / % / plus, with a reset-to-fit button. */}
                <div style={ZOOM_CLUSTER}>
                  <button onClick={() => zoomBy(-ZOOM_STEP)} disabled={zoomFactor <= ZOOM_MIN + 1e-6} title="Zoom out" style={zoomBtnStyle(zoomFactor <= ZOOM_MIN + 1e-6)}>
                    {icon("minus", 15)}
                  </button>
                  <span style={ZOOM_PCT}>{Math.round(zoomFactor * 100)}%</span>
                  <button onClick={() => zoomBy(ZOOM_STEP)} disabled={zoomFactor >= ZOOM_MAX - 1e-6} title="Zoom in" style={zoomBtnStyle(zoomFactor >= ZOOM_MAX - 1e-6)}>
                    {icon("plus", 15)}
                  </button>
                  <span style={{ width: 1, height: 16, background: "#E2E2E8", margin: "0 1px" }} />
                  <button onClick={() => setZoomFactor(1)} title="Reset to fit" style={ZOOM_RESET_BTN}>
                    {icon("zoomReset", 14)}
                  </button>
                </div>
              </div>
            </div>
            <div id="wb-preview-scroll" style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "center", gap: 22 }}>
              {/* Desktop frame — real modules in an isolated iframe; shown in "all"/"desktop". */}
              {previewView !== "mobile" && (
                <div style={{ flex: "none" }}>
                  <div style={DEVICE_LABEL}>{icon("monitor", 13)}DESKTOP</div>
                  <div style={{ borderRadius: 12, overflow: "hidden", boxShadow: "0 6px 22px rgba(16,16,20,.07)" }}>
                    <BuilderPreview config={config} sections={sections} full={false} step={step} selectedSectionId={selectedSectionId} slug={slug} device="desktop" scale={previewScale} onMeasure={setDeskH} />
                  </div>
                </div>
              )}

              {/* Mobile frame — real modules at 375px, content-driven height; "all"/"mobile". */}
              {previewView !== "desktop" && (
                <div style={{ flex: "none" }}>
                  <div style={DEVICE_LABEL}>{icon("smartphone", 13)}MOBILE · 375</div>
                  <div style={{ borderRadius: 12, overflow: "hidden", boxShadow: "0 6px 22px rgba(16,16,20,.07)" }}>
                    <BuilderPreview config={config} sections={sections} full={false} step={step} selectedSectionId={selectedSectionId} slug={slug} device="mobile" scale={previewScale} onMeasure={setMobH} />
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

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
      {(publishing || published) && (
        <div style={PUBLISH_OVERLAY}>
          {publishing && !published && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center" }}>
              <span style={SPINNER_LG} />
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Publishing your site…</div>
                <div style={{ fontSize: 13.5, color: "rgba(255,255,255,.7)", marginTop: 4 }}>Compiling sections &amp; deploying to the edge.</div>
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
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: "#3F3F46" }}>{slug + "." + PUBLISH_DOMAIN}</span>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Hoverable as="button" onClick={() => { setPublishing(false); setPublished(false); }} style={PUBLISH_BTN_GHOST} hover={{ background: "#FAFAFB" }}>Back to editor</Hoverable>
                  <Hoverable as="button" style={PUBLISH_BTN_PRIMARY} hover={{ background: "#2457B0" }}>Visit site {icon("arrowRight", 15)}</Hoverable>
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
              <BuilderPreview config={config} sections={sections} full step={step} selectedSectionId={selectedSectionId} slug={slug} device="desktop" scale={sheetScale} />
            </div>
          </div>
        </div>
      )}
    </div>
  );

}

// ---------- typed DOM events ----------
type InputEvt = React.ChangeEvent<HTMLInputElement>;
type AreaEvt = React.ChangeEvent<HTMLTextAreaElement>;
type SelectEvt = React.ChangeEvent<HTMLSelectElement>;
type KeyEvt = React.KeyboardEvent<HTMLInputElement>;

// ---------- step copy ----------
function stepTitle(id: StepId): string {
  return ({ identity: "Business identity", branding: "Branding & colours", seo: "Search & metadata", sections: "Build your page", contact: "Contact details", legal: "Legal & capabilities" } as Record<StepId, string>)[id];
}
function stepSub(id: StepId): string {
  return ({
    identity: "Tell us who this site is for.",
    branding: "Set the six colour tokens and logo that theme your whole site.",
    seo: "How your site appears in search and when shared.",
    sections: "Add, reorder and edit the blocks that make up your page. Drag to rearrange.",
    contact: "Support-only details — no checkout, by design.",
    legal: "Your disclaimer and the capabilities your site exposes.",
  } as Record<StepId, string>)[id];
}

// ---------- a hoverable element (faithful style-hover port) ----------
type HoverableProps = {
  as?: "button" | "div";
  style: React.CSSProperties;
  hover?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
};
function Hoverable({ as = "div", style, hover, onClick, children }: HoverableProps) {
  const [h, setH] = useState(false);
  const Tag = as as keyof React.JSX.IntrinsicElements;
  // If the hover state restyles `borderColor` but the base uses the `border`
  // shorthand, expand the base to longhand so React never removes a longhand while
  // a conflicting shorthand stays (which triggers a console warning + style bugs).
  let base = style;
  if (hover && "borderColor" in hover && typeof style.border === "string") {
    const { border, ...rest } = style;
    const m = /^\s*(\S+)\s+(\S+)\s+(.+)$/.exec(border as string);
    base = m
      ? { ...rest, borderWidth: m[1], borderStyle: m[2], borderColor: m[3] }
      : style;
  }
  return React.createElement(
    Tag,
    {
      style: h && hover ? { ...base, ...hover } : base,
      onClick,
      onMouseEnter: () => setH(true),
      onMouseLeave: () => setH(false),
    },
    children
  );
}

// ---------- one editor field ----------
function FieldRow({ f }: { f: Field }) {
  const [focus, setFocus] = useState(false);
  const focusStyle = focus ? { borderColor: "#2E6ACF", boxShadow: "0 0 0 3px rgba(46,106,207,.14)" } : null;

  return (
    <div style={{ marginBottom: 20 }}>
      {f.kind === "group" && (
        <div style={{ margin: "10px 0 2px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#27272A" }}>{f.label}</div>
          {f.sub && <div style={{ fontSize: 12.5, color: "#A1A1AA", marginTop: 3 }}>{f.sub}</div>}
        </div>
      )}

      {f.kind === "note" && (
        <div style={{ display: "flex", gap: 10, padding: "13px 14px", borderRadius: 12, background: "#F1F6FD", border: "1px solid #E9F0FB" }}>
          <span style={{ display: "flex", color: "#2E6ACF", flex: "none", marginTop: 1 }}>{icon("lock", 15)}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#2457B0", marginBottom: 2 }}>{f.label}</div>
            <div style={{ fontSize: 12.5, color: "#5A6B85", lineHeight: 1.5 }}>{f.text}</div>
          </div>
        </div>
      )}

      {f.kind === "text" && (
        <>
          <label style={FIELD_LABEL}>{f.label}</label>
          <input type="text" value={f.value || ""} onChange={f.onChange} placeholder={f.placeholder} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} style={{ ...TEXT_INPUT, ...(focusStyle || {}) }} />
          {f.help && <p style={FIELD_HELP}>{f.help}</p>}
        </>
      )}

      {f.kind === "area" && (
        <>
          <label style={FIELD_LABEL}>{f.label}</label>
          <textarea rows={3} value={f.value || ""} onChange={f.onChange} placeholder={f.placeholder} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} style={{ ...TEXT_AREA, ...(focusStyle || {}) }} />
          {f.help && <p style={FIELD_HELP}>{f.help}</p>}
        </>
      )}

      {f.kind === "color" && (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ position: "relative", width: 42, height: 42, borderRadius: 11, overflow: "hidden", border: "1px solid #E4E4EA", flex: "none", cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,.04)" }}>
            <span style={{ position: "absolute", inset: 0, background: f.value }} />
            <input type="color" value={f.value} onChange={f.onChange} style={{ position: "absolute", inset: -6, width: 60, height: 60, border: "none", padding: 0, cursor: "pointer", opacity: 0 }} />
          </label>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#3F3F46", marginBottom: 3 }}>{f.label}</div>
            <input type="text" value={f.value} onChange={f.onChange} style={{ width: 120, padding: "6px 10px", border: "1px solid #E4E4EA", borderRadius: 8, fontFamily: "'JetBrains Mono',monospace", fontSize: 12.5, color: "#52525B", background: "#fff", outline: "none", textTransform: "uppercase" }} />
          </div>
        </div>
      )}

      {f.kind === "upload" && (
        <>
          <label style={FIELD_LABEL}>{f.label}</label>
          <Hoverable style={UPLOAD_BOX} hover={{ borderColor: "#A9C6EF", background: "#F1F6FD" }}>
            <span style={{ width: 42, height: 42, borderRadius: 10, background: "#fff", border: "1px solid #EAEAEE", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", flex: "none" }}>{icon("image", 18)}</span>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#52525B" }}>Click to upload</div>
              <div style={{ fontSize: 12, color: "#A1A1AA", marginTop: 2 }}>{f.hint}</div>
            </div>
          </Hoverable>
        </>
      )}

      {f.kind === "tags" && (
        <>
          <label style={FIELD_LABEL}>{f.label}</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, alignItems: "center", padding: "8px 9px", border: "1px solid #E4E4EA", borderRadius: 11, background: "#fff" }}>
            {f.items.map((t: { text: string; onRemove: () => void }, i: number) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 6px 5px 11px", borderRadius: 8, background: "#F4F4F6", fontSize: 12.5, color: "#3F3F46" }}>
                {t.text}
                <button onClick={t.onRemove} style={TAG_X}>{icon("x", 13)}</button>
              </span>
            ))}
            <input type="text" onKeyDown={f.onAdd} placeholder={f.placeholder} style={{ flex: 1, minWidth: 140, border: "none", outline: "none", background: "transparent", fontSize: 13, color: "#18181B", padding: "5px 4px" }} />
          </div>
        </>
      )}

      {f.kind === "toggle" && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 15px", border: "1px solid #EDEDF0", borderRadius: 12, background: "#fff" }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#27272A" }}>{f.label}</div>
            {f.lockNote && <div style={{ fontSize: 12, color: "#A1A1AA", marginTop: 2 }}>{f.lockNote}</div>}
          </div>
          <button onClick={f.onToggle} style={f.trackStyle}>
            <span style={f.knobStyle} />
          </button>
        </div>
      )}

      {f.kind === "services" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {f.rows.map((row: ServiceRow, i: number) => (
            <div key={i} style={{ padding: 14, border: "1px solid #EDEDF0", borderRadius: 13, background: "#fff", position: "relative" }}>
              <button onClick={row.onRemove} style={SERVICE_X}>{icon("x", 13)}</button>
              <input type="text" value={row.title} onChange={row.onTitle} placeholder="Service title" style={{ width: "calc(100% - 36px)", padding: "6px 0", border: "none", outline: "none", fontSize: 14.5, fontWeight: 600, color: "#18181B", background: "transparent" }} />
              <textarea rows={2} value={row.desc} onChange={row.onDesc} placeholder="Short description" style={{ width: "100%", marginTop: 4, padding: 0, border: "none", outline: "none", fontSize: 13, lineHeight: 1.5, color: "#71717A", background: "transparent", resize: "none" }} />
            </div>
          ))}
          <Hoverable as="button" onClick={f.onAdd} style={ADD_DASHED} hover={{ borderColor: "#2E6ACF", color: "#2E6ACF" }}>{icon("plus", 14)}Add service</Hoverable>
        </div>
      )}

      {f.kind === "rich" && (
        <>
          <label style={FIELD_LABEL}>
            {f.label} <span style={{ color: "#A1A1AA", fontWeight: 400 }}>· styled fragments</span>
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12, border: "1px solid #E4E4EA", borderRadius: 13, background: "#FBFBFC" }}>
            {f.fragments.map((frag: RichFrag, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ display: "flex", color: "#C4C4CC", cursor: "grab" }}>{icon("grip", 14)}</span>
                <input type="text" value={frag.text} onChange={frag.onText} style={{ flex: 1, minWidth: 0, padding: "8px 10px", border: "1px solid #E4E4EA", borderRadius: 8, fontSize: 13.5, color: "#18181B", background: "#fff", outline: "none" }} />
                <select value={frag.emphasis} onChange={frag.onEmphasis} style={{ padding: "8px 7px", border: "1px solid #E4E4EA", borderRadius: 8, fontSize: 12.5, color: "#52525B", background: "#fff", outline: "none", cursor: "pointer" }}>
                  <option value="">Normal</option>
                  <option value="italic">Italic</option>
                  <option value="italic-accent">Italic + accent</option>
                  <option value="accent">Accent</option>
                </select>
                <button onClick={frag.onBreak} title="Line break after" style={frag.brStyle}>{icon("chevronDown", 14)}</button>
                <button onClick={frag.onRemove} style={FRAG_X}>{icon("x", 13)}</button>
              </div>
            ))}
            <Hoverable as="button" onClick={f.onAdd} style={ADD_FRAG} hover={{ borderColor: "#2E6ACF", color: "#2E6ACF" }}>{icon("plus", 14)}Add fragment</Hoverable>
          </div>
          <div style={{ marginTop: 11, padding: "14px 16px", borderRadius: 12, background: "#fff", border: "1px solid #EDEDF0" }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, letterSpacing: ".1em", color: "#B4B4BE", marginBottom: 6 }}>PREVIEW</div>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 26, lineHeight: 1.1, color: "#18181B" }}>{f.richPreview}</div>
          </div>
        </>
      )}
    </div>
  );
}

type ServiceRow = { title: string; desc: string; onTitle: (e: InputEvt) => void; onDesc: (e: AreaEvt) => void; onRemove: () => void };
type RichFrag = { text: string; emphasis: string; brStyle: React.CSSProperties; onText: (e: InputEvt) => void; onEmphasis: (e: SelectEvt) => void; onBreak: () => void; onRemove: () => void };

// ---------- a section card ----------
type CardModel = {
  id: string;
  core: boolean;
  label: string;
  tag: string;
  dot: string;
  dotFg: string;
  iconName: string;
  summary: string;
  selected: boolean;
  dragging?: boolean;
  canManage: boolean;
  draggable: boolean;
};
function SectionCard({
  card,
  onSelect,
  onEdit,
  onDup,
  onDel,
  onDragStart,
  onDragEnter,
  onDragOver,
  onDragEnd,
}: {
  card: CardModel;
  onSelect: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDup: (e: React.MouseEvent) => void;
  onDel: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  const border = card.dragging ? "#A9C6EF" : card.selected ? "#2E6ACF" : "#ECECEF";
  const shadow = card.dragging
    ? "0 16px 34px rgba(16,16,20,.16)"
    : card.selected
    ? "0 0 0 3px rgba(46,106,207,.12)"
    : "0 1px 2px rgba(16,16,20,.04)";
  const style: React.CSSProperties = {
    background: "#fff",
    border: "1px solid " + border,
    borderRadius: 13,
    boxShadow: shadow,
    transition: "box-shadow .2s,border-color .2s,transform .16s",
    overflow: "hidden",
    cursor: "pointer",
    ...(card.dragging ? { transform: "scale(1.015)", position: "relative", zIndex: 5 } : null),
  };
  return (
    <div
      className="wb-sec-card"
      data-id={card.id}
      draggable={card.draggable}
      onClick={onSelect}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      style={style}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "13px 14px" }}>
        <span style={{ display: "flex", color: card.draggable ? "#C4C4CC" : "#E4E4EA", cursor: card.draggable ? "grab" : "default" }} title="Drag to reorder">{icon("grip", 16)}</span>
        <span style={{ width: 30, height: 30, borderRadius: 8, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", background: card.dot, color: card.dotFg }}>{icon(card.iconName, 15)}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#27272A" }}>{card.label}</span>
            {card.tag && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: ".08em", color: "#9CA3AF", border: "1px solid #ECECEF", borderRadius: 5, padding: "1px 5px" }}>{card.tag}</span>}
          </div>
          <div style={{ fontSize: 12, color: "#A1A1AA", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.summary}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Hoverable as="button" onClick={onEdit} style={CARD_BTN} hover={{ background: "#F4F4F6", color: "#2E6ACF" }}>{icon("chevronRight", 16)}</Hoverable>
          {card.canManage && (
            <>
              <Hoverable as="button" onClick={onDup} style={CARD_BTN} hover={{ background: "#F4F4F6", color: "#27272A" }}>{icon("copy", 15)}</Hoverable>
              <Hoverable as="button" onClick={onDel} style={CARD_BTN} hover={{ background: "#FEF2F2", color: "#DC2626" }}>{icon("trash", 15)}</Hoverable>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- confetti particles (deterministic to stay SSR-safe) ----------
const CONFETTI_COLORS = ["#2E6ACF", "#22C55E", "#F59E0B", "#EC4899", "#0EA5E9", "#A855F7"];
const CONFETTI: React.CSSProperties[] = Array.from({ length: 26 }, (_, i) => {
  const c = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
  const w = 6 + ((i * 5) % 8);
  return {
    position: "absolute",
    left: "50%",
    top: "42%",
    width: w,
    height: w * 0.6 + 3,
    background: c,
    borderRadius: 2,
    opacity: 0,
  } as React.CSSProperties;
});

// ---------- static styles ----------
const ROOT: React.CSSProperties = { height: "100vh", width: "100%", display: "flex", flexDirection: "column", overflow: "hidden", background: "#F1F1F4", fontFamily: "'Hanken Grotesk',-apple-system,system-ui,sans-serif", color: "#1A1A1F" };
const HEADER: React.CSSProperties = { height: 58, flex: "none", display: "flex", alignItems: "center", gap: 14, padding: "0 18px", background: "#fff", borderBottom: "1px solid #EAEAEE", zIndex: 40, position: "relative" };
const LOGO_MARK: React.CSSProperties = { width: 28, height: 28, borderRadius: 8, background: "#2E6ACF", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 2px 8px rgba(46,106,207,.35)" };
const TENANT_CHIP: React.CSSProperties = { display: "flex", alignItems: "center", gap: 7, padding: "5px 10px", borderRadius: 9, border: "1px solid transparent", background: "transparent", cursor: "pointer", color: "#3F3F46" };
const TENANT_BADGE: React.CSSProperties = { width: 18, height: 18, borderRadius: 5, background: "#1C1917", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700 };
const DRAFT_BADGE: React.CSSProperties = { fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 500, letterSpacing: ".06em", color: "#9CA3AF", border: "1px solid #EAEAEE", borderRadius: 6, padding: "3px 7px" };
const SPINNER_SM: React.CSSProperties = { width: 13, height: 13, border: "2px solid #D4D4DB", borderTopColor: "#2E6ACF", borderRadius: "50%", animation: "wb-spin .7s linear infinite", display: "inline-block" };
const SPINNER_LG: React.CSSProperties = { width: 46, height: 46, border: "3px solid rgba(255,255,255,.25)", borderTopColor: "#fff", borderRadius: "50%", animation: "wb-spin .8s linear infinite" };
const BTN_OUTLINE: React.CSSProperties = { display: "flex", alignItems: "center", gap: 7, padding: "8px 13px", borderRadius: 10, border: "1px solid #E2E2E8", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#3F3F46" };
const BTN_PRIMARY: React.CSSProperties = { display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 10, border: "none", background: "#2E6ACF", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#fff", boxShadow: "0 2px 10px rgba(46,106,207,.32)" };
const NAV: React.CSSProperties = { flex: "none", background: "#fff", borderRight: "1px solid #EAEAEE", display: "flex", flexDirection: "column", padding: "16px 12px", transition: "width .25s" };
const NAV_LABEL: React.CSSProperties = { fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: ".14em", color: "#B4B4BE", padding: "4px 8px 12px" };
const STEP_INDEX: React.CSSProperties = { fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: ".1em", color: "#2E6ACF", marginBottom: 9 };
const ASIDE: React.CSSProperties = { width: "clamp(440px, 42vw, 800px)", flex: "none", background: "#E9E9ED", borderLeft: "1px solid #E0E0E6", display: "flex", flexDirection: "column", minWidth: 0 };
const DEVICE_LABEL: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: ".14em", color: "#9CA3AF", marginBottom: 10 };
const ZOOM_CLUSTER: React.CSSProperties = { display: "flex", alignItems: "center", gap: 2, background: "#fff", border: "1px solid #E2E2E8", borderRadius: 9, padding: "2px" };
const ZOOM_PCT: React.CSSProperties = { fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#52525B", minWidth: 38, textAlign: "center", fontVariantNumeric: "tabular-nums" };
const ZOOM_RESET_BTN: React.CSSProperties = { width: 26, height: 26, border: "none", background: "transparent", borderRadius: 6, cursor: "pointer", color: "#71717A", display: "flex", alignItems: "center", justifyContent: "center" };
/** Device-view toggle button; tinted when its view is active. */
function viewBtnStyle(active: boolean): React.CSSProperties {
  return {
    width: 28,
    height: 26,
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: active ? "#2E6ACF" : "transparent",
    color: active ? "#fff" : "#71717A",
  };
}

/** +/- zoom button style; dimmed + non-interactive at a clamp boundary. */
function zoomBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    width: 26,
    height: 26,
    border: "none",
    borderRadius: 6,
    cursor: disabled ? "default" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    color: disabled ? "#CBD0D6" : "#52525B",
  };
}
const FIELD_LABEL: React.CSSProperties = { display: "block", fontSize: 12.5, fontWeight: 600, color: "#3F3F46", marginBottom: 7 };
const FIELD_HELP: React.CSSProperties = { fontSize: 12, color: "#A1A1AA", margin: "7px 0 0", lineHeight: 1.5 };
const TEXT_INPUT: React.CSSProperties = { width: "100%", padding: "11px 13px", border: "1px solid #E4E4EA", borderRadius: 11, fontSize: 14, color: "#18181B", background: "#fff", outline: "none", transition: "border-color .15s,box-shadow .15s" };
const TEXT_AREA: React.CSSProperties = { ...TEXT_INPUT, lineHeight: 1.55, resize: "none" };
const UPLOAD_BOX: React.CSSProperties = { display: "flex", alignItems: "center", gap: 14, padding: 16, border: "1.5px dashed #DDDDE3", borderRadius: 13, background: "#FBFBFC", cursor: "pointer", transition: "border-color .15s,background .15s" };
const TAG_X: React.CSSProperties = { width: 17, height: 17, border: "none", background: "transparent", cursor: "pointer", color: "#A1A1AA", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 5 };
const SERVICE_X: React.CSSProperties = { position: "absolute", top: 11, right: 11, width: 28, height: 28, border: "none", background: "transparent", cursor: "pointer", color: "#C4C4CC", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 7 };
const FRAG_X: React.CSSProperties = { width: 30, height: 30, border: "none", background: "transparent", cursor: "pointer", color: "#C4C4CC", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8 };
const ADD_DASHED: React.CSSProperties = { alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, padding: "9px 13px", borderRadius: 10, border: "1px dashed #D4D4DB", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#71717A" };
const ADD_FRAG: React.CSSProperties = { alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 5, marginTop: 3, padding: "6px 11px", borderRadius: 8, border: "1px dashed #D4D4DB", background: "transparent", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "#71717A" };
const CARD_BTN: React.CSSProperties = { width: 30, height: 30, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: "#9CA3AF", display: "flex", alignItems: "center", justifyContent: "center" };
const BTN_ADD: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 10, border: "1px solid #CBDDF6", background: "#F1F6FD", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#2E6ACF" };
const BTN_BACK_DETAIL: React.CSSProperties = { display: "flex", alignItems: "center", gap: 7, marginBottom: 18, padding: "7px 12px 7px 9px", borderRadius: 9, border: "1px solid #E2E2E8", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#52525B" };
const BTN_BACK: React.CSSProperties = { display: "flex", alignItems: "center", gap: 7, padding: "9px 15px", borderRadius: 10, border: "1px solid #E2E2E8", background: "#fff", cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: "#52525B" };
const BTN_NEXT: React.CSSProperties = { display: "flex", alignItems: "center", gap: 7, padding: "9px 17px", borderRadius: 10, border: "none", background: "#18181B", cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: "#fff" };
const PICKER_BACK: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(20,20,26,.36)", backdropFilter: "blur(3px)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 };
const PICKER_POP: React.CSSProperties = { width: 600, maxWidth: "100%", maxHeight: "84vh", overflowY: "auto", background: "#fff", borderRadius: 20, boxShadow: "0 40px 100px rgba(16,16,20,.4)", padding: 24 };
const PICKER_CLOSE: React.CSSProperties = { width: 32, height: 32, border: "none", background: "#F4F4F6", borderRadius: 9, cursor: "pointer", color: "#71717A", display: "flex", alignItems: "center", justifyContent: "center" };
const PICK_ITEM: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12, padding: 14, border: "1px solid #ECECEF", borderRadius: 14, background: "#fff", cursor: "pointer", textAlign: "left", transition: "border-color .15s,box-shadow .15s,transform .12s" };
const PUBLISH_OVERLAY: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(20,20,26,.5)", backdropFilter: "blur(5px)", zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflow: "hidden" };
const PUBLISH_CARD: React.CSSProperties = { position: "relative", zIndex: 1, width: 420, maxWidth: "100%", background: "#fff", borderRadius: 22, padding: "36px 32px", textAlign: "center", boxShadow: "0 40px 100px rgba(16,16,20,.45)" };
const CHECK_RING: React.CSSProperties = { width: 76, height: 76, margin: "0 auto 20px", borderRadius: "50%", background: "#ECFDF3", display: "flex", alignItems: "center", justifyContent: "center" };
const PUBLISH_BTN_GHOST: React.CSSProperties = { flex: 1, padding: 11, borderRadius: 11, border: "1px solid #E2E2E8", background: "#fff", cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: "#52525B" };
const PUBLISH_BTN_PRIMARY: React.CSSProperties = { flex: 1, padding: 11, borderRadius: 11, border: "none", background: "#2E6ACF", cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 };
const PREVIEW_SHEET: React.CSSProperties = { position: "fixed", inset: 0, background: "#E9E9ED", zIndex: 65, display: "flex", flexDirection: "column" };

// (no shared dynamic style helpers below this line beyond nav helpers)

// ---------- per-instance dynamic style helpers ----------
function navItemStyle(active: boolean): React.CSSProperties {
  return {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 10px",
    borderRadius: 11,
    border: "1px solid " + (active ? "#D8E4F7" : "transparent"),
    cursor: "pointer",
    textAlign: "left",
    transition: "background .15s,border-color .15s",
    fontFamily: "inherit",
    background: active ? "#F1F6FD" : "transparent",
  };
}
function navIconStyle(active: boolean, done: boolean): React.CSSProperties {
  return {
    width: 32,
    height: 32,
    borderRadius: 9,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "none",
    transition: "all .2s",
    ...(active
      ? { background: "#2E6ACF", color: "#fff" }
      : done
      ? { background: "#E9F0FB", color: "#2E6ACF" }
      : { background: "#F3F3F5", color: "#9CA3AF" }),
  };
}
