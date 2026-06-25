/**
 * @file SectionRenderer.tsx
 * @description Dispatches config sections to their matching module by type.
 * @responsibilities
 *  - Map each section.type to its module component.
 *  - Lazy-load below-the-fold client modules.
 *  - Render nothing for unknown or missing section types.
 * @dependencies next/dynamic, section modules, config types
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import dynamic from "next/dynamic";

import { Features } from "@wl/render-engine/modules/Features";
import { HowItWorks } from "@wl/render-engine/modules/HowItWorks";
import { Gallery } from "@wl/render-engine/modules/Gallery";
import type { Branding, Section } from "@wl/config-types";

// Lazy-load below-the-fold client modules
const Stats = dynamic(() =>
  import("@wl/render-engine/modules/Stats").then((m) => ({ default: m.Stats })),
);
const Savings = dynamic(() =>
  import("@wl/render-engine/modules/Savings").then((m) => ({ default: m.Savings })),
);
const VideoFeature = dynamic(() =>
  import("@wl/render-engine/modules/VideoFeature").then((m) => ({ default: m.VideoFeature })),
);
const AppStrip = dynamic(() =>
  import("@wl/render-engine/modules/AppStrip").then((m) => ({ default: m.AppStrip })),
);
const Faq = dynamic(() =>
  import("@wl/render-engine/modules/Faq").then((m) => ({ default: m.Faq })),
);
const AIStore = dynamic(() =>
  import("@wl/render-engine/modules/AIStore").then((m) => ({ default: m.AIStore })),
);
const Team = dynamic(() =>
  import("@wl/render-engine/modules/Team").then((m) => ({ default: m.Team })),
);
const Categories = dynamic(() =>
  import("@wl/render-engine/modules/Categories").then((m) => ({ default: m.Categories })),
);

type SectionRendererProps = {
  sections: Section[];
  branding?: Branding;
};

/**
 * SectionRenderer - Renders config sections in order, one module per type.
 *
 * Type -> module mapping:
 *   features     -> Features
 *   howItWorks   -> HowItWorks
 *   gallery      -> Gallery
 *   stats        -> Stats
 *   savings      -> Savings
 *   videoFeature -> VideoFeature
 *   appStrip     -> AppStrip
 *   faq          -> Faq
 *   aiStore      -> AIStore
 *   team         -> Team
 *   (unknown)    -> null
 *
 * @props {Section[]} sections - Config section list to render
 * @props {Branding} [branding] - Brand data passed to brand-aware modules
 * @returns JSX element
 */
export function SectionRenderer({ sections, branding }: SectionRendererProps) {
  if (!sections?.length) return null;
  return (
    <>
      {sections.map((section, idx) => {
        switch (section.type) {
          case "features":
            return <Features key={`features-${idx}`} data={section.data} />;
          case "categories":
            return (
              <Categories key={`categories-${idx}`} data={section.data} />
            );
          case "howItWorks":
            return <HowItWorks key={`how-${idx}`} data={section.data} />;
          case "gallery":
            return <Gallery key={`gallery-${idx}`} data={section.data} />;
          case "stats":
            return <Stats key={`stats-${idx}`} data={section.data} />;
          case "savings":
            return <Savings key={`savings-${idx}`} data={section.data} />;
          case "videoFeature":
            return <VideoFeature key={`vf-${idx}`} data={section.data} />;
          case "appStrip":
            return (
              <AppStrip
                key={`app-strip-${idx}`}
                data={section.data}
                branding={branding}
              />
            );
          case "faq":
            return <Faq key={`faq-${idx}`} data={section.data} />;
          case "aiStore":
            return <AIStore key={`ai-store-${idx}`} data={section.data} />;
          case "team":
            return (
              <Team
                key={`team-${idx}`}
                data={section.data}
                branding={branding}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}
