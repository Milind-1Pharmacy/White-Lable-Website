"use client";

import { useEffect, useRef } from "react";

import { Container } from "@/components/layout/Container";
import { fadeUp, gsap, staggerCards } from "@/lib/motion";
import type { FeaturesSectionData } from "@/types/config.types";

type FeaturesProps = {
  data: FeaturesSectionData;
};

export function Features({ data }: FeaturesProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const eyebrowRef = useRef<HTMLParagraphElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const trigger = sectionRef.current;
      if (eyebrowRef.current)
        fadeUp(eyebrowRef.current, { trigger, y: 14, duration: 0.7 });
      if (headingRef.current)
        fadeUp(headingRef.current, { trigger, y: 22, duration: 0.9, delay: 0.1 });
      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll<HTMLElement>("[data-feature]");
        if (cards.length) {
          staggerCards(cards, { trigger: gridRef.current, stagger: 0.08, y: 28 });
        }
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (!data?.items?.length) return null;

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative py-24 sm:py-32 lg:py-40"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--brand-secondary) 18%, transparent), transparent)",
        }}
      />
      <Container>
        <div className="mb-14 max-w-2xl sm:mb-20">
          <p
            ref={eyebrowRef}
            className="mb-5 text-xs font-medium uppercase tracking-[0.25em] text-[var(--brand-primary)]"
          >
            Features
          </p>
          <h2
            ref={headingRef}
            className="font-display text-[clamp(2rem,4.5vw,3.75rem)] font-light leading-[1.05] tracking-tight text-[var(--brand-text)]"
          >
            {data.heading ?? "What sets us apart"}
          </h2>
        </div>
        <div
          ref={gridRef}
          className="grid gap-px overflow-hidden rounded-2xl bg-[var(--brand-text)]/8 sm:grid-cols-2"
          style={{ background: "color-mix(in srgb, var(--brand-text) 8%, transparent)" }}
        >
          {data.items.map((item, idx) => (
            <div
              key={`${item.title}-${idx}`}
              data-feature
              className="group relative bg-[var(--brand-background)] p-8 transition-colors duration-500 hover:bg-[var(--brand-secondary)]/15 sm:p-10 lg:p-12 will-anim"
            >
              <div className="flex items-start gap-6">
                <span
                  aria-hidden
                  className="font-display text-3xl font-light text-[var(--brand-accent)]/70"
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <h3 className="font-display text-2xl font-light tracking-tight text-[var(--brand-text)]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-[var(--brand-text)]/70">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
