"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { Container } from "@/components/layout/Container";
import { fadeUp, gsap, staggerCards } from "@/lib/motion";
import type { AboutFeaturesSectionData } from "@/types/config.types";

type AboutFeaturesProps = {
  data: AboutFeaturesSectionData;
};

export function AboutFeatures({ data }: AboutFeaturesProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const leftRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      if (leftRef.current)
        fadeUp(leftRef.current, { trigger: sectionRef.current!, y: 28, duration: 0.9 });
      if (listRef.current) {
        const items = listRef.current.querySelectorAll<HTMLElement>("[data-feature-item]");
        if (items.length) staggerCards(items, { trigger: sectionRef.current!, stagger: 0.12, y: 20 });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (!data?.title) return null;

  return (
    <section
      ref={sectionRef}
      id="about-features"
      className="relative overflow-hidden py-20 sm:py-28"
    >
      {/* Faint grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in srgb, var(--brand-primary) 4%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--brand-primary) 4%, transparent) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-20">

          {/* Left column — headline */}
          <div ref={leftRef} className="lg:col-span-5">
            {data.eyebrow && (
              <div className="mb-6 flex items-center gap-3">
                <span
                  className="block h-[2px] w-10"
                  style={{ background: "var(--brand-warm, #E63950)" }}
                  aria-hidden
                />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--brand-primary)]/60">
                  {data.eyebrow}
                </span>
              </div>
            )}

            <h2 className="font-display text-[clamp(2rem,4.5vw,3.75rem)] font-bold leading-[1.05] tracking-[-0.025em] text-[var(--brand-primary)]">
              {data.title}
            </h2>

            {data.description && (
              <p className="mt-6 max-w-[40ch] text-base leading-relaxed text-[var(--brand-primary)]/60">
                {data.description}
              </p>
            )}

            {/* Decorative pill */}
            <div
              className="mt-10 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={{
                background: "color-mix(in srgb, var(--brand-primary) 6%, transparent)",
                color: "var(--brand-primary)",
              }}
            >
              <span
                className="block h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--brand-warm, #E63950)" }}
                aria-hidden
              />
              Pharma, made accessible
            </div>
          </div>

          {/* Right column — feature items */}
          <div ref={listRef} className="lg:col-span-7">
            <div className="divide-y" style={{ borderColor: "color-mix(in srgb, var(--brand-primary) 10%, transparent)" }}>
              {data.features.map((feature, i) => (
                <div
                  key={i}
                  data-feature-item
                  className="group flex items-start gap-6 py-8 first:pt-0 last:pb-0"
                >
                  {/* Icon or number */}
                  <div className="shrink-0">
                    {feature.icon ? (
                      <div className="relative h-14 w-14 overflow-hidden rounded-xl shadow-sm ring-1 ring-[var(--brand-primary)]/10">
                        <Image
                          src={feature.icon}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-contain p-2"
                        />
                      </div>
                    ) : (
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold"
                        style={{
                          background: "color-mix(in srgb, var(--brand-primary) 8%, transparent)",
                          color: "var(--brand-primary)",
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-base font-bold leading-snug text-[var(--brand-primary)] sm:text-lg">
                      {feature.title}
                    </h3>
                    {feature.description && (
                      <p className="mt-2 text-sm leading-relaxed text-[var(--brand-primary)]/60">
                        {feature.description}
                      </p>
                    )}
                  </div>

                  {/* Arrow accent */}
                  <div
                    className="hidden shrink-0 translate-x-0 text-xl font-light transition-transform duration-300 group-hover:translate-x-1 sm:block"
                    style={{ color: "color-mix(in srgb, var(--brand-primary) 25%, transparent)" }}
                    aria-hidden
                  >
                    →
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
