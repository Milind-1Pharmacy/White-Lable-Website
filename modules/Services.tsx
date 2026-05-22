"use client";
import type { ServiceItem, ServicesMeta } from "@/types/config.types";
import { renderRichHeading } from "@/modules/RichHeading";
import { MobileCarousel } from "@/components/common/MobileCarousel";
import { useIsMobile } from "@/lib/useIsMobile";

type ServicesProps = {
  data: ServiceItem[];
  meta?: ServicesMeta;
};

export function Services({ data, meta }: ServicesProps) {
  if (!data?.length) return null;

  const isMobile = useIsMobile();

  const heading = renderRichHeading(meta?.heading);
  const total = String(data.length).padStart(2, "0");

  const renderCard = (s: ServiceItem, i: number) => (
    <div key={i} className="service">
      <div>
        <div className="service__num">
          {String(i + 1).padStart(2, "0")} / {total}
        </div>
      </div>
      {s.icon && (
        <div className="service__icon">
          <span className="service__icon-plate">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.icon} alt="" aria-hidden="true" />
          </span>
        </div>
      )}
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
          <div style={{ flex: 1, minWidth: 0 }}>
            {meta?.eyebrow && (
              <span className="eyebrow">
                <span className="dot" />
                {meta.eyebrow}
              </span>
            )}
            {heading && (
              <h2
                className="h-display h-2"
                style={{ marginTop: 14, minHeight: isMobile ? 32 : 32 }}
              >
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
          ariaLabel="Aarav Pharmacy services"
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
