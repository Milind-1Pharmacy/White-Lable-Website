"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { Container } from "@/components/layout/Container";
import { fadeUp, gsap, REDUCED_MOTION, staggerCards } from "@/lib/motion";
import type { BrandOptionsCompareSectionData } from "@/types/config.types";

type BrandOptionsCompareProps = {
  data: BrandOptionsCompareSectionData;
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

export function BrandOptionsCompare({ data }: BrandOptionsCompareProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const rowsRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const trigger = sectionRef.current;
      if (headlineRef.current)
        fadeUp(headlineRef.current, { trigger, y: 26, duration: 0.9 });

      if (rowsRef.current) {
        const rows = rowsRef.current.querySelectorAll<HTMLElement>(
          "[data-bo-row]",
        );
        if (rows.length)
          staggerCards(rows, { trigger: rowsRef.current, stagger: 0.09, y: 18 });

        if (!REDUCED_MOTION) {
          rows.forEach((row, i) => {
            const marker = row.querySelector<HTMLElement>("[data-bo-marker]");
            if (!marker) return;
            const target = data.rows[i]?.position ?? 50;
            gsap.from(marker, {
              left: "0%",
              duration: 0.6,
              ease: "power2.out",
              delay: 0.4 + i * 0.09,
              scrollTrigger: {
                trigger: rowsRef.current,
                start: "top 95%",
                once: true,
              },
              onComplete: () => {
                marker.style.left = `${target}%`;
              },
            });
          });
        }
      }
    }, sectionRef);
    return () => ctx.revert();
  }, [data.rows]);

  if (!data?.rows?.length) return null;

  return (
    <section
      ref={sectionRef}
      id="brand-options"
      className="relative bg-[var(--brand-primary)] py-20 text-white sm:py-28"
    >
      <div className="grid items-stretch gap-0 lg:grid-cols-2">
        {/* Left photo */}
        <div className="relative min-h-[320px] lg:min-h-[560px]">
          <Image
            src={data.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          <span
            aria-hidden
            className="absolute inset-y-0 right-0 w-[2px] bg-[var(--brand-warm)]"
          />
        </div>

        {/* Right text block */}
        <div className="flex items-center px-5 py-12 sm:px-10 lg:px-16">
          <div className="w-full max-w-[560px]">
            {data.footnote && (
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--brand-warm)]">
                {data.footnote}
              </p>
            )}
            <span aria-hidden className="mt-3 block h-px w-8 bg-[var(--brand-warm)]" />
            <h2
              ref={headlineRef}
              className="mt-6 font-display text-[clamp(2rem,4vw,3.75rem)] font-bold uppercase leading-[1] tracking-[-0.015em] text-white"
            >
              {data.headline}
            </h2>
            <p className="mt-5 max-w-[40ch] text-[15px] leading-[1.6] text-white/65">
              {data.paragraph}
            </p>

            <ul ref={rowsRef} className="mt-10 space-y-7">
              {data.rows.map((row, i) => (
                <li
                  key={`${row.label}-${i}`}
                  data-bo-row
                  className="relative pl-7"
                >
                  <span className="absolute -left-1 top-0.5 font-mono text-[11px] text-white/30">
                    {ROMAN[i]}
                  </span>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/85">
                    {row.label}
                  </p>
                  <div className="relative mt-3 h-px w-full bg-white/15">
                    <span
                      data-bo-marker
                      className="absolute top-1/2 h-4 w-1 -translate-y-1/2 -translate-x-1/2 bg-[var(--brand-warm)]"
                      style={{ left: `${row.position}%` }}
                    />
                  </div>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                    Brand A → UrMedz
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Container className="absolute inset-x-0 -top-px h-px" />
    </section>
  );
}
