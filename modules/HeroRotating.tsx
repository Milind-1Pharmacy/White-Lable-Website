"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Container } from "@/components/layout/Container";
import { fadeUp, gsap } from "@/lib/motion";
import type { HeroRotatingSectionData } from "@/types/config.types";

type HeroRotatingProps = {
  data: HeroRotatingSectionData;
};

const BLOB_PATHS = [
  "M180,40 C260,40 320,90 320,180 C320,260 270,330 190,330 C90,330 40,260 40,170 C40,90 100,40 180,40 Z",
  "M170,30 C260,50 330,110 320,200 C310,290 240,330 160,320 C70,310 30,240 40,150 C50,80 100,20 170,30 Z",
  "M190,50 C270,60 320,130 310,210 C300,290 230,340 150,320 C70,300 30,220 50,140 C70,70 130,40 190,50 Z",
];

export function HeroRotating({ data }: HeroRotatingProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const taglineRef = useRef<HTMLParagraphElement | null>(null);
  const wordmarkRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const [clock, setClock] = useState<string>("");

  const slides = data.slides ?? [];
  const total = slides.length;
  const rotateMs = (data.autoRotateSeconds ?? 5.5) * 1000;

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const trigger = sectionRef.current;
      if (headlineRef.current)
        fadeUp(headlineRef.current, { trigger, y: 28, duration: 0.9 });
      if (taglineRef.current)
        fadeUp(taglineRef.current, {
          trigger,
          y: 18,
          duration: 0.8,
          delay: 0.15,
        });
      if (wordmarkRef.current)
        fadeUp(wordmarkRef.current, {
          trigger,
          y: 14,
          duration: 0.7,
          delay: 0.25,
        });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Auto-advance
  useEffect(() => {
    if (total < 2) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % total);
    }, rotateMs);
    return () => window.clearInterval(id);
  }, [total, rotateMs]);

  // Clock
  useEffect(() => {
    function tick() {
      const now = new Date();
      const hh = now.getHours().toString().padStart(2, "0");
      const mm = now.getMinutes().toString().padStart(2, "0");
      setClock(`${hh}:${mm} IST`);
    }
    tick();
    const id = window.setInterval(tick, 30 * 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!total) return null;

  const slide = slides[active];
  const secondTone =
    slide.secondWordTone === "warm"
      ? "var(--brand-warm)"
      : "var(--brand-cool)";
  const blob = BLOB_PATHS[active % BLOB_PATHS.length];

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative overflow-hidden pb-16 pt-10 sm:pb-24 sm:pt-14 lg:pb-32 lg:pt-20"
    >
      {/* Top-right monospace location/time */}
      <div className="pointer-events-none absolute right-5 top-5 z-10 sm:right-8 lg:right-12 xl:right-16">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--brand-primary)]/55">
          BENGALURU · {clock}
        </span>
      </div>

      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left text column */}
          <div className="lg:col-span-7">
            <h1
              ref={headlineRef}
              key={`hl-${active}`}
              className="font-display text-[clamp(3.5rem,8vw,8rem)] font-bold leading-[0.92] tracking-[-0.035em]"
            >
              <span className="text-[var(--brand-primary)]">
                {slide.firstWord}
              </span>{" "}
              <span style={{ color: secondTone }}>
                {slide.secondWord}
              </span>
            </h1>

            <p
              ref={taglineRef}
              className="mt-6 max-w-[38ch] text-base leading-[1.55] text-[var(--brand-primary)]/75 sm:text-lg"
            >
              {slide.subTagline}
            </p>

            {data.brandWordmark && (
              <div
                ref={wordmarkRef}
                className="mt-8 flex items-center gap-5"
              >
                <span className="font-display text-[28px] font-bold tracking-tight">
                  <span className="text-[var(--brand-primary)]">Ur </span>
                  <span style={{ color: "var(--brand-cool)" }}>Med</span>
                  <span style={{ color: "var(--brand-warm)" }}>Z</span>
                </span>
                <span className="hidden h-px flex-1 bg-[var(--brand-primary)]/15 sm:block" />
              </div>
            )}

            {/* Carousel controls */}
            {total > 1 && (
              <div className="mt-10 flex items-center gap-5">
                <div className="flex items-center gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Slide ${i + 1}`}
                      onClick={() => setActive(i)}
                      className="block h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: i === active ? 24 : 6,
                        background:
                          i === active
                            ? "var(--brand-primary)"
                            : "color-mix(in srgb, var(--brand-primary) 25%, transparent)",
                      }}
                    />
                  ))}
                </div>
                <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--brand-primary)]/50">
                  {String(active + 1).padStart(2, "0")} /{" "}
                  {String(total).padStart(2, "0")}
                </span>
              </div>
            )}
          </div>

          {/* Right blob portrait */}
          <div className="relative lg:col-span-5">
            <div className="relative aspect-square w-full max-w-[520px] sm:mx-auto">
              <svg
                viewBox="0 0 360 360"
                aria-hidden
                className="absolute inset-0 h-full w-full"
              >
                <defs>
                  <clipPath id="urmedz-hero-blob">
                    <path d={blob} />
                  </clipPath>
                </defs>
                <g clipPath="url(#urmedz-hero-blob)">
                  <foreignObject x="0" y="0" width="360" height="360">
                    <div
                      style={{
                        width: 360,
                        height: 360,
                        background:
                          "color-mix(in srgb, var(--brand-primary) 6%, var(--brand-background))",
                      }}
                    />
                  </foreignObject>
                </g>
                <path
                  d={blob}
                  fill="none"
                  stroke="color-mix(in srgb, var(--brand-primary) 12%, transparent)"
                  strokeWidth="1"
                />
              </svg>
              {slide.image && (
                <div
                  className="absolute inset-0"
                  style={{ clipPath: `path('${blob}')` }}
                >
                  <Image
                    src={slide.image}
                    alt={`${slide.firstWord} ${slide.secondWord}`}
                    fill
                    priority={active === 0}
                    sizes="(min-width: 1024px) 40vw, 90vw"
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            {/* Floating icon tags */}
            {slide.iconTags && slide.iconTags.length > 0 && (
              <ul className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-4 flex-col gap-4 lg:flex">
                {slide.iconTags.map((tag, i) => (
                  <li
                    key={tag.label}
                    className="flex items-center gap-3 border-l-2 bg-[var(--brand-background)] px-3 py-2 shadow-[0_8px_24px_-12px_rgba(10,23,76,0.18)]"
                    style={{
                      borderColor:
                        i === active
                          ? "var(--brand-primary)"
                          : "transparent",
                    }}
                  >
                    <span
                      aria-hidden
                      className="block h-2.5 w-2.5 rounded-full"
                      style={{
                        background:
                          i === active
                            ? "var(--brand-warm)"
                            : "color-mix(in srgb, var(--brand-warm) 40%, transparent)",
                      }}
                    />
                    <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--brand-primary)]">
                      {tag.label}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Mobile icon tags */}
        {slide.iconTags && slide.iconTags.length > 0 && (
          <ul className="mt-10 flex flex-wrap gap-3 lg:hidden">
            {slide.iconTags.map((tag) => (
              <li
                key={tag.label}
                className="flex items-center gap-2 border border-[var(--brand-primary)]/15 px-3 py-2"
              >
                <span
                  aria-hidden
                  className="block h-2 w-2 rounded-full bg-[var(--brand-warm)]"
                />
                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--brand-primary)]">
                  {tag.label}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
