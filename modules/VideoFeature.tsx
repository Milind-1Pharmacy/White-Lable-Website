"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Container } from "@/components/layout/Container";
import { fadeUp, gsap, REDUCED_MOTION } from "@/lib/motion";
import type { VideoFeatureSectionData } from "@/types/config.types";

type VideoFeatureProps = {
  data: VideoFeatureSectionData;
};

export function VideoFeature({ data }: VideoFeatureProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stackRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!sectionRef.current || !stackRef.current) return;
    const ctx = gsap.context(() => {
      const trigger = sectionRef.current;
      const items = stackRef.current!.querySelectorAll<HTMLElement>(
        "[data-vf-item]",
      );
      items.forEach((el, i) => {
        fadeUp(el, { trigger, y: 22, duration: 0.8, delay: i * 0.12 });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (!data?.headline) return null;

  return (
    <section
      ref={sectionRef}
      id="video-feature"
      className="relative isolate min-h-[70vh] overflow-hidden"
      style={{ maxHeight: 720 }}
    >
      <Image
        src={data.poster}
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
        priority={false}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(10,23,76,0.65) 0%, rgba(10,23,76,0.15) 100%)",
        }}
      />

      {/* Top marquee strip */}
      {data.marquee && (
        <div className="absolute inset-x-0 top-0 z-10 h-7 overflow-hidden border-y border-white/20">
          <div
            className="flex h-full items-center whitespace-nowrap font-mono text-[11px] tracking-[0.2em] text-white/70"
            style={{
              animation: REDUCED_MOTION
                ? undefined
                : "vf-marquee 36s linear infinite",
            }}
          >
            <span className="px-6">{data.marquee}</span>
            <span className="px-6">{data.marquee}</span>
            <span className="px-6">{data.marquee}</span>
          </div>
        </div>
      )}

      <Container className="relative z-10 flex h-full min-h-[70vh] flex-col justify-end py-20 sm:py-28">
        <div ref={stackRef}>
          {data.tag && (
            <p
              data-vf-item
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--brand-warm)]"
            >
              {data.tag}
            </p>
          )}
          <h2
            data-vf-item
            className="mt-4 max-w-[18ch] font-display text-[clamp(2.5rem,5.5vw,5rem)] font-bold uppercase leading-[0.95] tracking-tight text-white"
          >
            {data.headline}
          </h2>

          <button
            data-vf-item
            type="button"
            onClick={() => setOpen(true)}
            className="mt-7 inline-flex items-center gap-4 text-white"
          >
            <span className="relative inline-flex h-11 w-11 items-center justify-center">
              <span
                aria-hidden
                className="absolute inset-0 rounded-full bg-[var(--brand-warm)]"
              />
              <span
                aria-hidden
                className="absolute -inset-[6px] rounded-full border border-white/80"
                style={{
                  animation: REDUCED_MOTION
                    ? undefined
                    : "vf-ring 12s linear infinite",
                }}
              />
              <svg
                viewBox="0 0 16 16"
                aria-hidden
                className="relative h-3.5 w-3.5 translate-x-[1px] text-white"
              >
                <polygon points="3,2 13,8 3,14" fill="currentColor" />
              </svg>
            </span>
            <span className="text-[14px] font-semibold uppercase tracking-[0.18em]">
              {data.ctaLabel ?? "Watch Now"}
            </span>
          </button>
        </div>
      </Container>

      {open && data.videoSrc && (
        <div
          role="dialog"
          aria-modal
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute right-6 top-6 text-white"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
          <div
            className="aspect-video w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={data.videoSrc}
              controls
              autoPlay
              className="h-full w-full bg-black"
            />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes vf-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-33.333%);
          }
        }
        @keyframes vf-ring {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </section>
  );
}
