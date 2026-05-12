"use client";

import { useEffect, useRef } from "react";

import { Container } from "@/components/layout/Container";
import { fadeUp, gsap, REDUCED_MOTION } from "@/lib/motion";
import type { TeamGridSectionData, TeamGridTile } from "@/types/config.types";

type TeamGridProps = {
  data: TeamGridSectionData;
};

const TILE_BG: Record<TeamGridTile["color"], string> = {
  mustard: "#F4B940",
  teal: "var(--brand-cool)",
  coral: "var(--brand-warm)",
  navy: "var(--brand-primary)",
};

const TILE_FG: Record<TeamGridTile["color"], string> = {
  mustard: "var(--brand-primary)",
  teal: "#FFFFFF",
  coral: "#FFFFFF",
  navy: "#F4B940",
};

function highlight(paragraph: string, words: string[] | undefined): string {
  if (!words?.length) return paragraph;
  let result = paragraph;
  for (const w of words) {
    const re = new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
    result = result.replace(re, "<mark data-tg-underline>$1</mark>");
  }
  return result;
}

export function TeamGrid({ data }: TeamGridProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const tilesRef = useRef<HTMLDivElement | null>(null);
  const medallionRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const rightColRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const trigger = sectionRef.current;
      if (tilesRef.current && !REDUCED_MOTION) {
        const tiles = tilesRef.current.querySelectorAll<HTMLElement>(
          "[data-tg-tile]",
        );
        gsap.from(tiles, {
          opacity: 0,
          scale: 0.92,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.12,
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 90%",
            once: true,
          },
        });
      }
      if (medallionRef.current && !REDUCED_MOTION) {
        gsap.from(medallionRef.current, {
          opacity: 0,
          scale: 0,
          duration: 0.6,
          ease: "back.out(1.4)",
          delay: 0.7,
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 90%",
            once: true,
          },
        });
      }
      if (rightColRef.current) {
        const items = rightColRef.current.querySelectorAll<HTMLElement>(
          "[data-tg-right]",
        );
        items.forEach((el, i) => {
          fadeUp(el, { trigger, y: 18, duration: 0.7, delay: 0.1 + i * 0.08 });
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (!data?.tiles?.length) return null;

  return (
    <section
      ref={sectionRef}
      id="team-grid"
      className="relative py-24 sm:py-32 lg:py-36"
    >
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left quadrant */}
          <div className="relative lg:col-span-6">
            <div
              ref={tilesRef}
              className="relative grid aspect-square w-full grid-cols-2 grid-rows-2"
            >
              {data.tiles.slice(0, 4).map((tile, i) => (
                <div
                  key={`${tile.label}-${i}`}
                  data-tg-tile
                  className="relative flex flex-col items-center justify-center p-5 text-center sm:p-7"
                  style={{
                    background: TILE_BG[tile.color],
                    color: TILE_FG[tile.color],
                  }}
                >
                  <span
                    className="font-display font-bold leading-[0.9] tracking-tight"
                    style={{
                      fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {tile.number}
                  </span>
                  <span className="mt-2 max-w-[14ch] text-[11px] font-semibold uppercase tracking-[0.16em]">
                    {tile.label}
                  </span>
                </div>
              ))}

              {/* Medallion + ring */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div
                  ref={ringRef}
                  className="absolute h-[58%] w-[58%] rounded-full border border-dashed border-[var(--brand-primary)]/40"
                  style={{
                    animation: REDUCED_MOTION
                      ? undefined
                      : "tg-ring 60s linear infinite",
                  }}
                />
                <div
                  ref={medallionRef}
                  className="relative flex h-[48%] w-[48%] flex-col items-center justify-center rounded-full border border-[var(--brand-primary)]/30 bg-white px-4 text-center"
                >
                  <span
                    aria-hidden
                    className="absolute top-3 text-[12px] text-[var(--brand-warm)]"
                  >
                    ✦
                  </span>
                  <p className="text-[10px] font-semibold uppercase leading-[1.4] tracking-[0.16em] text-[var(--brand-primary)]">
                    {data.medallion}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div ref={rightColRef} className="lg:col-span-6">
            <p
              data-tg-right
              className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-warm)]"
            >
              {data.eyebrow}
            </p>
            <span
              data-tg-right
              aria-hidden
              className="mt-3 block h-px w-8 bg-[var(--brand-warm)]"
            />
            <h2
              data-tg-right
              className="mt-6 font-display text-[clamp(2rem,4vw,3.5rem)] font-bold uppercase leading-[1.05] tracking-[-0.015em] text-[var(--brand-primary)]"
            >
              {data.headline}
            </h2>
            <p
              data-tg-right
              className="mt-5 max-w-[44ch] text-[15px] leading-[1.7] text-[var(--brand-primary)]/75"
              dangerouslySetInnerHTML={{
                __html: highlight(data.paragraph, data.highlightWords),
              }}
            />
          </div>
        </div>
      </Container>

      <style jsx>{`
        @keyframes tg-ring {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        :global(mark[data-tg-underline]) {
          background: transparent;
          color: inherit;
          padding: 0;
          border-bottom: 1.5px solid var(--brand-warm);
          padding-bottom: 1px;
        }
      `}</style>
    </section>
  );
}
