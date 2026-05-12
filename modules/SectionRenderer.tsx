import { Features } from "@/modules/Features";
import { HowItWorks } from "@/modules/HowItWorks";
import { Gallery } from "@/modules/Gallery";
import { Stats } from "@/modules/Stats";
import { Testimonials } from "@/modules/Testimonials";
import { Faq } from "@/modules/Faq";
import { HeroRotating } from "@/modules/HeroRotating";
import { AppDownload } from "@/modules/AppDownload";
import { AboutWithStats } from "@/modules/AboutWithStats";
import { ServicesIconRow } from "@/modules/ServicesIconRow";
import { BrandOptionsCompare } from "@/modules/BrandOptionsCompare";
import { VideoFeature } from "@/modules/VideoFeature";
import { MediaSplit } from "@/modules/MediaSplit";
import { ProductPromo } from "@/modules/ProductPromo";
import { TeamGrid } from "@/modules/TeamGrid";
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
          case "stats":
            return <Stats key={`stats-${idx}`} data={section.data} />;
          case "testimonials":
            return (
              <Testimonials key={`testimonials-${idx}`} data={section.data} />
            );
          case "faq":
            return <Faq key={`faq-${idx}`} data={section.data} />;
          case "heroRotating":
            return (
              <HeroRotating key={`hero-rot-${idx}`} data={section.data} />
            );
          case "appDownload":
            return <AppDownload key={`app-dl-${idx}`} data={section.data} />;
          case "aboutWithStats":
            return (
              <AboutWithStats key={`about-stats-${idx}`} data={section.data} />
            );
          case "servicesIconRow":
            return (
              <ServicesIconRow key={`svc-row-${idx}`} data={section.data} />
            );
          case "brandOptionsCompare":
            return (
              <BrandOptionsCompare key={`bo-${idx}`} data={section.data} />
            );
          case "videoFeature":
            return <VideoFeature key={`vf-${idx}`} data={section.data} />;
          case "mediaSplit":
            return <MediaSplit key={`ms-${idx}`} data={section.data} />;
          case "productPromo":
            return <ProductPromo key={`pp-${idx}`} data={section.data} />;
          case "teamGrid":
            return <TeamGrid key={`tg-${idx}`} data={section.data} />;
          default:
            return null;
        }
      })}
    </>
  );
}
