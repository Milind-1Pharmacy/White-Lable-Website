"use client";

import { useEffect, useRef, useState } from "react";

import { Container } from "@/components/layout/Container";
import { fadeUp, gsap, staggerCards } from "@/lib/motion";
import type { FaqSectionData } from "@/types/config.types";

type FaqProps = {
  data: FaqSectionData;
};

export function Faq({ data }: FaqProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const eyebrowRef = useRef<HTMLParagraphElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const trigger = sectionRef.current;
      if (eyebrowRef.current)
        fadeUp(eyebrowRef.current, { trigger, y: 14, duration: 0.7 });
      if (headingRef.current)
        fadeUp(headingRef.current, { trigger, y: 22, duration: 0.9, delay: 0.1 });
      if (listRef.current) {
        const rows = listRef.current.querySelectorAll<HTMLElement>("[data-faq-row]");
        if (rows.length)
          staggerCards(rows, { trigger: listRef.current, stagger: 0.08, y: 20 });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (!data?.items?.length) return null;

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="relative py-24 sm:py-32 lg:py-40"
    >
      <Container>
        <div className="mb-14 max-w-2xl sm:mb-20">
          <p
            ref={eyebrowRef}
            className="mb-5 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.25em] text-[var(--brand-primary)]"
          >
            <span aria-hidden className="block h-px w-10 bg-[var(--brand-primary)]" />
            FAQ
          </p>
          <h2
            ref={headingRef}
            className="font-display text-[clamp(2rem,4.5vw,3.75rem)] font-light leading-[1.05] tracking-tight text-[var(--brand-text)]"
          >
            {data.heading ?? "Frequently asked"}
          </h2>
        </div>

        <ul ref={listRef} className="max-w-[720px]">
          {data.items.map((item, idx) => {
            const isOpen = openIdx === idx;
            const panelId = `faq-panel-${idx}`;
            const buttonId = `faq-button-${idx}`;
            return (
              <li
                key={`${item.question}-${idx}`}
                data-faq-row
                className="will-anim relative border-b border-[color:color-mix(in_srgb,var(--brand-primary)_15%,transparent)] first:border-t"
              >
                <span
                  aria-hidden
                  className={`pointer-events-none absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 -translate-x-3 bg-[var(--brand-primary)] transition-opacity duration-200 ${
                    isOpen ? "opacity-100" : "opacity-0"
                  }`}
                />
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="group flex w-full items-center gap-6 py-5 text-left"
                >
                  <span
                    aria-hidden
                    className="font-mono text-[14px] text-[var(--brand-primary)]/40"
                  >
                    {String(idx + 1).padStart(2, "0")}.
                  </span>
                  <span className="flex-1 text-[18px] font-medium text-[var(--brand-text)]">
                    {item.question}
                  </span>
                  <span
                    aria-hidden
                    className="flex h-8 w-8 items-center justify-center border border-[color:color-mix(in_srgb,var(--brand-primary)_35%,transparent)] text-[var(--brand-primary)] transition-colors group-hover:border-[var(--brand-primary)]"
                  >
                    <span
                      className={`block text-[18px] leading-none transition-transform duration-200 ${
                        isOpen ? "rotate-45" : "rotate-0"
                      }`}
                    >
                      +
                    </span>
                  </span>
                </button>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="grid transition-[grid-template-rows] duration-[220ms] ease-[cubic-bezier(.4,0,.2,1)]"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[64ch] pb-6 pl-12 pr-4 text-[16px] leading-[1.7] text-[var(--brand-text)]/80">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
