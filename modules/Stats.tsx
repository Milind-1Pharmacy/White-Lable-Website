"use client";

import { useEffect, useRef } from "react";

import { Container } from "@/components/layout/Container";
import { fadeUp, gsap, REDUCED_MOTION } from "@/lib/motion";
import type { StatsSectionData } from "@/types/config.types";

type StatsProps = {
  data: StatsSectionData;
};

function parseNumeric(value: string): number | null {
  const cleaned = value.replace(/[,_\s]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function Stats({ data }: StatsProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const eyebrowRef = useRef<HTMLParagraphElement | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current || !rowRef.current) return;
    const ctx = gsap.context(() => {
      const trigger = sectionRef.current;
      if (eyebrowRef.current)
        fadeUp(eyebrowRef.current, { trigger, y: 12, duration: 0.6 });

      const cells = rowRef.current!.querySelectorAll<HTMLElement>("[data-stat]");
      cells.forEach((cell, i) => {
        const labelGroup = cell.querySelector<HTMLElement>("[data-stat-meta]");
        if (labelGroup) {
          gsap.from(labelGroup, {
            y: 18,
            opacity: 0,
            duration: 0.6,
            ease: "power3.out",
            delay: 0.1 + i * 0.12,
            clearProps: "transform,opacity",
            scrollTrigger: {
              trigger: rowRef.current,
              start: "top 95%",
              once: true,
            },
          });
        }
        const numEl = cell.querySelector<HTMLElement>("[data-stat-value]");
        if (numEl && !REDUCED_MOTION) {
          const target = parseNumeric(numEl.textContent || "");
          if (target !== null) {
            const obj = { val: 0 };
            gsap.to(obj, {
              val: target,
              duration: 1.2,
              ease: "power2.out",
              delay: 0.1 + i * 0.12,
              snap: { val: 1 },
              scrollTrigger: {
                trigger: rowRef.current,
                start: "top 95%",
                once: true,
              },
              onUpdate: () => {
                numEl.textContent = Math.round(obj.val).toLocaleString();
              },
            });
          }
        }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (!data?.items?.length) return null;

  return (
    <section
      ref={sectionRef}
      id="stats"
      className="relative py-20 sm:py-28"
    >
      <Container>
        {data.eyebrow && (
          <p
            ref={eyebrowRef}
            className="mb-10 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-warm)]"
          >
            {data.eyebrow}
          </p>
        )}
        <div
          ref={rowRef}
          className="grid border-t border-[var(--brand-primary)]/12 sm:grid-cols-2 lg:grid-cols-4"
        >
          {data.items.map((s, i) => (
            <div
              key={`${s.label}-${i}`}
              data-stat
              className="relative px-2 py-8 sm:px-6 sm:py-10 lg:[&:not(:last-child)]:border-r lg:[&:not(:last-child)]:border-[var(--brand-primary)]/12"
            >
              <p
                className="font-display font-bold leading-[0.9] tracking-[-0.04em] text-[var(--brand-ink)]"
                style={{
                  fontSize: "clamp(3rem, 8vw, 7rem)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <span data-stat-value>{s.value}</span>
                {s.suffix && (
                  <span
                    className="align-baseline text-[var(--brand-warm)]"
                    style={{ fontSize: "0.6em" }}
                  >
                    {s.suffix}
                  </span>
                )}
              </p>
              <div
                data-stat-meta
                className="mt-4 border-t border-[var(--brand-primary)]/15 pt-3"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]/65">
                  {s.label}
                </p>
                {s.footnote && (
                  <p className="mt-1 text-[10px] italic text-[var(--brand-primary)]/45">
                    {s.footnote}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
