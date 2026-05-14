"use client";
import { useIsMobile } from "@/lib/useIsMobile";
import type { FeaturesSectionData } from "@/types/config.types";
import { renderRichHeading } from "@/modules/RichHeading";

type FeaturesProps = {
  data: FeaturesSectionData;
};

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
        <div className="why__grid">
          {data.items.map((w, i) => (
            <div key={i} className="why-cell">
              <div className="num">{String(i + 1).padStart(2, "0")}</div>
              <h4>{w.title}</h4>
              <p className="body-s">{w.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
