"use client";
import { useIsMobile } from "@/lib/useIsMobile";
import type { FeaturesSectionData } from "@/types/config.types";

type FeaturesProps = {
  data: FeaturesSectionData;
};

export function Features({ data }: FeaturesProps) {
  const isMobile = useIsMobile();
  return (
    <section className="section section--cream">
      <div className="wrap">
        <div style={{ marginBottom: 56 }}>
          <span className="eyebrow">
            <span className="dot" />
            Why UrMedz
          </span>
          <h2
            className="h-display h-2"
            style={{
              marginTop: 14,
              maxWidth: 720,
              minHeight: isMobile ? 64 : 108,
              lineHeight: 1.1,
            }}
          >
            Pharmacy infrastructure,{" "}
            <span className="serif-it" style={{ color: "var(--accent)" }}>
              quietly
            </span>{" "}
            done right.
          </h2>
        </div>
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
