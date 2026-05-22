import type { AboutContent } from "@/types/config.types";
import { renderRichHeading } from "@/modules/RichHeading";
import { MobileCarousel } from "@/components/common/MobileCarousel";

type AboutProps = {
  data?: AboutContent;
};

export function About({ data }: AboutProps) {
  if (!data) return null;

  const pillars = data.pillars ?? [];
  const hasHead = data.eyebrow || data.title || data.lede || data.description;
  if (!hasHead && pillars.length === 0) return null;

  const title = renderRichHeading(data.title);

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
              ariaLabel="What sets us apart"
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
