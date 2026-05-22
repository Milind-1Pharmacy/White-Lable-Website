"use client";
import { useIsMobile } from "@/lib/useIsMobile";
import type { FeatureItem, FeaturesSectionData } from "@/types/config.types";
import { renderRichHeading } from "@/modules/RichHeading";
import { MobileCarousel } from "@/components/common/MobileCarousel";

type FeaturesProps = {
  data: FeaturesSectionData;
};

const renderCell = (w: FeatureItem, i: number) => (
  <div key={i} className="why-cell">
    <div className="num">{String(i + 1).padStart(2, "0")}</div>
    <h4>{w.title}</h4>
    <p className="body-s">{w.description}</p>
  </div>
);

export function Features({ data }: FeaturesProps) {
  const isMobile = useIsMobile();
  if (!data?.items?.length) return null;
  const heading = renderRichHeading(data.heading);

  return (
    <section className="section section--cream">
      <div className="wrap">
        {(data.eyebrow || heading) && (
          <div style={{ marginBottom: 56 }}>
            {data.eyebrow && (
              <span className="eyebrow">
                <span className="dot" />
                {data.eyebrow}
              </span>
            )}
            {heading && (
              <h2
                className="h-display h-2"
                style={{
                  marginTop: 14,
                  minHeight: isMobile ? 64 : 32,
                  lineHeight: 1.1,
                }}
              >
                {heading}
              </h2>
            )}
          </div>
        )}
        <div className="why__grid m-desktop-only">
          {data.items.map(renderCell)}
        </div>
        <MobileCarousel
          className="why__carousel"
          ariaLabel="Why UrMedz"
          cardWidth="84%"
          maxCardWidth={340}
          gap={14}
          edgePadding={24}
        >
          {data.items.map(renderCell)}
        </MobileCarousel>
      </div>
    </section>
  );
}
