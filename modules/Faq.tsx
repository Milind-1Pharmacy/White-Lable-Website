"use client";

import { useState } from "react";
import Link from "next/link";
import type { FaqSectionData } from "@/types/config.types";
import { useIsMobile } from "@/lib/useIsMobile";

type FaqProps = {
  data: FaqSectionData;
};

export function Faq({ data }: FaqProps) {
  const [open, setOpen] = useState<number>(0);
  const isMobile = useIsMobile();
  return (
    <section className="section" id="faq">
      <div className="wrap">
        <div className="faq__layout" style={{ alignItems: "start", gap: 64 }}>
          <div>
            <span className="eyebrow">
              <span className="dot" />
              Frequently asked
            </span>
            <h2
              className="h-display h-1"
              style={{
                marginTop: 18,
                maxWidth: 480,
                lineHeight: 1,
                minHeight: isMobile ? 80 : 180,
              }}
            >
              Questions,
              <br />
              <span className="serif-it" style={{ color: "var(--accent)" }}>
                answered.
              </span>
            </h2>
            <p className="body" style={{ marginTop: 20, maxWidth: 360 }}>
              Anything we missed? Reach out — our team replies within a working
              day.
            </p>
            <Link
              className="btn btn-ghost"
              href="/contact"
              style={{ marginTop: 20, display: "inline-block" }}
            >
              Contact support →
            </Link>
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
                    <div className="faq__a-inner body">{f.answer}</div>
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
