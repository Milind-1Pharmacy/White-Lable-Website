"use client";

import { useEffect, useRef } from "react";

import { Container } from "@/components/layout/Container";
import { fadeUp, gsap, REDUCED_MOTION, staggerCards } from "@/lib/motion";
import type { AboutWithStatsSectionData } from "@/types/config.types";

type AboutWithStatsProps = {
  data: AboutWithStatsSectionData;
};

function applyUnderlines(headline: string, words: string[] | undefined) {
  if (!words?.length) return headline;
  let result = headline;
  for (const w of words) {
    const re = new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
    result = result.replace(re, "<mark data-underline>$1</mark>");
  }
  return result;
}

export function AboutWithStats({ data }: AboutWithStatsProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const rightColRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const trigger = sectionRef.current;
      if (headlineRef.current)
        fadeUp(headlineRef.current, { trigger, y: 32, duration: 0.95 });

      if (rightColRef.current) {
        const items = rightColRef.current.querySelectorAll<HTMLElement>(
          "[data-aws-item]",
        );
        if (items.length)
          staggerCards(items, { trigger: rightColRef.current, stagger: 0.1, y: 22 });
      }

      if (!REDUCED_MOTION && headlineRef.current) {
        const marks = headlineRef.current.querySelectorAll<HTMLElement>(
          "mark[data-underline]",
        );
        marks.forEach((m) => {
          gsap.from(m, {
            "--mark-scale": 0,
            duration: 0.6,
            delay: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 95%",
              once: true,
            },
          });
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (!data?.headline) return null;

  return (
    <section
      ref={sectionRef}
      id="about-with-stats"
      className="relative py-24 sm:py-32 lg:py-40"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left headline */}
          <div className="lg:col-span-7">
            <h2
              ref={headlineRef}
              className="font-display text-[clamp(2.5rem,6vw,5.5rem)] font-bold uppercase leading-[0.95] tracking-[-0.02em] text-[var(--brand-primary)]"
              dangerouslySetInnerHTML={{
                __html: applyUnderlines(data.headline, data.underlinedWords),
              }}
            />
          </div>

          {/* Right */}
          <div ref={rightColRef} className="lg:col-span-5">
            {data.eyebrow && (
              <p
                data-aws-item
                className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-warm)]"
              >
                {data.eyebrow}
              </p>
            )}
            <div
              data-aws-item
              aria-hidden
              className="mt-3 h-px w-8 bg-[var(--brand-warm)]"
            />
            <p
              data-aws-item
              className="mt-5 max-w-[42ch] text-[15px] leading-[1.65] text-[var(--brand-primary)]/75 sm:text-base"
            >
              {data.paragraph}
            </p>
            {data.miniStats?.length ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {data.miniStats.map((s, i) => (
                  <div
                    key={`${s.label}-${i}`}
                    data-aws-item
                    className="group relative border border-[var(--brand-primary)]/12 p-6 transition-all duration-200 hover:border-l-[3px] hover:border-l-[var(--brand-primary)]"
                  >
                    <span
                      aria-hidden
                      className="block h-8 w-8 text-[var(--brand-warm)]"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="4" y="6" width="16" height="14" />
                        <path d="M4 10h16" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </span>
                    <p className="mt-4 text-[13px] font-bold uppercase leading-[1.3] tracking-[0.04em] text-[var(--brand-primary)]">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Gutter marker */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 -rotate-90 font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--brand-primary)]/30 lg:block"
        >
          ABOUT · 01
        </span>
      </Container>

      <style jsx>{`
        :global(mark[data-underline]) {
          background: transparent;
          color: inherit;
          position: relative;
          padding: 0;
          --mark-scale: 1;
        }
        :global(mark[data-underline])::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -0.1em;
          height: 4px;
          background: var(--brand-warm);
          transform: scaleX(var(--mark-scale));
          transform-origin: left center;
        }
      `}</style>
    </section>
  );
}
