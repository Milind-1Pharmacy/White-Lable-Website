"use client";
/**
 * @file HowItWorks.tsx
 * @description Shows ordered, numbered process steps with an optional CTA.
 * @responsibilities
 *  - Render an eyebrow, rich heading, and optional CTA link.
 *  - List each step with its number, title, and description.
 *  - Render nothing when no steps are provided.
 * @dependencies next/link, useIsMobile, RichHeading, config types
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import Link from "next/link";
import type { HowItWorksSectionData } from "@wl/config-types";
import { useIsMobile } from "@wl/render-engine/lib/useIsMobile";
import { renderRichHeading } from "@wl/render-engine/modules/RichHeading";
import { safeHref } from "@wl/render-engine/lib/safeUrl";

type HowItWorksProps = {
  data: HowItWorksSectionData;
};

/**
 * HowItWorks - Renders a numbered list of process steps with optional heading and CTA.
 * @props {HowItWorksSectionData} data - Eyebrow, heading, CTA, and steps
 * @returns JSX element
 */
export function HowItWorks({ data }: HowItWorksProps) {
  const isMobile = useIsMobile();
  if (!data?.steps?.length) return null;
  const heading = renderRichHeading(data.heading);

  return (
    <section className="section" id="how-it-works">
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
                    minHeight: isMobile ? 64 : 48,
                    lineHeight: 1.1,
                  }}
                >
                  {heading}
                </h2>
              )}
            </div>
            {data.ctaLabel && (
              <Link
                href={safeHref(data.ctaHref, "/contact")}
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
