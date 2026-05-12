"use client";

import { useEffect, useRef } from "react";

import { Container } from "@/components/layout/Container";
import { gsap, staggerCards } from "@/lib/motion";
import type { ServicesIconRowSectionData } from "@/types/config.types";

type ServicesIconRowProps = {
  data: ServicesIconRowSectionData;
};

function IconFor({ name }: { name?: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "retail":
      return (
        <svg viewBox="0 0 48 48" {...common}>
          <path d="M8 18l2-6h28l2 6" />
          <rect x="8" y="18" width="32" height="22" />
          <rect x="20" y="26" width="8" height="14" />
          <path d="M12 22h6M30 22h6" />
        </svg>
      );
    case "quick-commerce":
      return (
        <svg viewBox="0 0 48 48" {...common}>
          <path d="M6 10h6l4 22h22l4-16H16" />
          <circle cx="18" cy="40" r="2.5" />
          <circle cx="36" cy="40" r="2.5" />
        </svg>
      );
    case "fulfillment":
      return (
        <svg viewBox="0 0 48 48" {...common}>
          <rect x="6" y="20" width="14" height="14" />
          <rect x="20" y="14" width="14" height="20" />
          <rect x="34" y="22" width="8" height="12" />
          <path d="M6 38h36" />
        </svg>
      );
    case "ecommerce":
      return (
        <svg viewBox="0 0 48 48" {...common}>
          <rect x="6" y="8" width="24" height="34" rx="3" />
          <path d="M10 14h16M10 20h16M10 26h10" />
          <path d="M32 28l6-2 2 12-8 2-2-10z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 48 48" {...common}>
          <circle cx="24" cy="24" r="14" />
          <path d="M16 24h16M24 16v16" />
        </svg>
      );
  }
}

export function ServicesIconRow({ data }: ServicesIconRowProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current || !rowRef.current) return;
    const ctx = gsap.context(() => {
      const cards = rowRef.current!.querySelectorAll<HTMLElement>(
        "[data-service-card]",
      );
      if (cards.length)
        staggerCards(cards, { trigger: rowRef.current, stagger: 0.09, y: 24 });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (!data?.items?.length) return null;

  return (
    <section
      ref={sectionRef}
      id="services-row"
      className="relative py-16 sm:py-24"
    >
      <Container>
        <div
          ref={rowRef}
          className="grid border-y border-[var(--brand-primary)]/12 sm:grid-cols-2 lg:grid-cols-4"
        >
          {data.items.map((item, i) => (
            <article
              key={item.slug}
              id={item.slug}
              data-service-card
              className="group relative flex min-h-[280px] flex-col p-7 sm:min-h-[320px] sm:p-9 lg:[&:not(:last-child)]:border-r lg:[&:not(:last-child)]:border-[var(--brand-primary)]/12"
            >
              <span className="font-mono text-[10px] tracking-[0.2em] text-[var(--brand-primary)]/40">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-[14px] font-bold uppercase tracking-[0.16em] text-[var(--brand-warm)]">
                {item.title}
              </h3>
              <p className="mt-3 max-w-[28ch] flex-1 text-[14px] leading-[1.55] text-[var(--brand-primary)]/70">
                {item.description}
              </p>
              <div className="mt-6 flex items-end justify-between">
                <span
                  aria-hidden
                  className="block h-12 w-12 text-[var(--brand-warm)]"
                >
                  <IconFor name={item.icon ?? item.slug} />
                </span>
                {item.footnote && (
                  <span className="font-mono text-[10px] tracking-[0.18em] text-[var(--brand-primary)]/50">
                    {item.footnote}
                  </span>
                )}
              </div>

              {/* Hover/active bar */}
              <span
                aria-hidden
                className="absolute -bottom-px left-0 right-0 h-[2px] origin-center scale-x-0 bg-[var(--brand-warm)] transition-transform duration-300 group-hover:scale-x-100"
              />
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
