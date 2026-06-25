/**
 * @file preview.tsx
 * @description Live WYSIWYG preview that renders the REAL site modules inside an
 *  isolated iframe, styled by the tenant stylesheet — a true ditto of the live site.
 * @responsibilities
 *  - Map the active step / selected section to the real modules/*.tsx component.
 *  - Render hero/about/services + SectionRenderer with the draft's data + branding.
 *  - Host them in PreviewFrame (iframe) and transform-scale to the requested size.
 * @dependencies react, @wl/render-engine/modules/*, ./PreviewFrame, @wl/config-types
 * @author WhiteLabel Platform Team
 * @created 2026-06-22
 * @lastUpdated 2026-06-23
 */
"use client";

import React, { useCallback, useMemo, useState } from "react";
import type { AppConfig, Branding, Section } from "@wl/config-types";
import { Hero } from "@wl/render-engine/modules/Hero";
import { About } from "@wl/render-engine/modules/About";
import { Services } from "@wl/render-engine/modules/Services";
import { SectionRenderer } from "@wl/render-engine/modules/SectionRenderer";
import { Navbar } from "@wl/render-engine/components/layout/Navbar";
import { Footer } from "@wl/render-engine/components/layout/Footer";
import { StickyCta } from "@wl/render-engine/components/layout/StickyCta";
import { resolveRenderOrder } from "@wl/render-engine/lib/renderOrder";
import { PreviewFrame } from "./PreviewFrame";
import type { DraftSection, StepId, LegalSectionId } from "./builderData";
import { DEFAULT_THEME } from "./themePresets";
import { LegalArticlePreview, ContactPreview } from "./LegalPreview";

/** Resolve the colour-theme name: branding.theme, else a legacy stylesheet path, else default. */
function resolveTheme(branding: Branding): string {
  return (
    branding.theme ||
    (branding.stylesheet || "").replace(/^.*\//, "").replace(/\.css$/, "") ||
    DEFAULT_THEME
  );
}

/** The desktop canvas width every preview is laid out at, then scaled to the pane. */
export const PREVIEW_BASE_WIDTH = 1040;
/** The mobile canvas width (375px). Height hugs the section content. */
export const PREVIEW_MOBILE_WIDTH = 375;

/** Strip the client-only id off a draft section to get a real Section. */
function toSection(s: DraftSection): Section {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...rest } = s as DraftSection & { id: string };
  return rest as Section;
}

