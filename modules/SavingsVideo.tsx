"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Container } from "@/components/layout/Container";
import { fadeUp, gsap, REDUCED_MOTION } from "@/lib/motion";
import type { SavingsVideoSectionData } from "@/types/config.types";

type SavingsVideoProps = {
  data: SavingsVideoSectionData;
};

export function SavingsVideo({ data }: SavingsVideoProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headlineRef = useRef<HTMLDivElement | null>(null);
  const barsRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      if (headlineRef.current)
        fadeUp(headlineRef.current, { trigger: sectionRef.current!, y: 24, duration: 0.85 });

      if (imageRef.current)
        fadeUp(imageRef.current, { trigger: sectionRef.current!, y: 30, duration: 0.9, delay: 0.15 });

      // Animate progress bars on scroll
      if (!REDUCED_MOTION && barsRef.current) {
        const fills = barsRef.current.querySelectorAll<HTMLElement>("[data-bar-fill]");
        fills.forEach((fill) => {
          const target = Number(fill.dataset.barFill ?? 0);
          gsap.from(fill, {
            width: "0%",
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: fill,
              start: "top 88%",
            },
            onStart: () => {
              gsap.to(fill, { width: `${target}%`, duration: 1.1, ease: "power3.out" });
            },
          });
          gsap.set(fill, { width: "0%" });
          gsap.to(fill, {
            width: `${target}%`,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: { trigger: fill, start: "top 88%" },
          });
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (!data?.title) return null;

  return (
    <>
      <section
        ref={sectionRef}
        id="savings-video"
        className="relative overflow-hidden py-20 sm:py-28"
        style={{ background: "var(--brand-primary)" }}
      >
        {/* Subtle diagonal line texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, white 0px, white 1px, transparent 1px, transparent 40px)",
          }}
        />

        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

            {/* Left — text + stat bars */}
            <div ref={headlineRef}>
              {data.statsTitle && (
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className="block h-[2px] w-8"
                    style={{ background: "var(--brand-warm, #E63950)" }}
                    aria-hidden
                  />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
                    {data.statsTitle}
                  </span>
                </div>
              )}

              <h2 className="font-display text-[clamp(1.75rem,4vw,3rem)] font-bold leading-[1.1] tracking-[-0.02em] text-white">
                {data.title}
              </h2>

              {data.description && (
                <p className="mt-5 max-w-[42ch] text-sm leading-relaxed text-white/60 sm:text-base">
                  {data.description}
                </p>
              )}

              {data.statsSubtitle && (
                <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
                  {data.statsSubtitle}
                </p>
              )}

              {/* Progress bars */}
              {data.stats && data.stats.length > 0 && (
                <div ref={barsRef} className="mt-5 space-y-5">
                  {data.stats.map((stat, i) => (
                    <div key={i}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[13px] font-medium text-white/80">
                          {stat.name}
                        </span>
                        <span
                          className="text-[13px] font-bold tabular-nums"
                          style={{ color: "var(--brand-warm, #E63950)" }}
                        >
                          {stat.percentage}%
                        </span>
                      </div>
                      <div
                        className="h-1.5 w-full overflow-hidden rounded-full"
                        style={{ background: "rgba(255,255,255,0.1)" }}
                      >
                        <div
                          data-bar-fill={stat.percentage}
                          className="h-full rounded-full"
                          style={{
                            width: REDUCED_MOTION ? `${stat.percentage}%` : "0%",
                            background: `linear-gradient(90deg, var(--brand-warm, #E63950), color-mix(in srgb, var(--brand-warm, #E63950) 60%, white))`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right — video poster */}
            <div ref={imageRef} className="relative">
              <div className="group relative cursor-pointer overflow-hidden rounded-2xl shadow-[0_32px_80px_-20px_rgba(0,0,0,0.5)]">
                {/* Poster image */}
                <div className="relative aspect-video w-full">
                  {data.videoPoster ? (
                    <Image
                      src={data.videoPoster}
                      alt="Video preview"
                      fill
                      sizes="(min-width: 1024px) 48vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-white/5" />
                  )}
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                </div>

                {/* Play button */}
                {data.videoSrc && (
                  <button
                    type="button"
                    onClick={() => setVideoOpen(true)}
                    aria-label="Play video"
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div
                      className="relative flex h-16 w-16 items-center justify-center rounded-full shadow-xl transition-transform duration-300 group-hover:scale-110"
                      style={{ background: "var(--brand-warm, #E63950)" }}
                    >
                      {/* Pulse ring */}
                      <span
                        className="absolute inset-0 rounded-full opacity-40"
                        style={{
                          animation: "ping 2s cubic-bezier(0,0,0.2,1) infinite",
                          background: "var(--brand-warm, #E63950)",
                        }}
                      />
                      <svg
                        viewBox="0 0 24 24"
                        className="ml-1 h-6 w-6"
                        fill="white"
                        aria-hidden
                      >
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    </div>
                  </button>
                )}
              </div>

              {/* Floating stat badge */}
              <div
                className="absolute -bottom-4 -right-4 hidden rounded-xl px-5 py-4 shadow-xl sm:block"
                style={{ background: "var(--brand-warm, #E63950)" }}
              >
                <p className="font-display text-2xl font-bold text-white">
                  {data.stats?.[0]?.percentage ?? 46}%
                </p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
                  avg. savings
                </p>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* Video modal */}
      {videoOpen && data.videoSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setVideoOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={data.videoSrc}
              controls
              autoPlay
              className="w-full"
            />
            <button
              type="button"
              onClick={() => setVideoOpen(false)}
              aria-label="Close video"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </>
  );
}
