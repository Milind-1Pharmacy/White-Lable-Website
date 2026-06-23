/**
 * @file preview.tsx
 * @description Live WYSIWYG preview that renders the REAL site modules inside an
 *  isolated iframe, styled by the tenant stylesheet — a true ditto of the live site.
 * @responsibilities
 *  - Map the active step / selected section to the real modules/*.tsx component.
 *  - Render hero/about/services + SectionRenderer with the draft's data + branding.
 *  - Host them in PreviewFrame (iframe) and transform-scale to the requested size.
 * @dependencies react, @/modules/*, ./PreviewFrame, @/types/config.types
 * @author WhiteLabel Platform Team
 * @created 2026-06-22
 * @lastUpdated 2026-06-23
 */
"use client";

import React, { useState } from "react";
import type { AppConfig, Branding, Section } from "@/types/config.types";
import { Hero } from "@/modules/Hero";
import { About } from "@/modules/About";
import { Services } from "@/modules/Services";
import { SectionRenderer } from "@/modules/SectionRenderer";
import { PreviewFrame } from "./PreviewFrame";
import type { DraftSection, StepId } from "./builderData";

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
}: {
  config: AppConfig;
  sections: DraftSection[];
  full: boolean;
  step: StepId;
  selectedSectionId: string;
}) {
  const content = config.content;
  const branding: Branding = config.branding;

  // Whole assembled site (Preview sheet / full view): mirror app/(site)/page.tsx order.
  if (full) {
    return (
      <>
        <Hero data={content.hero} />
        {content.about && <About data={content.about} />}
        {content.services && content.services.length > 0 && (
          <Services data={content.services} meta={content.servicesMeta} />
        )}
        <SectionRenderer sections={sections.map(toSection)} branding={branding} />
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

  // Wizard steps that map to a fixed block.
  if (step === "contact" || step === "legal" || step === "identity" || step === "branding" || step === "seo") {
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
  /** Which device frame to render. */
  device?: "desktop" | "mobile";
  /** Transform scale applied to the iframe so it fits the pane. */
  scale?: number;
  /** Marker class so the builder's fit logic can find this frame's <iframe>. */
  frameClass?: string;
  /** Reports the iframe's natural (unscaled) content height in CSS px. */
  onMeasure?: (height: number) => void;
};

/**
 * BuilderPreview - Renders the real modules for the draft inside a scaled iframe.
 */
export function BuilderPreview({
  config,
  sections,
  full,
  step,
  selectedSectionId,
  device = "desktop",
  scale = 1,
  frameClass,
  onMeasure,
}: PreviewProps) {
  const width = device === "mobile" ? PREVIEW_MOBILE_WIDTH : PREVIEW_BASE_WIDTH;
  const [height, setHeight] = useState(0);

  const report = (h: number) => {
    setHeight(h);
    onMeasure?.(h);
  };

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
          stylesheet={config.branding.stylesheet}
          colors={config.branding.colors}
          onMeasure={report}
          bodyClassName={frameClass}
        >
          <PreviewContent
            config={config}
            sections={sections}
            full={full}
            step={step}
            selectedSectionId={selectedSectionId}
          />
        </PreviewFrame>
      </div>
    </div>
  );
}