/** Render the real module(s) for the active scope (step / selected section / whole site). */
function PreviewContent({
  config,
  sections,
  full,
  step,
  selectedSectionId,
  legalSection,
  fullLegalSection,
}: {
  config: AppConfig;
  sections: DraftSection[];
  full: boolean;
  step: StepId;
  selectedSectionId: string;
  legalSection: LegalSectionId;
  /** In `full` mode, render this legal page instead of the homepage (null = home). */
  fullLegalSection?: LegalSectionId | null;
}) {
  const content = config.content;
  const branding: Branding = config.branding;

  // Whole assembled site (Preview sheet / full view): render the SAME chrome +
  // body the live page uses — Navbar on top, the ordered blocks, then Footer and
  // the sticky CTA — so the preview is a true full-page ditto of the live site.
  if (full) {
    // If a legal link was clicked in the sheet, show that authored page full-page
    // (with a back-to-home bar) instead of the homepage.
    if (fullLegalSection) {
      const pages = config.layout?.pages;
      let page: React.ReactNode;
      if (fullLegalSection === "terms") page = <LegalArticlePreview data={pages?.termsAndConditions} />;
      else if (fullLegalSection === "privacy") page = <LegalArticlePreview data={pages?.privacyPolicy} />;
      else if (fullLegalSection === "disclaimer") page = <LegalArticlePreview data={pages?.disclaimer} />;
      else if (fullLegalSection === "dataDeletion") page = <LegalArticlePreview data={pages?.deactivateAccount} />;
      else page = <ContactPreview contact={config.contact} tenantName={config.tenant.name} />;
      return (
        <>
          <Navbar app={config} />
          {page}
          <Footer app={config} />
        </>
      );
    }
    const resolved = resolveRenderOrder({ ...content, sections: sections.map(toSection) });
    return (
      <>
        <Navbar app={config} />
        {resolved.map((b) => {
          if (b.kind === "hero") return <Hero key="hero" data={content.hero} />;
          if (b.kind === "about")
            return content.about ? <About key="about" data={content.about} /> : null;
          if (b.kind === "services")
            return content.services && content.services.length > 0 ? (
              <Services key="services" data={content.services} meta={content.servicesMeta} />
            ) : null;
          return <SectionRenderer key={`section-${b.index}`} sections={[b.section]} branding={branding} />;
        })}
        <Footer app={config} />
        <StickyCta config={config.layout?.stickyCta} />
      </>
    );
  }

  // Sections step: scope to the selected core block or dynamic section.
  if (step === "sections") {
    if (selectedSectionId === "hero") return <Hero data={content.hero} />;
    if (selectedSectionId === "about")
      return content.about ? <About data={content.about} /> : null;
    if (selectedSectionId === "services")
      return content.services?.length ? (
        <Services data={content.services} meta={content.servicesMeta} />
      ) : null;
    const sel = sections.find((s) => s.id === selectedSectionId) || sections[0];
    return sel ? <SectionRenderer sections={[toSection(sel)]} branding={branding} /> : null;
  }

  // Navigation step: show the chrome being edited (navbar + footer + sticky CTA)
  // around the hero so changes to nav links / footer / sticky reflect live.
  if (step === "navigation") {
    return (
      <>
        <Navbar app={config} />
        <Hero data={content.hero} />
        <Footer app={config} />
        <StickyCta config={config.layout?.stickyCta} />
      </>
    );
  }

  // Legal step: render the actual page being authored (Contact / Terms / Privacy /
  // Disclaimer / Data-deletion), wrapped in live chrome so it reads as a real page.
  if (step === "legal") {
    const pages = config.layout?.pages;
    let page: React.ReactNode;
    if (legalSection === "terms") page = <LegalArticlePreview data={pages?.termsAndConditions} />;
    else if (legalSection === "privacy") page = <LegalArticlePreview data={pages?.privacyPolicy} />;
    else if (legalSection === "disclaimer") page = <LegalArticlePreview data={pages?.disclaimer} />;
    else if (legalSection === "dataDeletion") page = <LegalArticlePreview data={pages?.deactivateAccount} />;
    else page = <ContactPreview contact={config.contact} tenantName={config.tenant.name} />;
    return (
      <>
        <Navbar app={config} />
        {page}
        <Footer app={config} />
      </>
    );
  }

  // Wizard steps that map to a fixed block.
  if (step === "identity" || step === "branding" || step === "seo") {
    // These steps don't have a dedicated live section; show the hero as context
    // so the frame still reflects the brand/colours the user is editing.
    return <Hero data={content.hero} />;
  }

  return <Hero data={content.hero} />;
}

/** Inputs for the preview surface. */
export type PreviewProps = {
  config: AppConfig;
  sections: DraftSection[];
  full: boolean;
  step: StepId;
  selectedSectionId: string;
  slug: string;
  /** On the Legal step, which legal page the preview renders. Default "contact". */
  legalSection?: LegalSectionId;
  /** In published/full mode, show this legal page instead of the homepage. */
  fullLegalSection?: LegalSectionId | null;
  /** Which device frame to render. */
  device?: "desktop" | "mobile";
  /** Transform scale applied to the iframe so it fits the pane. */
  scale?: number;
  /** Marker class so the builder's fit logic can find this frame's <iframe>. */
  frameClass?: string;
  /** Reports the iframe's natural (unscaled) content height in CSS px. */
  onMeasure?: (height: number) => void;
  /**
   * "Live site" mode for the published "Visit site" view. Renders the page exactly
   * as it deploys: the draft's REAL tenant stylesheet (config.branding.stylesheet,
   * e.g. /urmedz.css — not the builder-only preview.css), at full responsive width
   * with natural scrolling, NOT a fixed-canvas scaled thumbnail. A true ditto of
   * the deployed site.
   */
  published?: boolean;
};

