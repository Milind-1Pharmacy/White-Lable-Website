/**
 * @file Services.tsx
 * @description Renders service cards as a desktop grid and mobile carousel.
 * @responsibilities
 *  - Show an optional eyebrow, rich heading, and CTA link.
 *  - Render each service as a numbered card.
 *  - Render nothing when no services are provided.
 * @dependencies RichHeading, MobileCarousel, config types
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import type { ServiceItem, ServicesMeta } from "@/types/config.types";
import { renderRichHeading } from "@/modules/RichHeading";
import { MobileCarousel } from "@/components/common/MobileCarousel";

type ServicesProps = {
  data: ServiceItem[];
  meta?: ServicesMeta;
};

/**
 * Services - Shows service cards in a desktop grid and a mobile carousel.
 * @props {ServiceItem[]} data - List of services to render
 * @props {ServicesMeta} [meta] - Eyebrow, heading, and CTA for the section
 * @returns JSX element
 */
export function Services({ data, meta }: ServicesProps) {
  if (!data?.length) return null;

  const heading = renderRichHeading(meta?.heading);
  const total = String(data.length).padStart(2, "0");

  const renderCard = (s: ServiceItem, i: number) => (
    <div key={i} className="service">
      <div>
        <div className="service__num">
          {String(i + 1).padStart(2, "0")} / {total}
        </div>
      </div>
      <div>
        <h3 className="service__title">{s.title}</h3>
        <p className="service__desc">{s.description}</p>
      </div>
      <div className="service__arrow">↗</div>
    </div>
  );

  return (
    <section className="section section--cream" id="services">
      <div className="wrap">
        <div
          className="between"
          style={{ marginBottom: 64, alignItems: "end" }}
        >
          <div style={{ maxWidth: 720 }}>
            {meta?.eyebrow && (
              <span className="eyebrow">
                <span className="dot" />
                {meta.eyebrow}
              </span>
            )}
            {heading && (
              <h2 className="h-display h-2" style={{ marginTop: 14 }}>
                {heading}
              </h2>
            )}
          </div>
          {meta?.ctaLabel && (
            <a
              className="btn btn-ghost mobile-btn"
              href={meta.ctaHref ?? "/services"}
              style={{ background: "transparent", marginTop: 16 }}
            >
              {meta.ctaLabel}
            </a>
          )}
        </div>
        <div className="services__grid m-desktop-only">
          {data.map(renderCard)}
        </div>
        <MobileCarousel
          ariaLabel="UrMedz services"
          cardWidth="84%"
          maxCardWidth={340}
          gap={14}
          edgePadding={24}
        >
          {data.map(renderCard)}
        </MobileCarousel>
      </div>
    </section>
  );
}
