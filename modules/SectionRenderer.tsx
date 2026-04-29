import { Features } from "@/modules/Features";
import { HowItWorks } from "@/modules/HowItWorks";
import { Gallery } from "@/modules/Gallery";
import type { Section } from "@/types/config.types";

type SectionRendererProps = {
  sections: Section[];
};

export function SectionRenderer({ sections }: SectionRendererProps) {
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
          default:
            return null;
        }
      })}
    </>
  );
}
