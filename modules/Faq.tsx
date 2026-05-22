"use client";

import { useState } from "react";
import Link from "next/link";
import type { FaqSectionData } from "@/types/config.types";
import { useIsMobile } from "@/lib/useIsMobile";
import { renderRichHeading } from "@/modules/RichHeading";

type FaqProps = {
  data: FaqSectionData;
};

export function Faq({ data }: FaqProps) {
  const [open, setOpen] = useState<number>(0);
  const isMobile = useIsMobile();
  if (!data?.items?.length) return null;

  const heading = renderRichHeading(data.heading);

  return (
    <section className="section" id="faq">
      <div className="wrap">
        <div className="faq__layout" style={{ alignItems: "start", gap: 64 }}>
          <div>
            {data.eyebrow && (
              <span className="eyebrow">
                <span className="dot" />
                {data.eyebrow}
              </span>
            )}
            {heading && (
              <h2
                className="h-display h-1"
                style={{
                  marginTop: 18,
                  lineHeight: 1,
                  minHeight: isMobile ? 48 : 172,
                }}
              >
                {heading}
              </h2>
            )}
            {data.lede && (
              <p className="body" style={{ marginTop: 20, maxWidth: 360 }}>
                {data.lede}
              </p>
            )}
            {data.ctaLabel && (
              <Link
                className="btn btn-ghost"
                href={data.ctaHref ?? "/contact"}
                style={{ marginTop: 20, display: "inline-block" }}
              >
                {data.ctaLabel}
              </Link>
            )}
          </div>
          <div className="faq__list">
            {data.items.map((f, i) => (
              <div
                key={i}
                className={"faq__item" + (open === i ? " is-open" : "")}
              >
                <button
                  className="faq__btn"
                  onClick={() => setOpen(open === i ? -1 : i)}
                >
                  <span className="faq__num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="faq__q">{f.question}</span>
                  <span className="faq__plus">+</span>
                </button>
                <div className="faq__a">
                  <div>
                    <div className="faq__a-inner body">
                      {f.answer}
                      {f.learnMoreLabel && f.learnMoreHref && (
                        <>
                          {" "}
                          <Link className="faq__a-link" href={f.learnMoreHref}>
                            {f.learnMoreLabel} →
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
