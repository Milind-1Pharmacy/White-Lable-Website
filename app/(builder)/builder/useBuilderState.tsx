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
 *  ./builderTypes, ./preview, @/types/config.types
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
import type { AppConfig } from "@/types/config.types";
import {
  CORE, DEFAULTS, DONE, INITIAL, STEPS, TYPES,
  type BuilderSectionType, type DraftSection, type StepId,
} from "./builderData";
import {
  clone, genId, headingText, loadDraft, prefersReducedMotion, PUBLISH_DOMAIN, sameOrder, saveDraft,
} from "./builderHelpers";
import type { Field } from "./builderTypes";
import { PREVIEW_BASE_WIDTH, PREVIEW_MOBILE_WIDTH } from "./preview";
import { publishTenant, getPublishStatus, type PublishPayload } from "@/lib/api/publish";
import { makeFieldBuilders } from "./fieldBuilders";

export function useBuilderState() {
  const [step, setStep] = useState<StepId>("sections");
  // Seed deterministically from INITIAL() so the FIRST render is identical on the
  // server and the client (localStorage isn't available server-side; reading it in
  // the initial state caused a hydration mismatch). The persisted draft is restored
  // post-mount in an effect below (still silent/automatic).
  const seed = useRef(INITIAL());
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
  // Set from the publish response once the site goes live; "" until then.
  const [siteUrl, setSiteUrl] = useState("");
  // Non-null when a publish attempt failed (e.g. backend not wired yet).
  const [publishError, setPublishError] = useState<string | null>(null);
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
  // Index of the headline fragment currently being dragged (rich-heading reorder).
  const fragDragRef = useRef<number | null>(null);
  const saveT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pubT = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    const node = document.querySelector<HTMLElement>('[data-id="' + id + '"]');
    const finish = () => {
      setSections((arr) => arr.filter((s) => s.id !== id));
      setBlockOrder((order) => order.filter((bid) => bid !== id));
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
    // Theme slug → the real per-flavor stylesheet the published site ships.
    const themeSlug = (config.branding.stylesheet || "/urmedz.css")
      .replace(/^.*\//, "").replace(/\.css$/, "") || "urmedz";
    const appConfig: AppConfig = {
      ...config,
      branding: { ...config.branding, stylesheet: `/${themeSlug}.css` },
      // The builder's local `categories` variant types `emphasis` as a plain
      // string; the engine's Section narrows it. The shapes are structurally the
      // same (the cast mirrors preview.tsx's toSection()).
      content: { ...config.content, sections: inlineSections as AppConfig["content"]["sections"], order: orderTokens },
    };
    return { slug, theme: themeSlug, appConfig };
  }

  /**
   * Publish: hand the flavor to the backend (which runs the per-tenant build and
   * deploy), then poll for status. The browser never builds. Falls back to a
   * clear error if the publish API isn't reachable yet — the builder keeps working.
   */
  async function doPublish() {
    if (publishing) return;
    setPublishError(null);
    setSiteUrl("");
    setPublished(false);
    setPublishing(true);
    try {
      const flavor = buildFlavor();
      const res = await publishTenant(flavor);
      if (res.status === "live") {
        setSiteUrl(res.siteUrl || `${slug}.${PUBLISH_DOMAIN}`);
        setPublished(true);
        return;
      }
      // Poll status (no WebSocket) until live/failed or a sane cap.
      let tries = 0;
      const poll = async () => {
        tries += 1;
        try {
          const s = await getPublishStatus(flavor.slug);
          if (s.status === "live") {
            setSiteUrl(s.siteUrl || `${slug}.${PUBLISH_DOMAIN}`);
            setPublished(true);
            return;
          }
          if (s.status === "failed") {
            setPublishError(s.message || "Build failed.");
            setPublishing(false);
            return;
          }
        } catch {
          /* transient — keep polling */
        }
        if (tries < 60) pubT.current = setTimeout(poll, 2000);
        else { setPublishError("Build is taking longer than expected."); setPublishing(false); }
      };
      pubT.current = setTimeout(poll, 2000);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Publish failed.");
      setPublishing(false);
    }
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
  const fields = editing ? detailFields : buildFields(step);

  const doneCount = Object.keys(DONE).length;
  const pct = Math.round((doneCount / STEPS.length) * 100);

  // ---------- the BuilderApi surface consumed by WebsiteBuilder + sub-components ----------
  return {
    // wizard
    step, setStep, idx, cur, narrow, veryNarrow, editing, editingKey, setEditingKey,
    doneCount, pct,
    // draft
    config, sections, slug,
    // selection + overlays
    selectedSectionId, setSelectedSectionId,
    pickerOpen, setPickerOpen,
    publishing, setPublishing, published, setPublished, doPublish, siteUrl, publishError, setPublishError,
    previewSheetOpen, setPreviewSheetOpen,
    saved,
    // sections canvas / drag
    sectionCards, dragId, setDragId, dropIndex, setDropIndex, dragRef,
    commitReorder, dupSection, removeSection, addSection,
    // computed editor fields
    fields, detailLabel,
    // preview
    previewConfig, previewView, setPreviewView,
    previewScale, sheetScale,
    zoomFactor, setZoomFactor, zoomBy, ZOOM_MIN, ZOOM_MAX, ZOOM_STEP,
    setDeskH, setMobH,
  };
}

/** The object returned by useBuilderState — the builder's full state + actions. */
export type BuilderApi = ReturnType<typeof useBuilderState>;
