"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { Container } from "@/components/layout/Container";
import { fadeUp, gsap, REDUCED_MOTION } from "@/lib/motion";
import type { ProductPromoSectionData } from "@/types/config.types";

type ProductPromoProps = {
  data: ProductPromoSectionData;
};

function CtaIcon({ name }: { name?: "lock" | "arrow" }) {
  if (name === "lock") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          d="M4 8V5a4 4 0 1 1 8 0v3M3 8h10v6H3z"
        />
      </svg>
    );
  }
  if (name === "arrow") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          d="M3 8h10M9 4l4 4-4 4"
        />
      </svg>
    );
  }
  return null;
}

export function ProductPromo({ data }: ProductPromoProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const lineOneRef = useRef<HTMLSpanElement | null>(null);
  const lineTwoRef = useRef<HTMLSpanElement | null>(null);
  const eyebrowRef = useRef<HTMLParagraphElement | null>(null);
  const tagsRef = useRef<HTMLDivElement | null>(null);
  const paragraphRef = useRef<HTMLParagraphElement | null>(null);
  const ctasRef = useRef<HTMLDivElement | null>(null);
  const mockupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const trigger = sectionRef.current;
      if (tagsRef.current)
        fadeUp(tagsRef.current, { trigger, y: 12, duration: 0.6 });
      if (eyebrowRef.current)
        fadeUp(eyebrowRef.current, {
          trigger,
          y: 14,
          duration: 0.6,
          delay: 0.1,
        });
      if (lineOneRef.current)
        fadeUp(lineOneRef.current, {
          trigger,
          y: 20,
          duration: 0.7,
          delay: 0.2,
        });
      if (lineTwoRef.current && !REDUCED_MOTION) {
        const chars =
          lineTwoRef.current.querySelectorAll<HTMLElement>("[data-letter]");
        if (chars.length) {
          gsap.from(chars, {
            opacity: 0,
            y: 16,
            duration: 0.5,
            stagger: 0.024,
            ease: "power2.out",
            delay: 0.4,
            clearProps: "transform,opacity",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 95%",
              once: true,
            },
          });
        }
      }
      if (paragraphRef.current)
        fadeUp(paragraphRef.current, {
          trigger,
          y: 16,
          duration: 0.7,
          delay: 0.6,
        });
      if (ctasRef.current)
        fadeUp(ctasRef.current, {
          trigger,
          y: 16,
          duration: 0.7,
          delay: 0.7,
        });
      if (mockupRef.current && !REDUCED_MOTION) {
        gsap.from(mockupRef.current, {
          x: 80,
          opacity: 0,
          duration: 0.85,
          ease: "power3.out",
          delay: 0.3,
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 95%",
            once: true,
          },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (!data?.titleLineTwo) return null;

  return (
    <section
      ref={sectionRef}
      id="product-promo"
      className="relative overflow-hidden bg-[var(--brand-primary)] py-24 text-white sm:py-32"
    >
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left */}
          <div className="lg:col-span-5">
            {data.tags?.length ? (
              <div ref={tagsRef} className="mb-5 flex flex-wrap gap-2">
                {data.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[var(--brand-warm)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--brand-warm)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
            <p
              ref={eyebrowRef}
              className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-warm)]"
            >
              {data.eyebrow}
            </p>
            <h2 className="mt-5 font-display font-bold uppercase leading-[1] tracking-tight">
              <span
                ref={lineOneRef}
                className="block text-[clamp(1.75rem,3vw,2.5rem)] text-white/90"
              >
                {data.titleLineOne}
              </span>
              <span
                ref={lineTwoRef}
                className="mt-1 block text-[clamp(2.5rem,6vw,4.5rem)] text-[var(--brand-warm)]"
              >
                {Array.from(data.titleLineTwo).map((ch, i) => (
                  <span
                    key={i}
                    data-letter
                    style={{ display: "inline-block" }}
                  >
                    {ch === " " ? " " : ch}
                  </span>
                ))}
              </span>
            </h2>
            <p
              ref={paragraphRef}
              className="mt-6 max-w-[36ch] text-[15px] leading-[1.65] text-white/65"
            >
              {data.paragraph}
            </p>

            {data.ctas?.length ? (
              <div ref={ctasRef} className="mt-8 flex flex-wrap gap-3">
                {data.ctas.map((cta) => (
                  <Link
                    key={cta.label}
                    href={cta.href}
                    className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-[var(--brand-warm)] px-6 text-[13px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-white hover:text-[var(--brand-warm)]"
                  >
                    <CtaIcon name={cta.icon} />
                    <span>{cta.label}</span>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          {/* Right mockup */}
          <div ref={mockupRef} className="relative lg:col-span-7">
            <div
              className="relative mx-auto w-full max-w-[640px]"
              style={{
                perspective: "1200px",
              }}
            >
              <div
                className="relative aspect-[16/10] w-full rounded-md border border-white/15 bg-[var(--brand-secondary)] p-2"
                style={{
                  transform:
                    "rotateY(-8deg) rotateX(2deg)",
                  boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
                  borderTop: "2px solid var(--brand-warm)",
                }}
              >
                <div className="h-full w-full rounded-sm bg-white p-4">
                  {/* Stylized dashboard */}
                  <div className="flex items-center justify-between border-b border-[var(--brand-primary)]/15 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand-warm)]" />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
                        Health Pharmacy
                      </span>
                    </div>
                    <span className="font-mono text-[9px] text-[var(--brand-primary)]/50">
                      v 1.4
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]">
                        Introducing Our
                      </p>
                      <p className="text-[18px] font-bold text-[var(--brand-primary)]">
                        AI SaaS Product
                      </p>
                      <svg
                        viewBox="0 0 200 60"
                        className="mt-3 h-14 w-full"
                        aria-hidden
                      >
                        <polyline
                          fill="none"
                          stroke="var(--brand-warm)"
                          strokeWidth="2"
                          points="0,40 20,30 40,35 60,18 80,22 100,12 120,18 140,8 160,14 180,4 200,10"
                        />
                      </svg>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-3 rounded-sm bg-[var(--brand-primary)]/10" />
                      <div className="h-3 rounded-sm bg-[var(--brand-primary)]/10" />
                      <div className="h-3 rounded-sm bg-[var(--brand-warm)]/40" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
