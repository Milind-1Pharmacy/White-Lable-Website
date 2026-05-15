import dynamic from "next/dynamic";

import { Features } from "@/modules/Features";
import { HowItWorks } from "@/modules/HowItWorks";
import { Gallery } from "@/modules/Gallery";
import type { Branding, Section } from "@/types/config.types";

// Lazy-load below-the-fold client modules
const Stats = dynamic(() =>
  import("@/modules/Stats").then((m) => ({ default: m.Stats })),
);
const Savings = dynamic(() =>
  import("@/modules/Savings").then((m) => ({ default: m.Savings })),
);
const VideoFeature = dynamic(() =>
  import("@/modules/VideoFeature").then((m) => ({ default: m.VideoFeature })),
);
const AppStrip = dynamic(() =>
  import("@/modules/AppStrip").then((m) => ({ default: m.AppStrip })),
);
const Faq = dynamic(() =>
  import("@/modules/Faq").then((m) => ({ default: m.Faq })),
);
const AIStore = dynamic(() =>
  import("@/modules/AIStore").then((m) => ({ default: m.AIStore })),
);
const Team = dynamic(() =>
  import("@/modules/Team").then((m) => ({ default: m.Team })),
);

type SectionRendererProps = {
  sections: Section[];
  branding?: Branding;
};

export function SectionRenderer({ sections, branding }: SectionRendererProps) {
  if (!sections?.length) return null;
  return (
    <>
      {sections.map((section, idx) => {
        switch (section.type) {
          case "features":
            return <Features key={`features-${idx}`} data={section.data} />;
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
