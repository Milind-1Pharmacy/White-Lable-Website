/**
 * @file useBuilderState.ts
 * @description The Website Builder's state engine: all React state, refs,
 *  derived values, localStorage persistence, GSAP lifecycle/animation effects,
 *  preview fit-scale math, every config/section mutation, and the field builders
 *  that turn the draft into editor `Field` descriptors. Returns one `BuilderApi`
 *  object the WebsiteBuilder composition root + its sub-components consume.
 * @responsibilities
 *  - Own state/refs and hydrate/persist the draft (config + sections + order).
 *  - Derive preview scale, section cards, and the active-surface field list.
 *  - Expose mutations (add/dup/remove/reorder sections, setCfg, item edits).
 * @dependencies react, gsap, ./builderData, ./builderHelpers, ./builderStyles,
 *  ./builderTypes, ./preview, @wl/config-types
 * @author WhiteLabel Platform Team
 * @created 2026-06-23
 */
"use client";

/*
 * react-hooks/refs is disabled for this file: the field builders construct field/
 * handler descriptors during render, and those handlers transitively reach
 * ref-reading helpers (markDirty → saveT/rm; fragment drag → fragDragRef). The
 * refs are only ever read when a handler actually fires (an event/effect), never
 * during render, so the rule's "ref accessed during render" warning is a false
 * positive here.
 */
/* eslint-disable react-hooks/refs */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import type { AppConfig } from "@wl/config-types";
import {
  BLANK, CORE, DEFAULTS, DONE, INITIAL, SECTION_ANCHORS, STEPS, TYPES,
  type BuilderSectionType, type DraftSection, type StepId, type LegalSectionId,
} from "./builderData";
import {
  clone, genId, headingText, loadDraft, prefersReducedMotion, PUBLISH_DOMAIN, sameOrder, saveDraft,
} from "./builderHelpers";
import type { Field } from "./builderTypes";
import { PREVIEW_BASE_WIDTH, PREVIEW_MOBILE_WIDTH } from "./preview";
import { publishTenant, getPublishStatus, type PublishPayload } from "@/lib/api/publish";
import { isLegalNavMessage } from "@wl/render-engine/lib/legalRoutes";
import { makeFieldBuilders } from "./fieldBuilders";
import { DEFAULT_THEME } from "./themePresets";
import { validateDraft, blockingIssues, type ValidationIssue } from "./validationSchema";

/**
 * Dev-tools feature flag. When ON, the builder header shows the "Fill mock data"
 * and "Reset data" buttons (handy in dev/preview); when OFF they disappear.
 * Set NEXT_PUBLIC_DEV_TOOLS=1 to show them. Independent of NODE_ENV so it can be
 * toggled on a Vercel deployment without changing the build mode. Inlined at build.
 * NOTE: this does NOT gate publishing — publishing is always available.
 */
export const DEV_TOOLS_ENABLED = process.env.NEXT_PUBLIC_DEV_TOOLS === "1";

