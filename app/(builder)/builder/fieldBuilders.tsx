/**
 * @file fieldBuilders.tsx
 * @description Turns the in-memory draft into editor `Field[]` descriptors for
 *  each wizard step / selected section. Pure of React state — it operates on a
 *  `FieldCtx` (the draft + mutators) supplied by useBuilderState, so it can be
 *  read and tested in isolation from the component tree.
 * @responsibilities
 *  - buildFields(step) — fields for a top-level wizard step.
 *  - buildCoreFields(key) — fields for the hero/about/services core blocks.
 *  - buildSectionDetailFields(sec) — fields for a dynamic section.
 *  - ensure-helpers, richField, sectionHeadingField, renderRichInline.
 * @dependencies react, ./builderData, ./builderHelpers, ./builderStyles,
 *  ./builderTypes, @/types/config.types
 * @author WhiteLabel Platform Team
 * @created 2026-06-23
 */
"use client";

import React from "react";
import type { AppConfig } from "@/types/config.types";
import { SECTION_ANCHORS, type DraftSection, type StepId } from "./builderData";
import { clone } from "./builderHelpers";
import { brStyle, switchStyles } from "./builderStyles";
import type { AreaEvt, Field, InputEvt, ItemCol, KeyEvt, SelectEvt } from "./builderTypes";
import { THEME_PRESETS, DEFAULT_THEME, presetByName } from "./themePresets";
import { SECTION_RULES, limit, type TextLimitId, type CharLimit } from "./validationSchema";

/** Spreadable {max,min} char-limit props for a Field/column from a TEXT_LIMITS id. */
function limProps(id?: TextLimitId): { max?: number; min?: number } {
  const l: CharLimit | undefined = limit(id);
  return l ? { max: l.max, min: l.min } : {};
}

/** Everything the field builders need from the builder's state engine. */
export type FieldCtx = {
  config: AppConfig;
  sections: DraftSection[];
  setCfg: (mutator: (c: AppConfig) => void) => void;
  setSections: React.Dispatch<React.SetStateAction<DraftSection[]>>;
  markDirty: () => void;
  fragDragRef: React.MutableRefObject<number | null>;
  setSectionEyebrow: (id: string, val: string) => void;
  setSectionField: (id: string, key: string, val: unknown) => void;
  setSectionItem: (id: string, arrayKey: string, i: number, field: string, val: unknown) => void;
  addSectionItem: (id: string, arrayKey: string, make: () => Record<string, unknown>) => void;
  removeSectionItem: (id: string, arrayKey: string, i: number) => void;
  itemsNote: (sec: DraftSection) => string;
};

/**
 * makeFieldBuilders - bind the field-builder functions to a context. The returned
 * builders close over `ctx`, so their cross-calls and handler closures work
 * exactly as they did inside the component, with zero `ctx.` threading.
 */
