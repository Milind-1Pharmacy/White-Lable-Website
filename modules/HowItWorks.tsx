"use client";

import { useEffect, useRef } from "react";

import { Container } from "@/components/layout/Container";
import { fadeUp, gsap, staggerCards } from "@/lib/motion";
import type { HowItWorksSectionData } from "@/types/config.types";

type HowItWorksProps = {
  data: HowItWorksSectionData;
};

export function HowItWorks({ data }: HowItWorksProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const eyebrowRef = useRef<HTMLParagraphElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const stepsRef = useRef<HTMLOListElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const trigger = sectionRef.current;
      if (eyebrowRef.current)
        fadeUp(eyebrowRef.current, { trigger, y: 14, duration: 0.7 });
      if (headingRef.current)
        fadeUp(headingRef.current, { trigger, y: 22, duration: 0.9, delay: 0.1 });
      if (stepsRef.current) {
        const steps = stepsRef.current.querySelectorAll<HTMLElement>("[data-step]");
        if (steps.length) {
          staggerCards(steps, { trigger: stepsRef.current, stagger: 0.15, y: 32 });
        }
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (!data?.steps?.length) return null;

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="py-24 sm:py-32 lg:py-40"
    >
      <Container>
        <div className="mb-14 max-w-2xl sm:mb-20">
          <p
            ref={eyebrowRef}
            className="mb-5 text-xs font-medium uppercase tracking-[0.25em] text-[var(--brand-primary)]"
          >
            How it works
          </p>
          <h2
            ref={headingRef}
            className="font-display text-[clamp(2rem,4.5vw,3.75rem)] font-light leading-[1.05] tracking-tight text-[var(--brand-text)]"
          >
            {data.heading ?? "Getting started"}
          </h2>
        </div>
        <ol
          ref={stepsRef}
          className="relative grid gap-12 sm:grid-cols-3 sm:gap-8"
        >
          <div
            aria-hidden
            className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-[var(--brand-primary)]/25 to-transparent sm:block"
          />
          {data.steps.map((step) => (
            <li
              key={step.step}
              data-step
              className="relative will-anim"
            >
              <div className="relative mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full border border-[var(--brand-primary)]/20 bg-[var(--brand-background)] text-base font-medium text-[var(--brand-primary)] shadow-sm">
                <span className="font-display text-xl font-light">
                  {step.step}
                </span>
              </div>
              <h3 className="font-display text-2xl font-light tracking-tight text-[var(--brand-text)]">
                {step.title}
              </h3>
              <p className="mt-3 max-w-sm text-base leading-relaxed text-[var(--brand-text)]/70">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
