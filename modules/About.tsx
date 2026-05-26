/**
 * @file About.tsx
 * @description Renders the About section with heading and pillar cards.
 * @responsibilities
 *  - Show optional eyebrow, title, and lede text.
 *  - Render pillar cards in a grid on desktop.
 *  - Show pillars as a swipeable carousel on mobile.
 *  - Render nothing when no content is given.
 * @dependencies RichHeading, MobileCarousel, config.types
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import type { AboutContent } from "@/types/config.types";
import { renderRichHeading } from "@/modules/RichHeading";
import { MobileCarousel } from "@/components/common/MobileCarousel";

type AboutProps = {
  data?: AboutContent;
};

/**
 * About - Shows business intro heading and pillar cards.
 * @props {AboutContent} data - Section content from config.
 * @returns JSX element
 */
export function About({ data }: AboutProps) {
  if (!data) return null;

  const pillars = data.pillars ?? [];
  const hasHead = data.eyebrow || data.title || data.lede || data.description;
  if (!hasHead && pillars.length === 0) return null;

  const title = renderRichHeading(data.title);

  /**
   * Renders one pillar card with badge, meta, title, and body.
   */
  const renderPillar = (
    p: NonNullable<AboutContent["pillars"]>[number],
    idx: number,
  ) => (
    <div
      key={idx}
      className="about2__pillar"
      style={{ ["--pillar-accent" as string]: p.accent }}
    >
      <div className="about2__pillar-top">
        <span className="about2__pillar-badge">{p.n}</span>
        <span
          className="mono"
          style={{
            fontSize: 11,
            letterSpacing: ".14em",
            color: "var(--mute)",
          }}
        >
          {p.meta}
        </span>
      </div>
      <h3 className="about2__pillar-title">{p.title}</h3>
      <p className="body-s" style={{ margin: 0 }}>
        {p.body}
      </p>
    </div>
  );

  return (
    <section className="section" id="about">
      <div className="wrap">
        {hasHead && (
          <div className="about2__head">
            {data.eyebrow && (
              <span className="eyebrow">
                <span className="dot" />
                {data.eyebrow}
              </span>
            )}
            {title && <h2 className="about2__title">{title}</h2>}
            {(data.lede || data.description) && (
              <p className="about2__lede">{data.lede ?? data.description}</p>
            )}
          </div>
        )}

        {pillars.length > 0 && (
          <>
            <div className="about2__pillars m-desktop-only">
              {pillars.map(renderPillar)}
            </div>
            <MobileCarousel
              ariaLabel="UrMedz pillars"
              cardWidth="84%"
              maxCardWidth={340}
              gap={14}
              edgePadding={24}
            >
              {pillars.map(renderPillar)}
            </MobileCarousel>
          </>
        )}
      </div>
    </section>
  );
}
