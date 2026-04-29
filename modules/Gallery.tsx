"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { Container } from "@/components/layout/Container";
import { fadeUp, gsap, parallaxImage, staggerCards } from "@/lib/motion";
import type { GallerySectionData } from "@/types/config.types";

type GalleryProps = {
  data: GallerySectionData;
};

// Deterministic editorial layouts that always tile cleanly.
// Keyed by image count (3, 4, 5, 6+). Each entry is a Tailwind class string
// that defines the tile's span and aspect on lg breakpoints.
const LAYOUTS: Record<number, string[]> = {
  3: [
    "lg:col-span-7 aspect-[4/3]",
    "lg:col-span-5 aspect-[4/3]",
    "lg:col-span-12 aspect-[16/7]",
  ],
  4: [
    "lg:col-span-7 lg:row-span-2 aspect-[4/5] lg:aspect-auto",
    "lg:col-span-5 aspect-[5/3]",
    "lg:col-span-5 aspect-[5/3]",
    "lg:col-span-12 aspect-[16/7]",
  ],
  5: [
    "lg:col-span-7 lg:row-span-2 aspect-[4/5] lg:aspect-auto",
    "lg:col-span-5 aspect-[5/3]",
    "lg:col-span-5 aspect-[5/3]",
    "lg:col-span-6 aspect-[4/3]",
    "lg:col-span-6 aspect-[4/3]",
  ],
  6: [
    "lg:col-span-8 aspect-[16/9]",
    "lg:col-span-4 aspect-[4/5]",
    "lg:col-span-4 aspect-[4/5]",
    "lg:col-span-4 aspect-[4/5]",
    "lg:col-span-4 aspect-[4/5]",
    "lg:col-span-12 aspect-[21/9]",
  ],
};

function spanFor(total: number, index: number): string {
  const layout = LAYOUTS[Math.min(total, 6)] ?? LAYOUTS[6];
  return layout[index] ?? "lg:col-span-6 aspect-[4/3]";
}

export function Gallery({ data }: GalleryProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const eyebrowRef = useRef<HTMLParagraphElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const introRef = useRef<HTMLParagraphElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const trigger = sectionRef.current;
      if (eyebrowRef.current)
        fadeUp(eyebrowRef.current, { trigger, y: 14, duration: 0.7 });
      if (headingRef.current)
        fadeUp(headingRef.current, { trigger, y: 22, duration: 0.9, delay: 0.1 });
      if (introRef.current)
        fadeUp(introRef.current, { trigger, y: 16, duration: 0.8, delay: 0.25 });
      if (gridRef.current) {
        const tiles = gridRef.current.querySelectorAll<HTMLElement>("[data-tile]");
        if (tiles.length) {
          staggerCards(tiles, { trigger: gridRef.current, stagger: 0.08, y: 28 });
        }
        const innerImages = gridRef.current.querySelectorAll<HTMLElement>("[data-tile-img]");
        innerImages.forEach((img, idx) => {
          parallaxImage(img, {
            trigger: img.parentElement,
            distance: 24 + (idx % 3) * 16,
          });
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (!data?.images?.length) return null;
  const total = data.images.length;

  return (
    <section
      ref={sectionRef}
      id="gallery"
      className="relative py-24 sm:py-32 lg:py-40"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--brand-secondary) 10%, transparent) 50%, transparent 100%)",
        }}
      />
      <Container>
        <div className="mb-12 grid gap-10 sm:mb-16 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <p
              ref={eyebrowRef}
              className="mb-5 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--brand-primary)]"
            >
              <span aria-hidden className="block h-px w-10 bg-[var(--brand-primary)]" />
              {data.eyebrow ?? "Inside the studio"}
            </p>
            <h2
              ref={headingRef}
              className="font-display text-[clamp(2rem,4.5vw,3.75rem)] font-light leading-[1.05] tracking-tight text-[var(--brand-text)]"
            >
              {data.heading ?? "A glimpse inside"}
            </h2>
          </div>
          <div className="lg:col-span-5 lg:pt-4">
            <p
              ref={introRef}
              className="text-base leading-relaxed text-[var(--brand-text)]/65 sm:text-lg"
            >
              Light, air, and quiet — every corner of our studio is shaped to
              help you arrive, settle, and breathe a little deeper.
            </p>
          </div>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-12 lg:gap-5"
        >
          {data.images.map((img, idx) => {
            const span = spanFor(total, idx);
            return (
              <figure
                key={`${img.src}-${idx}`}
                data-tile
                className={`group relative overflow-hidden rounded-2xl bg-[var(--brand-text)]/5 ring-1 ring-black/5 will-anim ${span}`}
              >
                <div data-tile-img className="absolute -inset-[6%]">
                  <Image
                    src={img.src}
                    alt={img.alt ?? ""}
                    fill
                    sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]"
                  />
                </div>
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/65 via-black/25 to-transparent"
                />
                {img.caption ? (
                  <figcaption className="absolute inset-x-5 bottom-5 flex items-center gap-3">
                    <span
                      aria-hidden
                      className="block h-px w-6 bg-white/70"
                    />
                    <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-white drop-shadow">
                      {img.caption}
                    </span>
                  </figcaption>
                ) : null}
              </figure>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
