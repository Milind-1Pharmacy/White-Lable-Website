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
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current || !gridRef.current) return;
    const ctx = gsap.context(() => {
      const cards = gridRef.current!.querySelectorAll<HTMLElement>("[data-service-card]");
      if (cards.length)
        staggerCards(cards, { trigger: gridRef.current, stagger: 0.09, y: 28 });
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
          ref={gridRef}
          className="grid sm:grid-cols-2 lg:grid-cols-4"
        >
          {data.items.map((item, i) => (
            <article
              key={item.slug}
              id={item.slug}
              data-service-card
              className="group relative flex flex-col overflow-hidden rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-12px_rgba(10,23,76,0.18)] sm:p-8"
              style={{
                background: i % 2 === 0
                  ? "color-mix(in srgb, var(--brand-primary) 4%, var(--brand-background))"
                  : "var(--brand-background)",
                border: "1px solid color-mix(in srgb, var(--brand-primary) 10%, transparent)",
              }}
            >
              {/* Number */}
              <span
                className="font-mono text-[10px] font-bold uppercase tracking-[0.25em]"
                style={{ color: "color-mix(in srgb, var(--brand-primary) 30%, transparent)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Icon */}
              <div
                className="mt-5 flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-300"
                style={{
                  background: "color-mix(in srgb, var(--brand-primary) 8%, transparent)",
                  color: "var(--brand-primary)",
                }}
              >
                <span className="block h-8 w-8">
                  <IconFor name={item.icon ?? item.slug} />
                </span>
              </div>

              {/* Content */}
              <h3 className="mt-5 text-[15px] font-bold leading-snug tracking-tight text-[var(--brand-primary)]">
                {item.title}
              </h3>
              <p className="mt-2.5 flex-1 text-[13px] leading-relaxed text-[var(--brand-primary)]/60">
                {item.description}
              </p>

              {item.footnote && (
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--brand-primary)]/40">
                  {item.footnote}
                </p>
              )}

              {/* Hover accent line */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[3px] origin-left scale-x-0 rounded-b-2xl transition-transform duration-300 group-hover:scale-x-100"
                style={{ background: "var(--brand-warm, #E63950)" }}
                aria-hidden
              />
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
