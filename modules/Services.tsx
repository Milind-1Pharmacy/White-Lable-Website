"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { Container } from "@/components/layout/Container";
import { fadeUp, gsap, staggerCards } from "@/lib/motion";
import type { ServiceItem } from "@/types/config.types";

type ServicesProps = {
  items: ServiceItem[];
  heading?: string;
  eyebrow?: string;
};

export function Services({
  items,
  heading = "What we offer",
  eyebrow = "Services",
}: ServicesProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const eyebrowRef = useRef<HTMLParagraphElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const trigger = sectionRef.current;
      if (eyebrowRef.current)
        fadeUp(eyebrowRef.current, { trigger, y: 14, duration: 0.7 });
      if (headingRef.current)
        fadeUp(headingRef.current, { trigger, y: 22, duration: 0.9, delay: 0.1 });
      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll<HTMLElement>("[data-service-card]");
        if (cards.length) {
          staggerCards(cards, { trigger: gridRef.current, stagger: 0.1, y: 36 });
        }
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (!items?.length) return null;

  return (
    <section
      ref={sectionRef}
      id="services"
      className="py-24 sm:py-32 lg:py-40"
    >
      <Container>
        <div className="mb-14 max-w-2xl sm:mb-20">
          <p
            ref={eyebrowRef}
            className="mb-5 text-xs font-medium uppercase tracking-[0.25em] text-[var(--brand-primary)]"
          >
            {eyebrow}
          </p>
          <h2
            ref={headingRef}
            className="font-display text-[clamp(2rem,4.5vw,3.75rem)] font-light leading-[1.05] tracking-tight text-[var(--brand-text)]"
          >
            {heading}
          </h2>
        </div>
        <div
          ref={gridRef}
          className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:gap-x-10 lg:gap-y-20"
        >
          {items.map((item, idx) => (
            <article
              key={`${item.title}-${idx}`}
              data-service-card
              className="group relative will-anim"
            >
              {item.image ? (
                <div className="relative mb-6 aspect-[5/4] w-full overflow-hidden rounded-2xl ring-1 ring-black/5">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 45vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.05]"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                </div>
              ) : null}
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-2xl font-light tracking-tight text-[var(--brand-text)] sm:text-3xl">
                  {item.title}
                </h3>
                <span
                  aria-hidden
                  className="font-display text-sm font-light tabular-nums tracking-wider text-[var(--brand-accent)]/55"
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="mt-3 max-w-md text-base leading-relaxed text-[var(--brand-text)]/70">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