export function makeFieldBuilders(ctx: FieldCtx) {
  const {
    config, sections, setCfg, setSections, markDirty, fragDragRef,
    setSectionEyebrow, setSectionField, setSectionItem, addSectionItem, removeSectionItem,
    itemsNote,
  } = ctx;

  function buildFields(s: StepId): Field[] {
    const C = config;
    let out: Field[] = [];
    if (s === "identity")
      out = [
        { kind: "text", label: "Business name", value: C.tenant.name, placeholder: "e.g. Northwind Bakehouse", help: "Shown in the header, footer and browser tab.", ...limProps("name"), count: C.tenant.name.length, onChange: (e: InputEvt) => setCfg((c) => (c.tenant.name = e.target.value)) },
        { kind: "text", label: "Category", value: C.tenant.category, placeholder: "e.g. Artisan Bakery & Café", help: "A short descriptor of what you do.", ...limProps("eyebrow"), count: C.tenant.category.length, onChange: (e: InputEvt) => setCfg((c) => (c.tenant.category = e.target.value)) },
      ];
    else if (s === "branding") {
      // Colour theme FIRST — picking a preset fills the six colour fields below.
      out = [{ kind: "group", label: "Colour theme", sub: "Pick a ready-made colour set, then fine-tune any colour below." }];
      out.push({
        kind: "select",
        label: "Theme",
        help: "Sets the colour scheme. You can override any individual colour after.",
        value: C.branding.theme || DEFAULT_THEME,
        options: THEME_PRESETS.map((p) => ({ value: p.name, label: p.label })),
        onChange: (e: SelectEvt) =>
          setCfg((c) => {
            const preset = presetByName(e.target.value);
            c.branding.theme = preset.name;
            // Fill the six brand colours from the preset (user can still tweak each).
            c.branding.colors = { ...preset.colors };
          }),
      });
      out.push({ kind: "group", label: "Brand colours", sub: "Six tokens drive every surface of your published site. Type a hex to override the theme." });
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
      out.push({ kind: "upload", label: "Logo mark", hint: "PNG or SVG · square, transparent", value: C.branding.logo || "", onChange: (url: string) => setCfg((c) => (c.branding.logo = url)) });
    } else if (s === "seo")
      out = [
        { kind: "text", label: "Page title", value: C.seo.title, help: "Appears in search results and the browser tab. Aim for ~60 characters.", ...limProps("seoTitle"), count: C.seo.title.length, onChange: (e: InputEvt) => setCfg((c) => (c.seo.title = e.target.value)) },
        { kind: "area", label: "Meta description", value: C.seo.description, help: "A one–two sentence summary shown by search engines.", ...limProps("seoDescription"), count: C.seo.description.length, onChange: (e: AreaEvt) => setCfg((c) => (c.seo.description = e.target.value)) },
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
        { kind: "upload", label: "Social share image", hint: "1200×630 · shown when the link is shared", value: C.seo.ogImage || "", onChange: (url: string) => setCfg((c) => (c.seo.ogImage = url)) },
      ];
    else if (s === "navigation") {
      const nav = C.layout?.nav;
      const footer = C.layout?.footer;
      const sticky = C.layout?.stickyCta;
      // Scroll targets available in THIS draft: the core blocks + any added
      // section whose module renders an anchor id (see SECTION_ANCHORS). A nav
      // link points at one of these so it scrolls the page (no route change).
      // Every section type is anchorable now, so the dropdown lists ALL the
      // blocks present in the draft, each carrying a friendly default label.
      const targets: Array<{ href: string; label: string; navLabel: string }> = [];
      const seenHref = new Set<string>();
      const pushTarget = (type: string) => {
        const a = SECTION_ANCHORS[type];
        if (!a) return;
        const href = `/#${a.id}`;
        if (seenHref.has(href)) return;
        seenHref.add(href);
        targets.push({ href, label: a.label, navLabel: a.navLabel });
      };
      pushTarget("hero");
      if (C.content.about) pushTarget("about");
      if (C.content.services?.length) pushTarget("services");
      sections.forEach((sec) => pushTarget(sec.type));
      const navLabelFor = (href: string) => targets.find((t) => t.href === href)?.navLabel || "";

      out = [
        { kind: "group", label: "Navigation bar", sub: "Each link scrolls to one of your sections — pick the section and give it a label." },
        {
          kind: "navlinks",
          addLabel: "Add link",
          targets,
          rows: ((nav?.links as Array<{ label?: string; href?: string }>) || []).map((lnk, i) => ({
            label: lnk.label || "",
            href: lnk.href || "",
            onLabel: (e: InputEvt) => setCfg((c) => { const arr = ensureNav(c).links!; if (arr[i]) arr[i].label = e.target.value; }),
            // Switching the target section auto-fills the label with that section's
            // friendly default UNLESS the user has typed a custom label already.
            onTarget: (e: SelectEvt) => setCfg((c) => {
              const arr = ensureNav(c).links!;
              if (!arr[i]) return;
              const wasDefault = !arr[i].label || arr[i].label === navLabelFor(arr[i].href);
              arr[i].href = e.target.value;
              if (wasDefault) arr[i].label = navLabelFor(e.target.value) || arr[i].label;
            }),
            onRemove: () => setCfg((c) => ensureNav(c).links!.splice(i, 1)),
          })),
          onAdd: () => setCfg((c) => {
            const arr = ensureNav(c).links!;
            // Default the new link to the first section not already linked, with
            // that section's friendly label prefilled.
            const used = new Set(arr.map((l) => l.href));
            const pick = targets.find((t) => !used.has(t.href)) || targets[0];
            arr.push({ label: pick?.navLabel || "Link", href: pick?.href || "/#top" });
          }),
        },
        { kind: "group", label: "Nav CTAs", sub: "Buttons on the right of the header (external links allowed)." },
        {
          kind: "navctas",
          addLabel: "Add CTA",
          colors: C.branding.colors,
          rows: ((nav?.ctas as Array<{ label?: string; href?: string; variant?: string }>) || []).map((cta, i) => ({
            label: cta.label || "",
            href: cta.href || "",
            variant: cta.variant || "primary",
            onLabel: (e: InputEvt) => setCfg((c) => { const arr = ensureNav(c).ctas!; if (arr[i]) arr[i].label = e.target.value; }),
            onHref: (e: InputEvt) => setCfg((c) => { const arr = ensureNav(c).ctas!; if (arr[i]) arr[i].href = e.target.value; }),
            onVariant: (e: SelectEvt) => setCfg((c) => { const arr = ensureNav(c).ctas!; if (arr[i]) arr[i].variant = e.target.value as never; }),
            onRemove: () => setCfg((c) => ensureNav(c).ctas!.splice(i, 1)),
          })),
          onAdd: () => setCfg((c) => ensureNav(c).ctas!.push({ label: "New CTA", href: "/", variant: "primary" })),
        },
        { kind: "group", label: "Footer", sub: "Headline, blurb and link columns." },
        richField("Footer headline", footer?.headline?.parts || [], (m) =>
          setCfg((c) => { const f = ensureFooter(c); if (!f.headline) f.headline = { parts: [] }; m(f.headline.parts); })
        ),
        { kind: "area", label: "Footer description", value: footer?.description || "", onChange: (e: AreaEvt) => setCfg((c) => (ensureFooter(c).description = e.target.value)) },
        { kind: "group", label: "Sticky CTA", sub: "The bar that follows the user up the page." },
        { kind: "toggle", label: "Show sticky CTA", trackStyle: switchStyles(!!sticky?.enabled, false).track, knobStyle: switchStyles(!!sticky?.enabled, false).knob, onToggle: () => setCfg((c) => { const st = ensureSticky(c); st.enabled = !st.enabled; }) },
        { kind: "text", label: "Text", value: sticky?.text || "", placeholder: "The UrMedz app is here.", onChange: (e: InputEvt) => setCfg((c) => (ensureSticky(c).text = e.target.value)) },
        { kind: "text", label: "Button label", value: sticky?.ctaLabel || "", placeholder: "Download App Now", onChange: (e: InputEvt) => setCfg((c) => (ensureSticky(c).ctaLabel = e.target.value)) },
        { kind: "text", label: "Button link", value: sticky?.ctaHref || "", placeholder: "#app", onChange: (e: InputEvt) => setCfg((c) => (ensureSticky(c).ctaHref = e.target.value)) },
      ];
    } else if (s === "contact")
      out = [
        { kind: "text", label: "Email", value: C.contact.email, ...limProps("email"), count: (C.contact.email ?? "").length, onChange: (e: InputEvt) => setCfg((c) => (c.contact.email = e.target.value)) },
        { kind: "text", label: "Phone", value: C.contact.phone, ...limProps("phone"), count: (C.contact.phone ?? "").length, onChange: (e: InputEvt) => setCfg((c) => (c.contact.phone = e.target.value)) },
        { kind: "area", label: "Address", value: C.contact.address, ...limProps("address"), count: (C.contact.address ?? "").length, onChange: (e: AreaEvt) => setCfg((c) => (c.contact.address = e.target.value)) },
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
    // Core blocks read the SAME schema as dynamic sections, so every field shows its
    // limit. crule = this block's rule; the helpers below resolve caps/counts from it.
    const crule = SECTION_RULES[key];
    /** Text {max,min} props for a core text key. */
    const tcap = (k: string) => limProps(crule?.textFields?.[k]);
    /** Item-column {max,min} props for a core array column. */
    const ccap = (arrayKey: string, colKey: string) => limProps(crule?.itemTextFields?.[arrayKey]?.[colKey]);
    /** Group count metadata (count/min/max/atMax/belowMin/countLabel) for a core array. */
    const itemMeta = (arrayKey: string, arr: unknown[]) => {
      const ar = crule?.arrays?.[arrayKey];
      const count = arr.length;
      const max = ar?.max, min = ar?.min;
      return { count, min, max, atMax: max != null && count >= max, belowMin: min != null && count < min, countLabel: ar?.label };
    };
    if (key === "hero") {
      const hero = C.content.hero;
      const parts = hero.headlineRich?.parts || [];
      return [
        { kind: "group", label: "Headline", sub: "Mix italics and accent colour for emphasis." },
        { kind: "text", label: "Eyebrow", value: hero.eyebrow, placeholder: "Small label above the headline", ...tcap("eyebrow"), count: (hero.eyebrow || "").length, onChange: (e: InputEvt) => setCfg((c) => (c.content.hero.eyebrow = e.target.value)) },
        richField("Headline", parts, (mutate) =>
          setCfg((c) => {
            if (!c.content.hero.headlineRich) c.content.hero.headlineRich = { parts: [] };
            mutate(c.content.hero.headlineRich.parts);
            c.content.hero.headline = c.content.hero.headlineRich.parts.map((p) => p.text).join(" ");
          }), crule?.headingLimit
        ),
        { kind: "area", label: "Tagline", value: hero.tagline, ...tcap("tagline"), count: (hero.tagline || "").length, onChange: (e: AreaEvt) => setCfg((c) => (c.content.hero.tagline = e.target.value)) },
        { kind: "group", label: "Calls to action", sub: "Transactional labels are auto-rewritten to stay compliant." },
        { kind: "text", label: "Primary button", value: hero.cta.label, ...limProps("buttonLabel"), count: (hero.cta.label || "").length, onChange: (e: InputEvt) => setCfg((c) => (c.content.hero.cta.label = e.target.value)) },
        { kind: "text", label: "Secondary button", value: hero.secondaryCta?.label || "", ...limProps("buttonLabel"), count: (hero.secondaryCta?.label || "").length, onChange: (e: InputEvt) => setCfg((c) => { if (!c.content.hero.secondaryCta) c.content.hero.secondaryCta = { label: "" }; c.content.hero.secondaryCta.label = e.target.value; }) },
        { kind: "text", label: "Secondary link", value: hero.secondaryCta?.href || "", placeholder: "/#services", onChange: (e: InputEvt) => setCfg((c) => { if (!c.content.hero.secondaryCta) c.content.hero.secondaryCta = { label: "" }; c.content.hero.secondaryCta.href = e.target.value; }) },
        { kind: "group", label: "Imagery", sub: "The first image is your main hero image. Add more to turn it into a carousel." },
        {
          kind: "items",
          addLabel: "Add image",
          ...itemMeta("slides", hero.slides || []),
          rows: (hero.slides || []).map((sl, i) => ({
            cols: [
              { key: "image", label: i === 0 ? "Image (main hero)" : "Image", upload: true, placeholder: "/tenant/gallery/img.png", value: sl.image || "", onChange: () => {}, onUpload: (url: string) => setCfg((c) => { if (c.content.hero.slides?.[i]) c.content.hero.slides[i].image = url; }) },
              { key: "tag", label: "Tag", placeholder: "Quick commerce", ...ccap("slides", "tag"), value: sl.tag || "", onChange: (e: InputEvt | AreaEvt) => setCfg((c) => { if (c.content.hero.slides?.[i]) c.content.hero.slides[i].tag = e.target.value; }), onUpload: () => {} },
              { key: "caption", label: "Caption", area: true, placeholder: "Same-day delivery, neighbourhood-fast", ...ccap("slides", "caption"), value: sl.caption || "", onChange: (e: InputEvt | AreaEvt) => setCfg((c) => { if (c.content.hero.slides?.[i]) c.content.hero.slides[i].caption = e.target.value; }), onUpload: () => {} },
            ],
            onRemove: () => setCfg((c) => { c.content.hero.slides?.splice(i, 1); }),
          })),
          onAdd: () => setCfg((c) => { if ((c.content.hero.slides?.length ?? 0) >= (crule?.arrays?.slides?.max ?? Infinity)) return; if (!c.content.hero.slides) c.content.hero.slides = []; c.content.hero.slides.push({ image: "" }); }),
        },
        { kind: "group", label: "Stats", sub: "The big numbers shown beside the hero image." },
        {
          kind: "items",
          addLabel: "Add stat",
          ...itemMeta("meta", hero.meta || []),
          rows: (hero.meta || []).map((m, i) => ({
            cols: [
              { key: "value", label: "Value", placeholder: "25", ...ccap("meta", "value"), value: m.value || "", onChange: (e: InputEvt | AreaEvt) => setCfg((c) => { ensureMeta(c)[i].value = e.target.value; }), onUpload: () => {} },
              { key: "suffix", label: "Suffix", placeholder: "+ / k / day", ...ccap("meta", "suffix"), value: m.suffix || "", onChange: (e: InputEvt | AreaEvt) => setCfg((c) => { ensureMeta(c)[i].suffix = e.target.value; }), onUpload: () => {} },
              { key: "label", label: "Label", placeholder: "Retail stores across South India", area: true, ...ccap("meta", "label"), value: m.label || "", onChange: (e: InputEvt | AreaEvt) => setCfg((c) => { ensureMeta(c)[i].label = e.target.value; }), onUpload: () => {} },
            ],
            onRemove: () => setCfg((c) => { c.content.hero.meta?.splice(i, 1); }),
          })),
          onAdd: () => setCfg((c) => { if ((c.content.hero.meta?.length ?? 0) >= (crule?.arrays?.meta?.max ?? Infinity)) return; ensureMeta(c).push({ value: "0", suffix: "", label: "New stat" }); }),
        },
        { kind: "group", label: "Status rail", sub: "Optional live-status badge beside the hero." },
        { kind: "text", label: "Live label", value: hero.rail?.liveLabel || "", placeholder: "Live", ...limProps("badge"), count: (hero.rail?.liveLabel || "").length, onChange: (e: InputEvt) => setCfg((c) => { ensureRail(c).liveLabel = e.target.value; }) },
        { kind: "text", label: "Location text", value: hero.rail?.locationText || "", placeholder: "Bengaluru", ...limProps("badge"), count: (hero.rail?.locationText || "").length, onChange: (e: InputEvt) => setCfg((c) => { ensureRail(c).locationText = e.target.value; }) },
        { kind: "text", label: "Badge text", value: hero.rail?.badgeText || "", placeholder: "EST 2024", ...limProps("badge"), count: (hero.rail?.badgeText || "").length, onChange: (e: InputEvt) => setCfg((c) => { ensureRail(c).badgeText = e.target.value; }) },
        {
          kind: "tags",
          label: "Badge dot colours",
          placeholder: "Add a hex colour, press Enter",
          items: (hero.rail?.badgeColors || []).map((col, i) => ({ text: col, onRemove: () => setCfg((c) => c.content.hero.rail?.badgeColors?.splice(i, 1)) })),
          onAdd: (e: KeyEvt) => {
            if (e.key === "Enter" && e.currentTarget.value.trim()) {
              const v = e.currentTarget.value.trim();
              e.currentTarget.value = "";
              setCfg((c) => { const r = ensureRail(c); if (!r.badgeColors) r.badgeColors = []; r.badgeColors.push(v); });
            }
          },
        },
      ];
    }
    if (key === "about") {
      const a = C.content.about || { description: "" };
      return [
        { kind: "text", label: "Eyebrow", value: a.eyebrow, ...tcap("eyebrow"), count: (a.eyebrow || "").length, onChange: (e: InputEvt) => setCfg((c) => ensureAbout(c).eyebrow = e.target.value) },
        richField("Title", a.title?.parts || [], (mutate) =>
          setCfg((c) => { const ab = ensureAbout(c); if (!ab.title) ab.title = { parts: [] }; mutate(ab.title.parts); }), crule?.headingLimit
        ),
        { kind: "area", label: "Lede", value: a.lede, placeholder: "Intro paragraph above the story", ...tcap("lede"), count: (a.lede || "").length, onChange: (e: AreaEvt) => setCfg((c) => (ensureAbout(c).lede = e.target.value)) },
        { kind: "area", label: "Your story", value: a.description, ...tcap("description"), count: (a.description || "").length, onChange: (e: AreaEvt) => setCfg((c) => (ensureAbout(c).description = e.target.value)) },
        // NOTE: modules/About.tsx renders eyebrow/title/lede + pillars only — it has
        // no image slot, so an "About image" upload would be dead (nothing renders).
        { kind: "group", label: "Pillars", sub: "Numbered cards beneath the story." },
        {
          kind: "items",
          addLabel: "Add pillar",
          ...itemMeta("pillars", a.pillars || []),
          rows: (a.pillars || []).map((p, i) => ({
            cols: [
              { key: "n", label: "Number", placeholder: "01", ...ccap("pillars", "n"), value: p.n || "", onChange: (e: InputEvt | AreaEvt) => setCfg((c) => { const pl = ensureAbout(c).pillars; if (pl?.[i]) pl[i].n = e.target.value; }), onUpload: () => {} },
              { key: "title", label: "Title", placeholder: "50,000 sft fulfilment", ...ccap("pillars", "title"), value: p.title || "", onChange: (e: InputEvt | AreaEvt) => setCfg((c) => { const pl = ensureAbout(c).pillars; if (pl?.[i]) pl[i].title = e.target.value; }), onUpload: () => {} },
              { key: "body", label: "Body", area: true, placeholder: "Purpose-built centres…", ...ccap("pillars", "body"), value: p.body || "", onChange: (e: InputEvt | AreaEvt) => setCfg((c) => { const pl = ensureAbout(c).pillars; if (pl?.[i]) pl[i].body = e.target.value; }), onUpload: () => {} },
              { key: "accent", label: "Accent", placeholder: "#F5A623", value: p.accent || "", onChange: (e: InputEvt | AreaEvt) => setCfg((c) => { const pl = ensureAbout(c).pillars; if (pl?.[i]) pl[i].accent = e.target.value; }), onUpload: () => {} },
              { key: "meta", label: "Meta", placeholder: "Bengaluru · Hyderabad", ...ccap("pillars", "meta"), value: p.meta || "", onChange: (e: InputEvt | AreaEvt) => setCfg((c) => { const pl = ensureAbout(c).pillars; if (pl?.[i]) pl[i].meta = e.target.value; }), onUpload: () => {} },
            ],
            onRemove: () => setCfg((c) => { ensureAbout(c).pillars?.splice(i, 1); }),
          })),
          onAdd: () => setCfg((c) => { const ab = ensureAbout(c); if ((ab.pillars?.length ?? 0) >= (crule?.arrays?.pillars?.max ?? Infinity)) return; if (!ab.pillars) ab.pillars = []; ab.pillars.push({ n: "", title: "New pillar", body: "", accent: "#1FAFA6", meta: "" }); }),
        },
      ];
    }
    // services
    const sm = C.content.servicesMeta;
    return [
      { kind: "group", label: "Services heading", sub: "Eyebrow + heading shown above the grid." },
      { kind: "text", label: "Eyebrow", value: sm?.eyebrow || "", ...tcap("eyebrow"), count: (sm?.eyebrow || "").length, onChange: (e: InputEvt) => setCfg((c) => (ensureServicesMeta(c).eyebrow = e.target.value)) },
      richField("Heading", sm?.heading?.parts || [], (mutate) =>
        setCfg((c) => { const m = ensureServicesMeta(c); if (!m.heading) m.heading = { parts: [] }; mutate(m.heading.parts); }), crule?.headingLimit
      ),
      { kind: "text", label: "CTA label", value: sm?.ctaLabel || "", placeholder: "All services", ...tcap("ctaLabel"), count: (sm?.ctaLabel || "").length, onChange: (e: InputEvt) => setCfg((c) => (ensureServicesMeta(c).ctaLabel = e.target.value)) },
      { kind: "text", label: "CTA link", value: sm?.ctaHref || "", placeholder: "/services", onChange: (e: InputEvt) => setCfg((c) => (ensureServicesMeta(c).ctaHref = e.target.value)) },
      { kind: "group", label: "Service cards", sub: "What you offer — rendered as a card grid." },
      {
        kind: "items",
        addLabel: "Add service",
        ...itemMeta("items", C.content.services || []),
        rows: (C.content.services || []).map((sv, i) => ({
          cols: [
            { key: "title", label: "Title", placeholder: "Retail Stores", ...ccap("items", "title"), value: sv.title || "", onChange: (e: InputEvt | AreaEvt) => setCfg((c) => { c.content.services![i].title = e.target.value; }), onUpload: () => {} },
            { key: "description", label: "Description", area: true, placeholder: "Short description", ...ccap("items", "description"), value: sv.description || "", onChange: (e: InputEvt | AreaEvt) => setCfg((c) => { c.content.services![i].description = e.target.value; }), onUpload: () => {} },
            { key: "icon", label: "Icon", upload: true, placeholder: "/tenant/services/icon.png", value: sv.icon || "", onChange: () => {}, onUpload: (url: string) => setCfg((c) => { c.content.services![i].icon = url; }) },
          ],
          onRemove: () => setCfg((c) => c.content.services!.splice(i, 1)),
        })),
        onAdd: () => setCfg((c) => { if ((c.content.services?.length ?? 0) >= (crule?.arrays?.items?.max ?? Infinity)) return; if (!c.content.services) c.content.services = []; c.content.services.push({ title: "New service", description: "" }); }),
      },
    ];
  }
  /** Ensure content.servicesMeta exists, returning it for in-place mutation. */
  function ensureServicesMeta(c: AppConfig) {
    if (!c.content.servicesMeta) c.content.servicesMeta = {};
    return c.content.servicesMeta;
  }
  /** Ensure layout.nav (+ its arrays) exists, returning it for in-place mutation. */
  function ensureNav(c: AppConfig) {
    if (!c.layout) c.layout = {};
    if (!c.layout.nav) c.layout.nav = {};
    if (!c.layout.nav.links) c.layout.nav.links = [];
    if (!c.layout.nav.ctas) c.layout.nav.ctas = [];
    return c.layout.nav;
  }
  /** Ensure layout.footer exists, returning it for in-place mutation. */
  function ensureFooter(c: AppConfig) {
    if (!c.layout) c.layout = {};
    if (!c.layout.footer) c.layout.footer = {};
    return c.layout.footer;
  }
  /** Ensure layout.stickyCta exists, returning it for in-place mutation. */
  function ensureSticky(c: AppConfig) {
    if (!c.layout) c.layout = {};
    if (!c.layout.stickyCta) c.layout.stickyCta = {};
    return c.layout.stickyCta;
  }

  function ensureAbout(c: AppConfig) {
    if (!c.content.about) c.content.about = { description: "" };
    return c.content.about;
  }
  /** Ensure hero.meta exists, returning it for in-place mutation. */
  function ensureMeta(c: AppConfig) {
    if (!c.content.hero.meta) c.content.hero.meta = [];
    return c.content.hero.meta;
  }
  /** Ensure hero.rail exists, returning it for in-place mutation. */
  function ensureRail(c: AppConfig) {
    if (!c.content.hero.rail) c.content.hero.rail = {};
    return c.content.hero.rail;
  }
  /**
   * Generic rich-heading field. `parts` is the current fragment array; `apply`
   * receives a mutator over the LIVE parts array (in whatever draft slice it
   * belongs to) and is responsible for persisting (config or sections). This is
   * the hero fragment editor generalized to any RichHeading path.
   */
  function richField(
    label: string,
    parts: Array<{ text: string; emphasis?: string; br?: boolean }>,
    apply: (mutate: (parts: Array<{ text: string; emphasis?: string; br?: boolean }>) => void) => void,
    limitId?: TextLimitId
  ): Field {
    const setPart = (i: number, fn: (p: { text: string; emphasis?: string; br?: boolean }) => void) =>
      apply((ps) => { if (ps[i]) fn(ps[i]); });
    // Per-fragment char limit (the heading cap) so every fragment input shows a pill + hard cap.
    const cap = limProps(limitId);
    return {
      kind: "rich",
      label,
      richPreview: renderRichInline(parts, config.branding.colors.accent || "#C2410C"),
      fragments: parts.map((p, i) => ({
        index: i,
        text: p.text,
        emphasis: p.emphasis || "",
        max: cap.max,
        min: cap.min,
        brStyle: brStyle(!!p.br),
        onText: (e: InputEvt) => setPart(i, (pp) => (pp.text = e.target.value)),
        onEmphasis: (e: SelectEvt) => setPart(i, (pp) => { const v = e.target.value; if (v) pp.emphasis = v; else delete pp.emphasis; }),
        onBreak: () => setPart(i, (pp) => (pp.br = !pp.br)),
        onRemove: () => apply((ps) => { ps.splice(i, 1); }),
        onDragStart: () => { fragDragRef.current = i; },
        onDropOn: () => { const from = fragDragRef.current; if (from != null && from !== i) apply((ps) => { const [m] = ps.splice(from, 1); ps.splice(i, 0, m); }); fragDragRef.current = null; },
        onDragEnd: () => { fragDragRef.current = null; },
      })),
      onAdd: () => apply((ps) => { ps.push({ text: "text" }); }),
    };
  }

  /** Build a rich field bound to a section's `data.heading` (sections slice). */
  function sectionHeadingField(secId: string, label = "Heading", limitId?: TextLimitId): Field {
    const sec = sections.find((s) => s.id === secId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parts = ((sec?.data as any)?.heading?.parts as Array<{ text: string; emphasis?: string; br?: boolean }>) || [];
    return richField(label, parts, (mutate) => {
      setSections((arr) =>
        arr.map((s) => {
          if (s.id !== secId) return s;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data: any = clone(s.data);
          if (!data.heading || !Array.isArray(data.heading.parts)) data.heading = { parts: [] };
          mutate(data.heading.parts);
          return { ...s, data } as DraftSection;
        })
      );
      markDirty();
    }, limitId);
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

  /**
   * Section-detail fields: the eyebrow + heading every block shares, plus a
   * per-type set of block-level fields and an editable, add/removeable list of
   * the section's items (so Stats metrics, FAQ Q&As, Team departments, etc. are
   * all editable from here — no "full editor" placeholder).
   */
  function buildSectionDetailFields(sec: DraftSection): Field[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d: any = sec.data || {};
    const id = sec.id;
    // Validation rule for this section type — the single source of truth for char
    // limits + item min/max. Helpers below read from it so NO number is hardcoded here.
    const rule = SECTION_RULES[sec.type];
    /** Resolve the {max,min} char limit for a section-level text key (via the schema). */
    const capFor = (key: string) => limProps(rule?.textFields?.[key]);
    /** Resolve the {max,min} char limit for an item-level field within an array. */
    const itemCapFor = (arrayKey: string, itemKey: string) =>
      limProps(rule?.itemTextFields?.[arrayKey]?.[itemKey]);
    const txt = (key: string, label: string, placeholder?: string): Field => ({
      kind: "text", label, value: d[key] || "", placeholder,
      ...capFor(key), count: String(d[key] || "").length,
      onChange: (e: InputEvt) => setSectionField(id, key, e.target.value),
    });
    const area = (key: string, label: string, placeholder?: string): Field => ({
      kind: "area", label, value: d[key] || "", placeholder,
      ...capFor(key), count: String(d[key] || "").length,
      onChange: (e: AreaEvt) => setSectionField(id, key, e.target.value),
    });
    // A text field bound to a nested object key on the section's data (e.g. ledger.footnote).
    const subTxt = (objKey: string, key: string, label: string, placeholder?: string): Field => ({
      kind: "text", label, placeholder,
      value: (d[objKey] && d[objKey][key]) || "",
      onChange: (e: InputEvt) =>
        setSections((arr) => arr.map((s) => {
          if (s.id !== id) return s;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const dd: any = clone(s.data);
          if (!dd[objKey] || typeof dd[objKey] !== "object") dd[objKey] = {};
          dd[objKey][key] = e.target.value;
          markDirty();
          return { ...s, data: dd } as DraftSection;
        })),
    });
    // Build an editable item list. `cols` declares each item's sub-fields. Count
    // limits (min/max/label) + per-column char caps come from the section's schema
    // rule — nothing is hardcoded. The `items` field carries count/min/max so the
    // renderer can show "Label N/M", disable Add at max, and warn below min.
    const itemList = (arrayKey: string, addLabel: string, make: () => Record<string, unknown>, cols: ItemCol[]): Field => {
      const arr = (d[arrayKey] as unknown[]) || [];
      const ar = rule?.arrays?.[arrayKey];
      const count = arr.length;
      const max = ar?.max;
      const min = ar?.min;
      const atMax = max != null && count >= max;
      return {
        kind: "items",
        addLabel,
        count,
        min,
        max,
        atMax,
        belowMin: min != null && count < min,
        countLabel: ar?.label,
        rows: (arr as Record<string, unknown>[]).map((it, i) => ({
          cols: cols.map((col) => {
            const cap = itemCapFor(arrayKey, col.key);
            return {
              ...col,
              ...cap,
              value: it[col.key] == null ? "" : String(it[col.key]),
              onChange: (e: InputEvt | AreaEvt) =>
                setSectionItem(id, arrayKey, i, col.key, col.numeric ? Number(e.target.value) || 0 : e.target.value),
              onUpload: (url: string) => setSectionItem(id, arrayKey, i, col.key, url),
            };
          }),
          onRemove: () => removeSectionItem(id, arrayKey, i),
        })),
        // Add is a no-op once at max (the renderer also disables the button).
        onAdd: () => { if (!atMax) addSectionItem(id, arrayKey, make); },
      };
    };

    // Upload field bound to a top-level section data key (e.g. logoMark, poster).
    // `required` is read from the schema so required images show a "Required" tag.
    const isRequiredImage = (key: string) =>
      (rule?.required ?? []).some((r) => r.key === key && r.kind === "image");
    const upload = (key: string, label: string, hint?: string): Field => ({
      kind: "upload", label, hint, value: d[key] || "", required: isRequiredImage(key),
      onChange: (url: string) => setSectionField(id, key, url),
    });
    // A marquee-style string-tag input bound to a top-level array key.
    const tagList = (key: string, label: string, placeholder: string): Field => ({
      kind: "tags", label, placeholder,
      items: (d[key] || []).map((w: string, i: number) => ({ text: w, onRemove: () => removeSectionItem(id, key, i) })),
      onAdd: (e: KeyEvt) => {
        if (e.key === "Enter" && e.currentTarget.value.trim()) {
          const v = e.currentTarget.value.trim();
          e.currentTarget.value = "";
          setSections((arr) => arr.map((s) => {
            if (s.id !== id) return s;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dd: any = clone(s.data);
            if (!Array.isArray(dd[key])) dd[key] = [];
            dd[key].push(v);
            return { ...s, data: dd } as DraftSection;
          }));
          markDirty();
        }
      },
    });

    // Eyebrow + a RICH heading lead every section (rich preserves italics/accents/breaks).
    // The eyebrow always carries a cap/counter: the section's own rule if it maps one,
    // else the global "eyebrow" limit — so the counter is visible on every section.
    const eyebrowCap = rule?.textFields?.eyebrow ? capFor("eyebrow") : limProps("eyebrow");
    const eyebrow: Field = { kind: "text", label: "Eyebrow", value: d.eyebrow || "", placeholder: "Small label above the heading", ...eyebrowCap, count: String(d.eyebrow || "").length, onChange: (e: InputEvt) => setSectionEyebrow(id, e.target.value) };
    const head: Field[] = [eyebrow, sectionHeadingField(id, "Heading", rule?.headingLimit)];

    switch (sec.type) {
      case "stats":
        // Stats reads a PLAIN `headline` (not rich) — keep it a text field.
        return [
          eyebrow,
          txt("headline", "Headline", "A network sized for the country."),
          area("descriptor", "Descriptor", "Sentence under the heading"),
          { kind: "group", label: "Metrics", sub: "Big numbers shown in the grid." },
          itemList("items", "Add metric", () => ({ value: "0", suffix: "", label: "New metric", footnote: "" }), [
            { key: "value", label: "Value", placeholder: "25" },
            { key: "suffix", label: "Suffix", placeholder: "+" },
            { key: "label", label: "Label", placeholder: "Retail stores" },
            { key: "footnote", label: "Footnote", placeholder: "South India" },
          ]),
        ];
      case "savings":
        return [
          ...head,
          area("lede", "Lede", "Intro paragraph under the heading"),
          { kind: "group", label: "Savings rows", sub: "Each compares a brand's price saving." },
          itemList("items", "Add row", () => ({ name: "New item", cat: "", pct: 50, color: "#1FAFA6" }), [
            { key: "name", label: "Name", placeholder: "Diabetes Tablets" },
            { key: "cat", label: "Category", placeholder: "Cat. 01 · Metformin 500mg" },
            { key: "pct", label: "Saving %", placeholder: "46", numeric: true },
            { key: "color", label: "Colour", placeholder: "#1FAFA6" },
          ]),
          { kind: "group", label: "Ledger", sub: "Optional receipt-style summary panel." },
          subTxt("ledger", "receiptLabel", "Receipt label", "Estimated savings"),
          subTxt("ledger", "averageLabel", "Average label", "Avg. saving"),
          subTxt("ledger", "averageValue", "Average value", "59%"),
          subTxt("ledger", "footnote", "Footnote", "Across 1,200 prescriptions"),
          { kind: "group", label: "Video", sub: "Optional video block (paste a hosted URL)." },
          upload("videoPoster", "Video poster", "Shown before play"),
          txt("videoUrl", "Video URL", "https://…"),
          subTxt("videoCopy", "tag", "Video tag", "Behind the scenes"),
          subTxt("videoCopy", "headline", "Video headline", "A look at our centres"),
          subTxt("videoCopy", "ctaLabel", "Video CTA label", "Watch Now"),
        ];
      case "team":
        return [
          eyebrow,
          richField("Quote", d.quote?.parts || [], (mutate) =>
            setSections((arr) => arr.map((s) => {
              if (s.id !== id) return s;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const dd: any = clone(s.data);
              if (!dd.quote || !Array.isArray(dd.quote.parts)) dd.quote = { parts: [] };
              mutate(dd.quote.parts);
              return { ...s, data: dd } as DraftSection;
            }))
          ),
          txt("signatureLabel", "Signature label", "Signed,"),
          txt("signature", "Signature", "the team"),
          upload("logoMark", "Logo mark", "Falls back to the brand logo"),
          { kind: "group", label: "Departments", sub: "Coloured department cards." },
          itemList("departments", "Add department", () => ({ code: "00", count: 0, label: "New team", role: "", bg: "#1FAFA6", fg: "#FFFFFF", detail: "" }), [
            { key: "code", label: "Code", placeholder: "01" },
            { key: "count", label: "Count", placeholder: "75", numeric: true },
            { key: "label", label: "Label", placeholder: "Pharmacists" },
            { key: "role", label: "Role", placeholder: "Licensed dispensing" },
            { key: "bg", label: "Background", placeholder: "#F5A623" },
            { key: "fg", label: "Text colour", placeholder: "#1B2A5B" },
            { key: "detail", label: "Detail", placeholder: "Every order reviewed…", area: true },
          ]),
          { kind: "group", label: "Credentials", sub: "Small label + value pairs." },
          itemList("credentials", "Add credential", () => ({ label: "New credential", value: "" }), [
            { key: "label", label: "Label", placeholder: "Care SLA" },
            { key: "value", label: "Value", placeholder: "Avg. reply < 1 hr · 3 languages" },
          ]),
        ];
      case "features":
        return [
          ...head,
          { kind: "group", label: "Feature cards", sub: "A grid of feature cards." },
          itemList("items", "Add feature", () => ({ title: "New feature", description: "" }), [
            { key: "title", label: "Title", placeholder: "Authenticity at the source" },
            { key: "description", label: "Description", placeholder: "Short description", area: true },
          ]),
        ];
      case "categories":
        return [
          ...head,
          area("tagline", "Tagline", "Sentence under the heading"),
          { kind: "group", label: "Category tiles", sub: "Tiles with an optional icon." },
          itemList("items", "Add category", () => ({ title: "New category", icon: "", description: "" }), [
            { key: "title", label: "Title", placeholder: "Medicines" },
            { key: "description", label: "Description", placeholder: "Short description", area: true },
            { key: "icon", label: "Icon", upload: true, placeholder: "/tenant/icons/…" },
          ]),
        ];
      case "howItWorks":
        return [
          ...head,
          txt("ctaLabel", "CTA label", "Get in touch"),
          txt("ctaHref", "CTA link", "/contact"),
          { kind: "group", label: "Steps", sub: "Numbered process steps." },
          itemList("steps", "Add step", () => ({ step: (d.steps?.length || 0) + 1, title: "New step", description: "" }), [
            { key: "step", label: "Step #", placeholder: "1", numeric: true },
            { key: "title", label: "Title", placeholder: "Browse or upload…" },
            { key: "description", label: "Description", placeholder: "Short description", area: true },
          ]),
        ];
      case "faq":
        return [
          ...head,
          area("lede", "Lede", "Intro line above the questions"),
          txt("ctaLabel", "CTA label", "Contact support"),
          txt("ctaHref", "CTA link", "/contact"),
          { kind: "group", label: "Questions", sub: "Expandable Q&A list." },
          itemList("items", "Add question", () => ({ question: "New question?", answer: "" }), [
            { key: "question", label: "Question", placeholder: "Where do you source medicines?" },
            { key: "answer", label: "Answer", placeholder: "Answer…", area: true },
            { key: "learnMoreLabel", label: "Learn-more label", placeholder: "See the full guide" },
            { key: "learnMoreHref", label: "Learn-more link", placeholder: "/guide" },
          ]),
        ];
      case "appStrip":
        return [
          sectionHeadingField(id, "Heading"),
          area("descriptor", "Descriptor", "Line under the heading"),
          upload("logo", "App logo", "Falls back to the brand logo"),
          txt("appStoreUrl", "App Store URL", "https://apps.apple.com/…"),
          txt("googlePlayUrl", "Google Play URL", "https://play.google.com/…"),
        ];
      case "videoFeature":
        return [
          txt("tag", "Tag", "Behind the scenes"),
          sectionHeadingField(id, "Heading"),
          txt("ctaLabel", "CTA label", "Watch Now"),
          txt("videoUrl", "Video URL", "https://…"),
          upload("poster", "Poster image", "Shown before play"),
          tagList("marquee", "Marquee words", "Add a word, press Enter"),
        ];
      case "aiStore":
        return [
          ...head,
          area("lede", "Lede", "Right-side descriptor"),
          { kind: "group", label: "Capability cards", sub: "Media cards with a tag, title and one-line description — the first leads." },
          itemList("tiles", "Add card", () => ({ image: "", alt: "", tag: "", title: "", description: "", videoUrl: "" }), [
            { key: "image", label: "Image", upload: true, placeholder: "/tenant/tile.png" },
            { key: "tag", label: "Tag", placeholder: "e.g. Forecasting" },
            { key: "title", label: "Title", placeholder: "Capability title" },
            { key: "description", label: "Description", placeholder: "One line shown on hover" },
            { key: "videoUrl", label: "Video URL", placeholder: "https://… (optional)" },
            { key: "alt", label: "Alt text", placeholder: "Describe the image" },
          ]),
        ];
      case "gallery":
        return [
          ...head,
          { kind: "text", label: "Intro line", value: (d.lede as string) || "", placeholder: "A short line shown beside the heading", onChange: (e: InputEvt) => setSectionField(id, "lede", e.target.value) },
          { kind: "group", label: "Frames", sub: "An editorial mosaic — the first frame leads, the rest stack." },
          itemList("images", "Add frame", () => ({ src: "", alt: "", caption: "", title: "", description: "" }), [
            { key: "src", label: "Image", upload: true, placeholder: "/tenant/gallery/img.png" },
            { key: "caption", label: "Kicker", placeholder: "e.g. Retail · Fulfilment" },
            { key: "title", label: "Title", placeholder: "Editorial title for this frame" },
            { key: "description", label: "Description", placeholder: "One line shown on hover" },
            { key: "alt", label: "Alt text", placeholder: "Describe the image" },
          ]),
        ];
      default:
        return [
          ...head,
          { kind: "note", label: "Section content", text: itemsNote(sec) + ". This block type has no item-level fields yet." },
        ];
    }
  }


  return { buildFields, buildCoreFields, buildSectionDetailFields };
}
