"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { Container } from "@/components/layout/Container";
import { fadeUp, gsap, staggerCards } from "@/lib/motion";
import type { TeamShowcaseSectionData } from "@/types/config.types";

type TeamShowcaseProps = {
  data: TeamShowcaseSectionData;
};

export function TeamShowcase({ data }: TeamShowcaseProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const leftRef = useRef<HTMLDivElement | null>(null);
  const mosaicRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      if (leftRef.current)
        fadeUp(leftRef.current, { trigger: sectionRef.current!, y: 28, duration: 0.9 });

      if (mosaicRef.current) {
        const tiles = mosaicRef.current.querySelectorAll<HTMLElement>("[data-mosaic-tile]");
        if (tiles.length)
          staggerCards(tiles, { trigger: sectionRef.current!, stagger: 0.1, y: 20 });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (!data?.title) return null;

  const images = data.images ?? [];

  return (
    <section
      ref={sectionRef}
      id="team-showcase"
      className="relative overflow-hidden py-20 sm:py-28"
      style={{ background: "color-mix(in srgb, var(--brand-primary) 3%, var(--brand-background))" }}
    >
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-16">

          {/* Left — text */}
          <div ref={leftRef} className="lg:col-span-5">
            {data.eyebrow && (
              <div className="mb-6 flex items-center gap-3">
                <span
                  className="block h-[2px] w-8"
                  style={{ background: "var(--brand-warm, #E63950)" }}
                  aria-hidden
                />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--brand-primary)]/55">
                  {data.eyebrow}
                </span>
              </div>
            )}

            <h2 className="font-display text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.025em] text-[var(--brand-primary)]">
              {data.title}
            </h2>

            <p className="mt-6 max-w-[44ch] text-sm leading-relaxed text-[var(--brand-primary)]/60 sm:text-base">
              {data.description}
            </p>

            {data.centralText && (
              <blockquote
                className="mt-8 border-l-2 pl-5 text-sm italic leading-relaxed text-[var(--brand-primary)]/70"
                style={{ borderColor: "var(--brand-cool, #1FB6B6)" }}
              >
                {data.centralText}
              </blockquote>
            )}

            {/* Decorative stat row */}
            <div className="mt-10 flex items-center gap-6">
              {[
                { value: "100+", label: "Team members" },
                { value: "4+", label: "Departments" },
              ].map((s) => (
                <div key={s.label}>
                  <p
                    className="font-display text-2xl font-bold"
                    style={{ color: "var(--brand-primary)" }}
                  >
                    {s.value}
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--brand-primary)]/50">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — image mosaic */}
          <div ref={mosaicRef} className="relative lg:col-span-7">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {images.slice(0, 4).map((src, i) => (
                <div
                  key={i}
                  data-mosaic-tile
                  className="group relative overflow-hidden rounded-xl shadow-md"
                  style={{
                    aspectRatio: i === 0 ? "4/3" : i === 1 ? "3/4" : i === 2 ? "3/4" : "4/3",
                    marginTop: i === 1 || i === 2 ? "1.5rem" : "0",
                  }}
                >
                  <Image
                    src={src}
                    alt={`Team ${i + 1}`}
                    fill
                    sizes="(min-width: 1024px) 28vw, 48vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Tint overlay */}
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background:
                        "linear-gradient(to top, color-mix(in srgb, var(--brand-primary) 40%, transparent), transparent 60%)",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Central floating medallion */}
            {data.centralIcon && (
              <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                <div
                  className="relative flex h-16 w-16 items-center justify-center rounded-full shadow-xl ring-2 ring-white"
                  style={{ background: "var(--brand-primary)" }}
                >
                  <Image
                    src={data.centralIcon}
                    alt="Team emblem"
                    fill
                    sizes="64px"
                    className="rounded-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Decorative corner accent */}
            <div
              className="pointer-events-none absolute -bottom-3 -right-3 h-24 w-24 rounded-xl opacity-15"
              style={{ background: "var(--brand-cool, #1FB6B6)" }}
              aria-hidden
            />
          </div>

        </div>
      </Container>
    </section>
  );
}