/**
 * BuilderPreview - Renders the real modules for the draft inside a scaled iframe.
 * Memoized: the parent WebsiteBuilder re-renders on every keystroke, but this
 * only re-renders when an input that affects the frame actually changes.
 */
function BuilderPreviewImpl({
  config,
  sections,
  full,
  step,
  selectedSectionId,
  legalSection = "contact",
  fullLegalSection = null,
  device = "desktop",
  scale = 1,
  frameClass,
  onMeasure,
  published = false,
}: PreviewProps) {
  const width = device === "mobile" ? PREVIEW_MOBILE_WIDTH : PREVIEW_BASE_WIDTH;
  const [height, setHeight] = useState(0);

  // Stable callback so PreviewFrame's measure effect (mounted once) never sees a
  // changing onMeasure identity — keeps the iframe from re-fitting per keystroke.
  const report = useCallback(
    (h: number) => {
      setHeight(h);
      onMeasure?.(h);
    },
    [onMeasure]
  );

  // Only rebuild the previewed module tree when an input that actually affects
  // THIS frame changes. A keystroke in an unrelated field still produces a new
  // `config` object (immutable update), but the rendered modules are identical,
  // so memoizing here avoids reconciling the whole iframe subtree every time.
  const content = useMemo(
    () => (
      <PreviewContent
        config={config}
        sections={sections}
        full={full}
        step={step}
        selectedSectionId={selectedSectionId}
        legalSection={legalSection}
        fullLegalSection={fullLegalSection}
      />
    ),
    [config, sections, full, step, selectedSectionId, legalSection, fullLegalSection]
  );

  // The shared site stylesheets the deployed site loads: the blocks bundle + the
  // chosen colour-theme tokens. Same files in preview AND deploy → preview = live.
  // (User brand colours are layered on top via PreviewFrame's colour-override <style>.)
  const theme = resolveTheme(config.branding);
  const deploySheets = [
    "/site-css/blocks.css",
    `/site-css/themes/${theme}.tokens.css`,
  ];

  // "Visit site" / live-preview (published) mode: render exactly as the site
  // deploys, with the SAME shared stylesheets + natural scrolling.
  if (published) {
    // Mobile: the site (375px) sits INSIDE a phone-frame mockup, centred + scrollable.
    if (device === "mobile") {
      return (
        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "flex-start", overflow: "auto", padding: "28px 0", background: "#F4F4F6" }}>
          <div className="wb-phone">
            <span className="wb-phone__island" />
            <div className="wb-phone__screen">
              <PreviewFrame
                width={PREVIEW_MOBILE_WIDTH}
                fill
                stylesheets={deploySheets}
                colors={config.branding.colors}
                bodyClassName={frameClass}
              >
                {content}
              </PreviewFrame>
            </div>
          </div>
        </div>
      );
    }
    // Desktop: fill the parent at the REAL viewport width — a true ditto of deploy.
    return (
      <div style={{ width: "100%", height: "100%" }}>
        <PreviewFrame
          width={width}
          fill
          stylesheets={deploySheets}
          colors={config.branding.colors}
          bodyClassName={frameClass}
        >
          {content}
        </PreviewFrame>
      </div>
    );
  }

  // The outer box occupies the SCALED footprint so the scroll/flex parent lays it
  // out correctly; the iframe is scaled from its top-left inside it.
  return (
    <div
      style={{
        width: width * scale,
        height: height * scale,
        overflow: "hidden",
      }}
    >
      <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <PreviewFrame
          width={width}
          /* The SAME shared deploy stylesheets, PLUS the preview-only overrides
             (Team-quote wrapping fix for the narrow iframe). The overrides never
             ship to the live site. */
          stylesheets={[...deploySheets, "/site-css/preview-overrides.css"]}
          colors={config.branding.colors}
          onMeasure={report}
          bodyClassName={frameClass}
        >
          {content}
        </PreviewFrame>
      </div>
    </div>
  );
}

/**
 * Memoized BuilderPreview. Shallow-compares props, so an edit to a field that
 * doesn't change `config`/`sections`/`scale` (e.g. focus, an unrelated step's
 * transient UI) won't re-render either preview frame.
 */
export const BuilderPreview = React.memo(BuilderPreviewImpl);
