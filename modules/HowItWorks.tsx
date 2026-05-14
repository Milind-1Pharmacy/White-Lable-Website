"use client";
import Link from "next/link";
import type { HowItWorksSectionData } from "@/types/config.types";
import { useIsMobile } from "@/lib/useIsMobile";
import { renderRichHeading } from "@/modules/RichHeading";

type HowItWorksProps = {
  data: HowItWorksSectionData;
};

export function HowItWorks({ data }: HowItWorksProps) {
  const isMobile = useIsMobile();
  if (!data?.steps?.length) return null;
  const heading = renderRichHeading(data.heading);

  return (
    <section className="section">
      <div className="wrap">
        {(data.eyebrow || heading || data.ctaLabel) && (
          <div
            className="between section-head"
            style={{ marginBottom: 32, alignItems: "end", flexWrap: "wrap" }}
          >
            <div>
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
            {data.ctaLabel && (
              <Link
                href={data.ctaHref ?? "/contact"}
                className="btn btn-primary section-head__sub"
              >
                {data.ctaLabel}
              </Link>
            )}
          </div>
        )}
        <div className="steps">
          {data.steps.map((s) => (
            <div key={s.step} className="step">
              <div className="step__n">
                Step {String(s.step).padStart(2, "0")} /{" "}
                {String(data.steps.length).padStart(2, "0")}
              </div>
              <h4>{s.title}</h4>
              <p className="body-s">{s.description}</p>
              <div className="step__big">{String(s.step).padStart(2, "0")}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
