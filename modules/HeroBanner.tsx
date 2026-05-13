"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { gsap, REDUCED_MOTION } from "@/lib/motion";
import type { HeroBannerSectionData } from "@/types/config.types";

type HeroBannerProps = {
  data: HeroBannerSectionData;
};

const SLIDE_COPY = [
  {
    eyebrow: "Authentic · Traceable · Safe",
    headline: "Your health,\nour promise.",
    sub: "Licensed pharmacists. Genuine medicines. Delivered fast.",
  },
  {
    eyebrow: "Quick Commerce · Pan-India",
    headline: "Medicines at\nyour door.",
    sub: "Same-day delivery from your nearest UrMedz store.",
  },
  {
    eyebrow: "Hi-Tech · Compliant · Scalable",
    headline: "Built for\nscale.",
    sub: "Climate-controlled fulfilment. Batch-traceable dispatch.",
  },
];

export function HeroBanner({ data }: HeroBannerProps) {
  const slides = data.slides ?? [];
  const total = slides.length;
  const rotateMs = (data.autoRotateSeconds ?? 5.5) * 1000;

  const [active, setActive] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRef = useRef<HTMLDivElement | null>(null);
  const animating = useRef(false);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const progressAnim = useRef<ReturnType<typeof gsap.to> | null>(null);

  const restartProgress = useCallback(() => {
    if (!progressRef.current || REDUCED_MOTION) return;
    progressAnim.current?.kill();
    gsap.set(progressRef.current, { scaleX: 0 });
    progressAnim.current = gsap.to(progressRef.current, {
      scaleX: 1,
      duration: rotateMs / 1000,
      ease: "none",
      transformOrigin: "left center",
    });
  }, [rotateMs]);

  const goTo = useCallback(
    (next: number) => {
      if (animating.current || next === active) return;
      const prev = active;

      if (REDUCED_MOTION) {
        setActive(next);
        restartProgress();
        return;
      }

      animating.current = true;
      const outEl = slideRefs.current[prev];
      const inEl = slideRefs.current[next];

      if (!outEl || !inEl) {
        animating.current = false;
        setActive(next);
        restartProgress();
        return;
      }

      gsap.set(inEl, { opacity: 0, zIndex: 2 });
      gsap.set(outEl, { zIndex: 1 });
      gsap.to(inEl, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.inOut",
        onStart: () => setActive(next),
        onComplete: () => {
          gsap.set(outEl, { opacity: 1, zIndex: 0 });
          gsap.set(inEl, { zIndex: 1 });
          animating.current = false;
        },
      });

      if (textRef.current) {
        gsap.to(textRef.current, {
          opacity: 0,
          y: -10,
          duration: 0.22,
          ease: "power2.in",
          onComplete: () => {
            gsap.fromTo(
              textRef.current,
              { opacity: 0, y: 14 },
              { opacity: 1, y: 0, duration: 0.42, ease: "power3.out" },
            );
          },
        });
      }

      restartProgress();
    },
    [active, restartProgress],
  );

  const goNext = useCallback(
    () => goTo((active + 1) % total),
    [active, total, goTo],
  );
  const goPrev = useCallback(
    () => goTo((active - 1 + total) % total),
    [active, total, goTo],
  );

  useEffect(() => {
    if (total < 2 || isHovered) return;
    const id = window.setInterval(goNext, rotateMs);
    return () => window.clearInterval(id);
  }, [total, rotateMs, isHovered, goNext]);

  useEffect(() => {
    restartProgress();
  }, [restartProgress]);

  if (!total) return null;

  const copy = SLIDE_COPY[active % SLIDE_COPY.length];

  return (
    <section
      className="relative w-full overflow-hidden bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle background texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(10,23,76,0.04) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(31,182,182,0.06) 0%, transparent 50%)",
        }}
      />

      <div className="relative mx-auto max-w-[1400px]">
        <div className="grid min-h-[520px] lg:grid-cols-[1fr_1.15fr] lg:min-h-[560px]">
          {/* ── Left: text panel ── */}
          <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-14 xl:px-16">
            {/* Eyebrow pill */}
            <div ref={textRef} className="flex flex-col">
              <span
                className="mb-5 inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em]"
                style={{
                  background: "rgba(10,23,76,0.06)",
                  color: "var(--brand-primary)",
                  border: "1px solid rgba(10,23,76,0.1)",
                }}
              >
                <span
                  className="block h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--brand-cool, #1FB6B6)" }}
                />
                {copy.eyebrow}
              </span>

              <h1
                className="font-display font-black leading-[1.0] tracking-[-0.03em]"
                style={{
                  fontSize: "clamp(2.8rem, 5.5vw, 5rem)",
                  color: "var(--brand-primary)",
                }}
              >
                {copy.headline.split("\n").map((line, i) => (
                  <span key={i} className="block">
                    {i === 1 ? (
                      <span style={{ color: "var(--brand-cool, #1FB6B6)" }}>
                        {line}
                      </span>
                    ) : (
                      line
                    )}
                  </span>
                ))}
              </h1>

              <p
                className="mt-5 max-w-[34ch] text-[15px] leading-relaxed"
                style={{ color: "rgba(10,23,76,0.55)" }}
              >
                {copy.sub}
              </p>
            </div>

            {/* Controls */}
            {total > 1 && (
              <div className="mt-10 flex items-center gap-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    aria-label="Previous"
                    onClick={goPrev}
                    className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200"
                    style={{
                      background: "rgba(10,23,76,0.06)",
                      border: "1px solid rgba(10,23,76,0.12)",
                      color: "var(--brand-primary)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "var(--brand-primary)";
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "white";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "rgba(10,23,76,0.06)";
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "var(--brand-primary)";
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Next"
                    onClick={goNext}
                    className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200"
                    style={{
                      background: "var(--brand-primary)",
                      color: "white",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "var(--brand-cool, #1FB6B6)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "var(--brand-primary)";
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>

                {/* Dot pills */}
                <div className="flex items-center gap-1.5">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Slide ${i + 1}`}
                      onClick={() => goTo(i)}
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: i === active ? 24 : 7,
                        height: 7,
                        background:
                          i === active
                            ? "var(--brand-primary)"
                            : "rgba(10,23,76,0.18)",
                      }}
                    />
                  ))}
                </div>

                <span
                  className="font-mono text-[11px] tracking-widest"
                  style={{ color: "rgba(10,23,76,0.3)" }}
                >
                  {String(active + 1).padStart(2, "0")}/
                  {String(total).padStart(2, "0")}
                </span>
              </div>
            )}

            {/* Progress bar */}
            <div
              className="mt-5 h-[2px] w-full max-w-[180px] overflow-hidden rounded-full"
              style={{ background: "rgba(10,23,76,0.1)" }}
            >
              <div
                ref={progressRef}
                className="h-full origin-left rounded-full"
                style={{
                  background: "var(--brand-cool, #1FB6B6)",
                  transform: "scaleX(0)",
                }}
              />
            </div>
          </div>

          {/* ── Right: image panel ── */}
          <div className="relative min-h-[300px] lg:min-h-[520px]">
            {slides.map((slide, i) => (
              <div
                key={i}
                ref={(el) => {
                  slideRefs.current[i] = el;
                }}
                className="absolute inset-0"
                style={{ opacity: i === 0 ? 1 : 0, zIndex: i === 0 ? 1 : 0 }}
              >
                <Image
                  src={slide.image}
                  alt={slide.alt ?? `Slide ${i + 1}`}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-contain object-center"
                />
              </div>
            ))}

            {/* Accent strip at bottom */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1"
              style={{
                background:
                  "linear-gradient(90deg, var(--brand-cool, #1FB6B6), var(--brand-primary))",
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom thin divider */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px"
        style={{ background: "rgba(10,23,76,0.08)" }}
      />
    </section>
  );
}
