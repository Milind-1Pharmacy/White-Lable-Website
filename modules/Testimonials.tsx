"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Container } from "@/components/layout/Container";
import { REDUCED_MOTION, fadeUp, gsap, staggerCards } from "@/lib/motion";
import type { TestimonialsSectionData } from "@/types/config.types";

type TestimonialsProps = {
  data: TestimonialsSectionData;
};

export function Testimonials({ data }: TestimonialsProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const eyebrowRef = useRef<HTMLParagraphElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const activeRef = useRef<HTMLDivElement | null>(null);
  const stackRef = useRef<HTMLUListElement | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const trigger = sectionRef.current;
      if (eyebrowRef.current)
        fadeUp(eyebrowRef.current, { trigger, y: 14, duration: 0.7 });
      if (headingRef.current)
        fadeUp(headingRef.current, { trigger, y: 22, duration: 0.9, delay: 0.1 });
      if (stackRef.current) {
        const cards = stackRef.current.querySelectorAll<HTMLElement>("[data-mobile-quote]");
        if (cards.length)
          staggerCards(cards, { trigger: stackRef.current, stagger: 0.12, y: 24 });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!activeRef.current || REDUCED_MOTION) return;
    gsap.fromTo(
      activeRef.current,
      { opacity: 0, y: 12 },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: "power2.out",
        clearProps: "transform,opacity",
      },
    );
  }, [active]);

  if (!data?.items?.length) return null;
  const items = data.items;
  const current = items[Math.min(active, items.length - 1)];
  const eyebrow = data.eyebrow ?? "Testimony · 2026";
  const verticalLabel = eyebrow.toUpperCase();

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="relative py-24 sm:py-32 lg:py-40"
    >
      <Container>
        <div className="mb-14 max-w-2xl sm:mb-20">
          <p
            ref={eyebrowRef}
            className="mb-5 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.25em] text-[var(--brand-primary)]"
          >
            <span aria-hidden className="block h-px w-10 bg-[var(--brand-primary)]" />
            {eyebrow}
          </p>
          {data.heading ? (
            <h2
              ref={headingRef}
              className="font-display text-[clamp(2rem,4.5vw,3.75rem)] font-light leading-[1.05] tracking-tight text-[var(--brand-text)]"
            >
              {data.heading}
            </h2>
          ) : null}
        </div>

        {/* Desktop: single active quote + numbered stepper */}
        <div className="relative hidden lg:block">
          <span
            aria-hidden
            className="absolute -left-2 top-0 select-none font-display font-light leading-none text-[var(--brand-primary)]/12"
            style={{ fontSize: "12rem" }}
          >
            &ldquo;
          </span>
          <span
            aria-hidden
            className="absolute -left-8 top-2 select-none text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--brand-primary)]/40"
            style={{ writingMode: "vertical-rl" }}
          >
            {verticalLabel}
          </span>

          <div className="relative mx-auto max-w-[70%] pt-16">
            <div ref={activeRef} key={active} className="relative">
              <blockquote
                className="font-display font-light text-[var(--brand-ink)]"
                style={{ fontSize: "clamp(1.5rem, 2.4vw, 2.25rem)", lineHeight: 1.35 }}
              >
                {current.quote}
              </blockquote>
              <figcaption className="mt-10 flex items-center gap-5">
                {current.avatar ? (
                  <Image
                    src={current.avatar}
                    alt={current.name}
                    width={56}
                    height={56}
                    className="rounded-[2px] object-cover"
                  />
                ) : null}
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium uppercase tracking-[0.12em] text-[var(--brand-text)]">
                    {current.name}
                  </span>
                  <span className="mt-1 flex items-center gap-3 text-[13px] text-[var(--brand-text)]/60">
                    <span aria-hidden className="block h-px w-3 bg-[var(--brand-text)]/40" />
                    {current.role}
                  </span>
                </div>
              </figcaption>
            </div>

            <div className="mt-12 flex justify-end gap-6">
              {items.map((_, idx) => {
                const isActive = idx === active;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActive(idx)}
                    aria-pressed={isActive}
                    aria-label={`Show testimonial ${idx + 1}`}
                    className={`font-mono text-[13px] tracking-[0.2em] transition-colors ${
                      isActive
                        ? "text-[var(--brand-primary)]"
                        : "text-[var(--brand-text)]/35 hover:text-[var(--brand-text)]/70"
                    }`}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile: stacked list, hairline separators */}
        <ul ref={stackRef} className="lg:hidden">
          {items.map((item, idx) => (
            <li
              key={`${item.name}-${idx}`}
              data-mobile-quote
              className={`will-anim py-10 ${idx > 0 ? "border-t border-[color:color-mix(in_srgb,var(--brand-primary)_15%,transparent)]" : ""}`}
            >
              <p
                aria-hidden
                className="mb-4 font-mono text-[12px] tracking-[0.22em] text-[var(--brand-primary)]/40"
              >
                {String(idx + 1).padStart(2, "0")}
              </p>
              <blockquote
                className="font-display font-light text-[var(--brand-ink)]"
                style={{ fontSize: "clamp(1.25rem, 5vw, 1.75rem)", lineHeight: 1.4 }}
              >
                {item.quote}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-4">
                {item.avatar ? (
                  <Image
                    src={item.avatar}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="rounded-[2px] object-cover"
                  />
                ) : null}
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium uppercase tracking-[0.12em] text-[var(--brand-text)]">
                    {item.name}
                  </span>
                  <span className="mt-1 text-[12px] text-[var(--brand-text)]/60">
                    {item.role}
                  </span>
                </div>
              </figcaption>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
