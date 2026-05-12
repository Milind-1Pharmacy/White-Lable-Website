"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Container } from "@/components/layout/Container";
import { fadeUp, gsap, REDUCED_MOTION } from "@/lib/motion";
import type { MediaSplitSectionData } from "@/types/config.types";

type MediaSplitProps = {
  data: MediaSplitSectionData;
};

export function MediaSplit({ data }: MediaSplitProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const metaRef = useRef<HTMLParagraphElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const lineRef = useRef<SVGLineElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const trigger = sectionRef.current;
      if (headlineRef.current)
        fadeUp(headlineRef.current, { trigger, y: 40, duration: 0.85 });
      if (metaRef.current)
        fadeUp(metaRef.current, { trigger, y: 16, duration: 0.7, delay: 0.2 });
      if (imageRef.current)
        fadeUp(imageRef.current, { trigger, y: 30, duration: 0.85, delay: 0.2 });
      if (buttonRef.current && !REDUCED_MOTION) {
        gsap.from(buttonRef.current, {
          scale: 0,
          opacity: 0,
          duration: 0.6,
          ease: "back.out(1.7)",
          delay: 0.7,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 95%",
            once: true,
          },
        });
      }
      if (lineRef.current && !REDUCED_MOTION) {
        const total = lineRef.current.getTotalLength();
        lineRef.current.style.strokeDasharray = `${total}`;
        gsap.from(lineRef.current, {
          strokeDashoffset: total,
          duration: 0.6,
          delay: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 95%",
            once: true,
          },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (!data?.headline) return null;

  return (
    <section
      ref={sectionRef}
      id="media-split"
      className="relative py-20 sm:py-28 lg:py-36"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
          {/* Left */}
          <div className="relative lg:col-span-6">
            <h2
              ref={headlineRef}
              className="font-display text-[clamp(2.75rem,6.5vw,6rem)] font-bold uppercase leading-[0.92] tracking-[-0.025em] text-[var(--brand-primary)]"
            >
              {data.headline}
            </h2>
            {data.meta && (
              <p
                ref={metaRef}
                className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--brand-primary)]/50"
              >
                {data.meta}
              </p>
            )}

            {/* Decorative diagonal connector */}
            <svg
              aria-hidden
              className="pointer-events-none absolute right-0 top-full hidden h-32 w-32 lg:block"
              viewBox="0 0 120 120"
            >
              <line
                ref={lineRef}
                x1="0"
                y1="0"
                x2="120"
                y2="120"
                stroke="var(--brand-primary)"
                strokeOpacity="0.35"
                strokeWidth="1"
              />
            </svg>
          </div>

          {/* Right image */}
          <div
            ref={imageRef}
            className="relative lg:col-span-6 lg:mt-20"
          >
            <div
              className="relative aspect-[4/3] w-full"
              style={{ boxShadow: "8px 8px 0 rgba(10,23,76,0.15)" }}
            >
              <Image
                src={data.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Play"
                className="group absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <span className="relative inline-flex h-16 w-16 items-center justify-center">
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-[var(--brand-warm)]"
                  />
                  <span
                    aria-hidden
                    className="absolute -inset-[6px] rounded-full border border-white"
                  />
                  <svg
                    viewBox="0 0 16 16"
                    aria-hidden
                    className="relative h-5 w-5 translate-x-[1px] text-white"
                  >
                    <polygon points="3,2 13,8 3,14" fill="currentColor" />
                  </svg>
                </span>
              </button>

              {data.bottomRibbon && (
                <div className="absolute inset-x-0 bottom-0 bg-[var(--brand-warm)] py-1 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-white">
                  {data.bottomRibbon}
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>

      {open && data.videoSrc && (
        <div
          role="dialog"
          aria-modal
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="aspect-video w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video src={data.videoSrc} controls autoPlay className="h-full w-full bg-black" />
          </div>
        </div>
      )}
    </section>
  );
}