export function useBuilderState() {
  const [step, setStep] = useState<StepId>("sections");
  // Seed the FIRST render deterministically (identical server + client; localStorage
  // isn't available server-side, so reading it in initial state caused a hydration
  // mismatch). A real saved draft is restored post-mount in an effect below.
  // Default seed is BLANK() — a fresh visitor gets a CLEAN SLATE, not the UrMedz/
  // pharmacy demo. Set NEXT_PUBLIC_SEED_DEMO=1 to seed the rich INITIAL() demo
  // instead (for showcasing).
  const seed = useRef(process.env.NEXT_PUBLIC_SEED_DEMO === "1" ? INITIAL() : BLANK());
  const [config, setConfig] = useState<AppConfig>(() => seed.current.config);
  const [sections, setSections] = useState<DraftSection[]>(() => seed.current.sections);
  const [saved, setSaved] = useState(true);
  const [dragId, setDragId] = useState<string | null>(null);
  // Gap index in the unified card list where the dragged card will drop (the
  // accent drop-line sits above the card at this index; cards.length = after last).
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  // The unified block render order as STABLE card ids ("hero"|"about"|"services"
  // |<section client id>). This is the source of truth for ordering; content.order
  // (with section:<index> tokens) is derived from it so it survives section churn.
  const [blockOrder, setBlockOrder] = useState<string[]>(() => seed.current.blockOrder);
  // Guards the persistence effect from overwriting localStorage before the initial
  // restore has run (otherwise the deterministic seed would clobber a saved draft).
  const hydrated = useRef(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  // Current deploy stage shown while publishing (demo sequence or real status).
  const [publishStage, setPublishStage] = useState<"building" | "bucket" | "deploying" | "live">("building");
  // Seconds elapsed since Publish was clicked — drives the loader's live timer and
  // its ease-in progress arc (a real deploy takes ~5 min, so users need the clock).
  const [publishElapsed, setPublishElapsed] = useState(0);
  // Set from the publish response once the site goes live; "" until then. In demo
  // mode this is a placeholder slug domain — see `siteIsLive` to tell them apart.
  const [siteUrl, setSiteUrl] = useState("");
  // True ONLY when a REAL backend deploy returned a live URL (not the demo mock).
  // Drives "Visit site": real → redirect (window.open); demo → in-app rendered view.
  const [siteIsLive, setSiteIsLive] = useState(false);
  // Non-null when a publish attempt failed (e.g. backend not wired yet).
  const [publishError, setPublishError] = useState<string | null>(null);
  // Blocking content-validation issues found when Publish was clicked. When non-empty
  // the pre-publish summary panel is shown and the actual publish is NOT run.
  const [publishIssues, setPublishIssues] = useState<ValidationIssue[]>([]);
  const [previewSheetOpen, setPreviewSheetOpen] = useState(false);
  // The full-page "live site" view shown after a successful publish (demo).
  const [publishedSiteOpen, setPublishedSiteOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("hero");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [win, setWin] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1440);
  // Which device frame(s) the preview shows.
  const [previewView, setPreviewView] = useState<"all" | "desktop" | "mobile">("all");
  // On the Legal step, which legal sub-section is open in the editor (and shown in
  // the preview). Works like the Sections step: pick a section, edit its fields.
  const [legalSection, setLegalSection] = useState<LegalSectionId>("contact");
  // Preview zoom: a user multiplier on top of the fit-to-pane base (1 = fit),
  // driven by +/- buttons and clamped to [ZOOM_MIN, ZOOM_MAX].
  const [zoomFactor, setZoomFactor] = useState(1);
  const ZOOM_MIN = 0.4;
  const ZOOM_MAX = 2.5;
  const ZOOM_STEP = 0.1;

  // Measured iframe content heights (CSS px, unscaled) + the preview pane box size.
  // The preview scales to PANE WIDTH only (it scrolls vertically), so the parent no
  // longer tracks the measured frame heights — each BuilderPreview self-measures.
  const [paneW, setPaneW] = useState(0);
  const [paneH, setPaneH] = useState(0);
  const [sheetW, setSheetW] = useState(0);

  const zoomBy = (delta: number) =>
    setZoomFactor((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round((z + delta) * 100) / 100)));

  const rm = useRef(false);
  const dragRef = useRef<string | null>(null);
  // Index of the headline fragment currently being dragged (rich-heading reorder).
  const fragDragRef = useRef<number | null>(null);
  const saveT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pubT = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Wall-clock stamp of when the current publish started — used to enforce the
  // ~6 min poll ceiling independent of how many polls actually fired.
  const startStamp = useRef(0);
  const flipAddId = useRef<string | null>(null);
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

  // ---------- persistence ----------
  // Restore the persisted draft AFTER mount (client-only) so SSR/first-render
  // stays deterministic. This is the canonical "read localStorage post-mount"
  // pattern — the one-time setState here is intentional (it can't run during
  // render or SSR), so the set-state-in-effect rule is disabled for this block.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setConfig(draft.config);
      setSections(draft.sections);
      setBlockOrder(draft.blockOrder);
    }
    hydrated.current = true;
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Mirror the whole draft to localStorage on every change so a reload restores
  // exactly where the user left off (debounced a tick to coalesce rapid edits).
  // Gated on `hydrated` so the deterministic seed never clobbers a saved draft
  // before the restore above has run.
  useEffect(() => {
    if (!hydrated.current) return;
    const t = setTimeout(() => saveDraft(config, sections, blockOrder), 250);
    return () => clearTimeout(t);
  }, [config, sections, blockOrder]);

  // A footer/nav link to a legal page, clicked INSIDE the preview iframe, posts a
  // message up here (instead of navigating to the live `(site)` route, which
  // renders a different config). Switch to the Legal step + that page so the user
  // sees the authored page they clicked.
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      // Only trust messages from our own origin (the same-origin preview iframe).
      // "null" covers the opaque-origin case some browsers report for a srcdoc/
      // about:blank frame we created; a real cross-site attacker has a concrete
      // foreign origin and is rejected.
      if (e.origin !== window.location.origin && e.origin !== "null") return;
      if (!isLegalNavMessage(e.data)) return;
      setStep("legal");
      setLegalSection(e.data.section);
      // Land at the TOP of the freshly-shown page (the inline preview frames + the
      // pane that holds them), not wherever the footer link was clicked.
      requestAnimationFrame(() => {
        document.querySelectorAll<HTMLIFrameElement>("#wb-preview-scroll iframe").forEach((f) => {
          f.contentWindow?.scrollTo(0, 0);
        });
        document.getElementById("wb-preview-scroll")?.scrollTo(0, 0);
      });
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);


  // Derive content.order (section:<index> tokens) from the stable blockOrder.
  // Computed (not stored) so there's no setState-in-effect; fed to the preview and
  // merged into the config only at save time.
  const orderTokens = useMemo(() => {
    return blockOrder
      .map((id) => {
        if (id === "hero" || id === "about" || id === "services") return id;
        const i = sections.findIndex((s) => s.id === id);
        return i >= 0 ? `section:${i}` : null;
      })
      .filter((t): t is string => t != null);
  }, [blockOrder, sections]);

  // The config the preview renders — same draft, but with the derived order so the
  // preview reflects drags live without mutating the stored config every frame.
  const previewConfig = useMemo(
    () => (sameOrder(config.content.order || [], orderTokens) ? config : { ...config, content: { ...config.content, order: orderTokens } }),
    [config, orderTokens]
  );

  // ---------- lifecycle ----------
  useEffect(() => {
    rm.current = prefersReducedMotion();
    const onResize = () => setWin(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (saveT.current) clearTimeout(saveT.current);
      if (pubT.current) clearTimeout(pubT.current);
    };
  }, []);

  // Tick the publish elapsed-seconds clock once per second while a publish is in
  // flight (the loader reads it for the live timer + progress arc). doPublish resets
  // it to 0 at the start of each run, so the interval only needs to increment here.
  useEffect(() => {
    if (!publishing) return;
    const t = setInterval(() => setPublishElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [publishing]);

  // Every view fits the visible frame(s) into the pane BOX (width AND height) so the
  // component is fully visible without scrolling. "all" stacks both frames; the
  // single-frame views fit that one frame. The user zoom factor multiplies on top.
  const previewScale = (() => {
    const availW = paneW - 40; // pane horizontal padding (20 each side)
    const availH = paneH - 40;
    if (availW <= 0 || availH <= 0) return 1;
    // Fit to WIDTH only — the preview pane scrolls vertically (#wb-preview-scroll is
    // overflow:auto), so the desktop width stays consistent regardless of how tall
    // the page is. (Previously we also clamped to the measured height, which made a
    // long page — e.g. a legal/Privacy page — uniformly shrink, distorting the
    // apparent width. Tall content should scroll, not squish.)
    const frameW = previewView === "mobile" ? PREVIEW_MOBILE_WIDTH : PREVIEW_BASE_WIDTH;
    const scale = availW / frameW;
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

  // Animate a freshly-duplicated card sliding in once committed.
  useEffect(() => {
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

  /**
   * Replace the entire draft (config + sections + block order) and jump to the
   * first step. Used by the dev-only "Fill with mock data" / "Clear all data"
   * buttons. The autosave effect persists the new draft to localStorage.
   */
  const loadDraftState = useCallback((draft: { config: AppConfig; sections: DraftSection[]; blockOrder: string[] }) => {
    setConfig(draft.config);
    setSections(draft.sections);
    setBlockOrder(draft.blockOrder);
    setSelectedSectionId("hero");
    setEditingKey(null);
    setStep("identity");
    markDirty();
  }, [markDirty]);

  /** DEV ONLY — populate the draft with the full mock site (INITIAL seed). */
  const fillMockData = useCallback(() => loadDraftState(INITIAL()), [loadDraftState]);

  /** DEV ONLY — wipe to an empty-but-valid draft so you can build from scratch. */
  const clearAllData = useCallback(() => {
    if (typeof window !== "undefined" && !window.confirm("Clear all builder data and start from an empty site? This can't be undone.")) return;
    loadDraftState(BLANK());
  }, [loadDraftState]);

  /**
   * Commit a drag-reorder of the UNIFIED block list. `target` is a gap index into
   * the current card list (0 = top, cards.length = bottom). Reorders blockOrder
   * (the stable card-id list); a derived effect rewrites content.order for render.
   * Hero is pinned, so the result always keeps "hero" first.
   */
  function commitReorder(target: number) {
    const d = dragRef.current;
    if (d == null || d === "hero") return;
    setBlockOrder((order) => {
      const from = order.indexOf(d);
      if (from < 0) return order;
      const next = order.slice();
      next.splice(from, 1);
      const insertAt = target > from ? target - 1 : target;
      next.splice(Math.max(1, Math.min(insertAt, next.length)), 0, d); // ≥1: never above hero
      return ["hero", ...next.filter((id) => id !== "hero")];
    });
    markDirty();
  }

  function dupSection(id: string) {
    const copyId = genId();
    setSections((arr) => {
      const i = arr.findIndex((s) => s.id === id);
      if (i < 0) return arr;
      const copy = { id: copyId, type: arr[i].type, data: clone(arr[i].data) } as DraftSection;
      const next = arr.slice();
      next.splice(i + 1, 0, copy);
      flipAddId.current = copy.id;
      return next;
    });
    // Insert the duplicate right after the original in the unified order.
    setBlockOrder((order) => {
      const at = order.indexOf(id);
      if (at < 0) return order.concat([copyId]);
      const next = order.slice();
      next.splice(at + 1, 0, copyId);
      return next;
    });
    markDirty();
  }

  function removeSection(id: string) {
    const sec = sections.find((s) => s.id === id);
    const anchor = sec ? SECTION_ANCHORS[sec.type] : undefined;
    const navHref = anchor ? `/#${anchor.id}` : undefined;
    const name = sec ? TYPES[sec.type]?.label || "this section" : "this section";
    // Only the LAST section of a given type owns the shared nav link/anchor.
    const lastOfType = !!sec && sections.filter((s) => s.type === sec.type).length <= 1;
    // Is this section currently shown in the nav? (drives the confirm copy + cleanup)
    const inNav = !!navHref && lastOfType && (config.layout?.nav?.links || []).some((l) => l.href === navHref);
    // Always confirm a section delete; call out the nav removal when relevant.
    const msg = inNav
      ? `Delete "${name}"? It's also in your navigation bar — it'll be removed from there too.`
      : `Delete "${name}"? This can't be undone.`;
    if (typeof window !== "undefined" && !window.confirm(msg)) return;

    // If another section of the same type remains, its anchor is still valid, so
    // keep the nav link; only remove it when the LAST one of its type is deleted
    // (lastOfType computed above).
    const finish = () => {
      setSections((arr) => arr.filter((s) => s.id !== id));
      setBlockOrder((order) => order.filter((bid) => bid !== id));
      if (navHref && lastOfType) setCfg((c) => {
        const links = c.layout?.nav?.links;
        if (links) {
          const at = links.findIndex((l) => l.href === navHref);
          if (at >= 0) links.splice(at, 1);
        }
      });
      markDirty();
    };
    const node = document.querySelector<HTMLElement>('[data-id="' + id + '"]');
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
    setBlockOrder((order) => order.concat([sec.id])); // new card lands at the bottom
    setSelectedSectionId(sec.id);
    markDirty();
  }

  /**
   * Build the publishable "flavor": the full AppConfig the render engine reads,
   * with the draft's sections inlined (client ids stripped), the unified
   * `content.order` baked in, and `branding.stylesheet` pinned to the chosen
   * theme (NOT the builder-only preview.css). This is exactly what the backend
   * stores as `tenantConfig` and builds with `TENANT=<slug> next build`.
   */
  function buildFlavor(): PublishPayload {
    const inlineSections = sections.map((s) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = s as DraftSection & { id: string };
      return rest;
    });
    // Colour-theme name → which token file the live site loads as its colour
    // baseline (public/site-css/themes/<theme>.tokens.css). The shared blocks.css
    // supplies all structure; the user's brand colours override the theme defaults.
    const themeName =
      config.branding.theme ||
      (config.branding.stylesheet || "").replace(/^.*\//, "").replace(/\.css$/, "") ||
      DEFAULT_THEME;
    const appConfig: AppConfig = {
      ...config,
      branding: { ...config.branding, theme: themeName },
      // The builder's local `categories` variant types `emphasis` as a plain
      // string; the engine's Section narrows it. The shapes are structurally the
      // same (the cast mirrors preview.tsx's toSection()).
      content: { ...config.content, sections: inlineSections as AppConfig["content"]["sections"], order: orderTokens },
    };
    return { slug, theme: themeName, appConfig };
  }

  /**
   * Publish. Two modes:
   *  - DEMO (default): a front-end-only mock — run a staged sequence (building →
   *    bucket → deploying → live) then reveal the full-page generated site. No
   *    backend; nothing is actually deployed, but the flavor is built for real so
   *    the "live" view renders the true draft.
   *  - REAL (when `NEXT_PUBLIC_PUBLISH_API` is set): POST the flavor and poll the
   *    backend status. The browser never builds either way.
   */
  async function doPublish() {
    if (publishing) return;

    // ── Content-validation gate ── Run the centralized schema validator first. If
    // there are blocking errors, DON'T publish — surface the grouped summary panel
    // so the user can fix each issue (and jump straight to the offending section).
    const issues = validateDraft(config, sections);
    const blocking = blockingIssues(issues);
    if (blocking.length) {
      setPublishIssues(issues);
      return;
    }
    setPublishIssues([]);

    setPublishError(null);
    setSiteUrl("");
    setSiteIsLive(false);
    setPublished(false);
    setPublishStage("building");
    setPublishElapsed(0);
    startStamp.current = Date.now();
    setPublishing(true);

    const flavor = buildFlavor();
    const liveUrl = `${slug}.${PUBLISH_DOMAIN}`;

    // DEMO mode — staged mock, no network. The flavor is still built for real so
    // the revealed "live site" shows exactly what the user created. Stages are
    // chained through one `pubT` handle so unmount cleanup cancels the sequence.
    if (!process.env.NEXT_PUBLIC_PUBLISH_API) {
      const steps: Array<"bucket" | "deploying" | "live"> = ["bucket", "deploying", "live"];
      let i = 0;
      const next = () => {
        const stage = steps[i++];
        if (stage === "live") {
          setSiteUrl(liveUrl);
          setPublishStage("live");
          setPublished(true);
          return;
        }
        setPublishStage(stage);
        pubT.current = setTimeout(next, 800);
      };
      pubT.current = setTimeout(next, 800);
      return;
    }

    // REAL mode — backend build + deploy, polled for status.
    try {
      const res = await publishTenant(flavor);
      if (res.status === "live") { setSiteUrl(res.siteUrl || liveUrl); setSiteIsLive(true); setPublished(true); return; }
      // The BACKEND build can run up to ~30 min, so the frontend MUST outlast it:
      // give up only after MAX (backend 30 min + a grace margin), never before — else
      // the UI abandons a build the backend still considers healthy. Override via
      // NEXT_PUBLIC_PUBLISH_TIMEOUT_MIN when the backend timeout changes.
      // Cadence: a brief 2s warm-up for snappy early feedback, then a flat 10s — a
      // tenant build's state changes on the order of tens of seconds, so 10s keeps
      // request volume sane (~180 calls over a full 30 min) without feeling stale.
      let tries = 0;
      const WARMUP_MS = 2000, STEADY_MS = 10_000, WARMUP_TRIES = 4;
      const timeoutMin = Number(process.env.NEXT_PUBLIC_PUBLISH_TIMEOUT_MIN) || 32;
      const MAX_MS = timeoutMin * 60_000;
      const startedAt = startStamp.current;
      const poll = async () => {
        tries += 1;
        try {
          const s = await getPublishStatus(flavor.slug);
          if (s.status === "live") { setSiteUrl(s.siteUrl || liveUrl); setSiteIsLive(true); setPublished(true); return; }
          if (s.status === "failed") { setPublishError(s.message || "Build failed."); setPublishing(false); return; }
          // Map the backend status to a deploy stage so the stepper advances:
          // queued → building, building → bucket once it's been going a bit, then deploying.
          setPublishStage(s.status === "queued" ? "building" : s.status === "building" ? "bucket" : "deploying");
        } catch { /* transient network blip — keep polling */ }
        if (Date.now() - startedAt < MAX_MS) {
          pubT.current = setTimeout(poll, tries < WARMUP_TRIES ? WARMUP_MS : STEADY_MS);
        } else {
          setPublishError("This build is taking longer than expected. It may still finish — check back shortly, or view the CodeBuild logs.");
          setPublishing(false);
        }
      };
      pubT.current = setTimeout(poll, WARMUP_MS);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Publish failed.");
      setPublishing(false);
    }
  }

  /**
   * Cancel an in-flight publish: stop the poll/stage timer chain and drop the
   * overlay. (The backend build keeps running server-side — this only detaches the
   * UI from it; the user can re-open status later.)
   */
  function cancelPublish() {
    if (pubT.current) clearTimeout(pubT.current);
    pubT.current = null;
    setPublishing(false);
    setPublished(false);
  }

  /**
   * Jump the editor to the section/step an issue points at, and close the summary
   * panel. Used by the pre-publish issue list so each issue is one click to fix.
   */
  function jumpToIssue(issue: ValidationIssue) {
    if (issue.sectionId) {
      setStep("sections");
      setSelectedSectionId(issue.sectionId);
    } else if (issue.step) {
      setStep(issue.step as StepId);
    }
    setPublishIssues([]);
  }

  // ---------- section heading/eyebrow helpers ----------
  function setSectionEyebrow(id: string, val: string) {
    setSections((arr) => arr.map((s) => (s.id === id ? ({ ...s, data: { ...s.data, eyebrow: val } } as DraftSection) : s)));
    markDirty();
  }
  /** Set an arbitrary top-level field on a section's data (lede, ctaLabel, etc.). */
  function setSectionField(id: string, key: string, val: unknown) {
    setSections((arr) => arr.map((s) => (s.id === id ? ({ ...s, data: { ...s.data, [key]: val } } as DraftSection) : s)));
    markDirty();
  }
  /** Mutate one item in a section's data array (e.g. data.items[i].label = …). */
  function setSectionItem(id: string, arrayKey: string, i: number, field: string, val: unknown) {
    setSections((arr) =>
      arr.map((s) => {
        if (s.id !== id) return s;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d: any = clone(s.data);
        if (Array.isArray(d[arrayKey]) && d[arrayKey][i]) d[arrayKey][i][field] = val;
        return { ...s, data: d } as DraftSection;
      })
    );
    markDirty();
  }
  /** Append a blank item (shaped by `make`) to a section's data array. */
  function addSectionItem(id: string, arrayKey: string, make: () => Record<string, unknown>) {
    setSections((arr) =>
      arr.map((s) => {
        if (s.id !== id) return s;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d: any = clone(s.data);
        if (!Array.isArray(d[arrayKey])) d[arrayKey] = [];
        d[arrayKey].push(make());
        return { ...s, data: d } as DraftSection;
      })
    );
    markDirty();
  }
  /** Remove item `i` from a section's data array. */
  function removeSectionItem(id: string, arrayKey: string, i: number) {
    setSections((arr) =>
      arr.map((s) => {
        if (s.id !== id) return s;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d: any = clone(s.data);
        if (Array.isArray(d[arrayKey])) d[arrayKey].splice(i, 1);
        return { ...s, data: d } as DraftSection;
      })
    );
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

  // ---------- field builders (bound to this state via FieldCtx) ----------
  const { buildFields, buildCoreFields, buildSectionDetailFields } = makeFieldBuilders({
    config, sections, setCfg, setSections, markDirty, fragDragRef,
    setSectionEyebrow, setSectionField, setSectionItem, addSectionItem, removeSectionItem,
    itemsNote,
  });

  // ---------- render: cards ----------
  // One unified, ordered card list: Hero (pinned first), then About / Services /
  // every dynamic section in content.order. Everything except Hero is draggable,
  // so e.g. App strip can sit directly below Hero.
  const sectionCards = useMemo(() => {
    const mkCore = (key: string) => {
      const meta = TYPES[key];
      return {
        id: key, // "hero" | "about" | "services"
        core: true,
        label: meta.label,
        tag: "Core",
        dot: meta.tint,
        dotFg: meta.dot,
        iconName: meta.icon,
        summary: coreSummary(key),
        selected: key === selectedSectionId,
        canManage: false,
        draggable: key !== "hero", // Hero stays pinned at the top.
      };
    };
    const mkSec = (sec: DraftSection) => {
      const meta = TYPES[sec.type];
      return {
        id: sec.id,
        core: false,
        label: meta.label,
        tag: "",
        dot: meta.tint,
        dotFg: meta.dot,
        iconName: meta.icon,
        summary: sectionSummary(sec),
        selected: sec.id === selectedSectionId,
        canManage: true,
        draggable: true,
      };
    };
    // Build cards straight from the unified blockOrder so the list matches drag state.
    const byId = new Map(sections.map((s) => [s.id, s] as const));
    return blockOrder
      .map((id) => {
        if (id === "hero" || id === "about" || id === "services") return mkCore(id);
        const sec = byId.get(id);
        return sec ? mkSec(sec) : null;
      })
      .filter((c): c is NonNullable<typeof c> => c != null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections, selectedSectionId, blockOrder]);

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
  const fields = editing ? detailFields : buildFields(step, legalSection);

  const doneCount = Object.keys(DONE).length;
  const pct = Math.round((doneCount / STEPS.length) * 100);

  // ---------- the BuilderApi surface consumed by WebsiteBuilder + sub-components ----------
  return {
    // wizard
    step, setStep, idx, cur, narrow, veryNarrow, editing, editingKey, setEditingKey,
    doneCount, pct,
    // draft
    config, sections, slug,
    // dev-only draft actions
    fillMockData, clearAllData,
    // selection + overlays
    selectedSectionId, setSelectedSectionId,
    pickerOpen, setPickerOpen,
    publishing, setPublishing, published, setPublished, doPublish, siteUrl, siteIsLive, publishError, setPublishError,
    publishStage, publishElapsed, cancelPublish, publishedSiteOpen, setPublishedSiteOpen, devToolsEnabled: DEV_TOOLS_ENABLED,
    publishIssues, setPublishIssues, jumpToIssue,
    previewSheetOpen, setPreviewSheetOpen,
    saved,
    // sections canvas / drag
    sectionCards, dragId, setDragId, dropIndex, setDropIndex, dragRef,
    commitReorder, dupSection, removeSection, addSection,
    // computed editor fields
    fields, detailLabel,
    // preview
    previewConfig, previewView, setPreviewView,
    legalSection, setLegalSection,
    previewScale, sheetScale,
    zoomFactor, setZoomFactor, zoomBy, ZOOM_MIN, ZOOM_MAX, ZOOM_STEP,
  };
}

/** The object returned by useBuilderState — the builder's full state + actions. */
export type BuilderApi = ReturnType<typeof useBuilderState>;
