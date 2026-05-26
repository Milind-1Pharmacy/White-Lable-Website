"use client";
/**
 * @file Features.tsx
 * @description Renders a numbered grid of feature cards.
 * @responsibilities
 *  - Show optional eyebrow and heading.
 *  - Render feature cards in a grid on desktop.
 *  - Show features as a swipeable carousel on mobile.
 *  - Render nothing when no features are given.
 * @dependencies useIsMobile, RichHeading, MobileCarousel, config.types
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import { useIsMobile } from "@/lib/useIsMobile";
import type {
  FeatureItem,
  FeaturesSectionData,
} from "@/types/config.types";
import { renderRichHeading } from "@/modules/RichHeading";
import { MobileCarousel } from "@/components/common/MobileCarousel";

type FeaturesProps = {
  data: FeaturesSectionData;
};

/**
 * Renders one numbered feature card with title and description.
 */
const renderCell = (w: FeatureItem, i: number) => (
  <div key={i} className="why-cell">
    <div className="num">{String(i + 1).padStart(2, "0")}</div>
    <h4>{w.title}</h4>
    <p className="body-s">{w.description}</p>
  </div>
);

/**
 * Features - Shows key selling points as numbered cards.
 * @props {FeaturesSectionData} data - Features content from config.
 * @returns JSX element
 */
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
                  maxWidth: 720,
                  minHeight: isMobile ? 64 : 108,
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
