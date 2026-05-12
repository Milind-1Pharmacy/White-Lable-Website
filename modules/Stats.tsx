"use client";

import { useEffect, useRef } from "react";

import { Container } from "@/components/layout/Container";
import { REDUCED_MOTION, ScrollTrigger, fadeUp, gsap } from "@/lib/motion";
import type { StatsSectionData } from "@/types/config.types";

type StatsProps = {
  data: StatsSectionData;
};

function parseTarget(value: string): number | null {
  const cleaned = value.replace(/[,\s]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) && cleaned.length > 0 ? n : null;
}

export function Stats({ data }: StatsProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const eyebrowRef = useRef<HTMLParagraphElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const trigger = sectionRef.current;
      if (eyebrowRef.current)
        fadeUp(eyebrowRef.current, { trigger, y: 14, duration: 0.7 });

      if (!gridRef.current) return;
      const numerals = gridRef.current.querySelectorAll<HTMLElement>("[data-stat-value]");
      const dividers = gridRef.current.querySelectorAll<HTMLElement>("[data-stat-divider]");

      if (REDUCED_MOTION) return;

      gsap.set(dividers, { scaleY: 0, transformOrigin: "top center" });

      ScrollTrigger.create({
        trigger: gridRef.current,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(dividers, {
            scaleY: 1,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.08,
            clearProps: "transform",
          });

          numerals.forEach((el, idx) => {
            const target = Number(el.dataset.target ?? "");
            if (!Number.isFinite(target) || target === 0) return;
            const proxy = { n: 0 };
            el.textContent = "0";
            gsap.to(proxy, {
              n: target,
              duration: 1.2,
              ease: "power2.out",
              delay: 0.12 * idx,
              onUpdate: () => {
                el.textContent = Math.round(proxy.n).toLocaleString();
              },
            });
          });
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (!data?.items?.length) return null;

  return (
    <section
      ref={sectionRef}
      id="stats"
      className="relative py-24 sm:py-32 lg:py-40"
    >
      <Container>
        <p
          ref={eyebrowRef}
          className="mb-12 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.25em] text-[var(--brand-primary)] sm:mb-16"
        >
          <span aria-hidden className="block h-px w-10 bg-[var(--brand-primary)]" />
          {data.eyebrow ?? "By the numbers"}
        </p>

        <div
          ref={gridRef}
          className="relative grid grid-cols-2 gap-y-12 lg:grid-cols-4 lg:gap-y-0"
        >
          {data.items.map((item, idx) => {
            const target = parseTarget(item.value);
            const display = target != null ? target.toLocaleString() : item.value;
            return (
              <div
                key={`${item.label}-${idx}`}
                className="relative px-4 sm:px-6 lg:px-8"
              >
                {idx > 0 ? (
                  <span
                    aria-hidden
                    data-stat-divider
                    className="absolute left-0 top-2 hidden h-[calc(100%-1rem)] w-px bg-[color:color-mix(in_srgb,var(--brand-primary)_12%,transparent)] lg:block"
                  />
                ) : null}
                <p
                  className="font-display font-light leading-[0.9] tracking-[-0.04em] text-[var(--brand-ink)] [font-feature-settings:'tnum']"
                  style={{ fontSize: "clamp(3rem, 9vw, 7.5rem)" }}
                >
                  <span data-stat-value data-target={target ?? 0}>
                    {display}
                  </span>
                  {item.suffix ? (
                    <span className="align-baseline text-[0.45em] text-[var(--brand-primary)]">
                      {item.suffix}
                    </span>
                  ) : null}
                </p>
                <div className="mt-5 border-t border-[color:color-mix(in_srgb,var(--brand-primary)_18%,transparent)] pt-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--brand-text)]/60">
                    {item.label}
                  </p>
                  {item.footnote ? (
                    <p className="mt-1 text-[10px] italic leading-snug text-[var(--brand-text)]/55">
                      {item.footnote}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
