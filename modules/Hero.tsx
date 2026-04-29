"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";
import { gsap, parallaxImage } from "@/lib/motion";
import type { HeroContent, Tenant } from "@/types/config.types";

type HeroProps = {
  content: HeroContent;
  tenant: Tenant;
};

export function Hero({ content, tenant }: HeroProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const eyebrowRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const taglineRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const proofRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);
  const innerImageRef = useRef<HTMLDivElement | null>(null);
  const blob1Ref = useRef<HTMLDivElement | null>(null);
  const blob2Ref = useRef<HTMLDivElement | null>(null);
  const blob3Ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (eyebrowRef.current) {
        tl.fromTo(
          eyebrowRef.current,
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7 },
          0,
        );
      }
      if (headlineRef.current) {
        tl.fromTo(
          headlineRef.current,
          { y: 32, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.1, delay: 0.1 },
          0,
        );
      }
      if (taglineRef.current) {
        tl.fromTo(
          taglineRef.current,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, delay: 0.4 },
          0,
        );
      }
      if (ctaRef.current) {
        tl.fromTo(
          ctaRef.current,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, delay: 0.7 },
          0,
        );
      }
      if (proofRef.current) {
        tl.fromTo(
          proofRef.current,
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, delay: 0.9 },
          0,
        );
      }

      if (innerImageRef.current && imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { clipPath: "inset(0 0 100% 0)", opacity: 1 },
          {
            clipPath: "inset(0 0 0% 0)",
            duration: 1.4,
            ease: "power4.out",
            delay: 0.2,
          },
        );
        parallaxImage(innerImageRef.current, {
          trigger: sectionRef.current,
          distance: 100,
        });
      }

      // Floating shapes — slow infinite drifts. Different durations & delays so they don't sync.
      const driftConfig = [
        { ref: blob1Ref, x: 60, y: 40, duration: 14 },
        { ref: blob2Ref, x: -50, y: 60, duration: 18 },
        { ref: blob3Ref, x: 40, y: -50, duration: 16 },
      ];
      driftConfig.forEach(({ ref, x, y, duration }) => {
        if (!ref.current) return;
        gsap.to(ref.current, {
          xPercent: x / 5,
          yPercent: y / 5,
          duration,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  if (!content?.headline && !content?.tagline) return null;
  const hasImage = Boolean(content.image);
  const hasProof = Array.isArray(content.proof) && content.proof.length > 0;

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* Floating organic shapes */}
      <div
        ref={blob1Ref}
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-32 -z-10 h-[36rem] w-[36rem] rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--brand-secondary) 70%, transparent), transparent 70%)",
        }}
      />
      <div
        ref={blob2Ref}
        aria-hidden
        className="pointer-events-none absolute -right-32 top-32 -z-10 h-[30rem] w-[30rem] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--brand-primary) 35%, transparent), transparent 70%)",
        }}
      />
      <div
        ref={blob3Ref}
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/3 -z-10 h-[28rem] w-[28rem] rounded-full opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--brand-accent) 30%, transparent), transparent 70%)",
        }}
      />

      {/* Subtle grain / mesh overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--brand-secondary) 8%, transparent) 100%)",
        }}
      />

      <Container className="py-20 sm:py-28 lg:py-32">
        <div
          className={cn(
            "grid items-center gap-10 lg:gap-14",
            hasImage ? "lg:grid-cols-12" : "",
          )}
        >
          <div
            className={cn(
              "relative",
              hasImage ? "lg:col-span-7" : "max-w-3xl",
            )}
          >
            {(content.eyebrow || tenant?.category) ? (
              <div ref={eyebrowRef} className="mb-6 flex items-center gap-3">
                <span
                  aria-hidden
                  className="block h-px w-10 bg-[var(--brand-primary)]"
                />
                <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--brand-primary)]">
                  {content.eyebrow ?? tenant.category}
                </p>
              </div>
            ) : null}

            {content.headline ? (
              <h1
                ref={headlineRef}
                className="font-display text-[clamp(2.5rem,6vw,5.25rem)] font-light leading-[1.02] tracking-tight text-[var(--brand-text)]"
              >
                {content.headline}
              </h1>
            ) : null}

            {content.tagline ? (
              <p
                ref={taglineRef}
                className="mt-7 max-w-xl text-base leading-relaxed text-[var(--brand-text)]/70 sm:text-lg"
              >
                {content.tagline}
              </p>
            ) : null}

            {(content.cta?.label || content.secondaryCta?.label) ? (
              <div ref={ctaRef} className="mt-10 flex flex-wrap items-center gap-3 sm:gap-4">
                {content.cta?.label ? (
                  <Link
                    href="/contact"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "group h-12 rounded-full bg-[var(--brand-primary)] px-7 text-sm font-medium tracking-wide text-white shadow-sm transition-all duration-300 hover:bg-[var(--brand-accent)] hover:shadow-lg",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {content.cta.label}
                      <span
                        aria-hidden
                        className="inline-block translate-x-0 transition-transform duration-300 group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </span>
                  </Link>
                ) : null}
                {content.secondaryCta?.label ? (
                  <Link
                    href={content.secondaryCta.href ?? "/about"}
                    className={cn(
                      buttonVariants({ size: "lg", variant: "outline" }),
                      "h-12 rounded-full border-[var(--brand-text)]/15 bg-transparent px-7 text-sm font-medium tracking-wide text-[var(--brand-text)] transition-all duration-300 hover:border-[var(--brand-text)]/30 hover:bg-[var(--brand-text)]/[0.04]",
                    )}
                  >
                    {content.secondaryCta.label}
                  </Link>
                ) : null}
              </div>
            ) : null}

            {hasProof ? (
              <div
                ref={proofRef}
                className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2"
              >
                {content.proof!.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="block h-1 w-1 rounded-full bg-[var(--brand-primary)]/60"
                    />
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--brand-text)]/55">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {hasImage ? (
            <div ref={imageRef} className="relative lg:col-span-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] shadow-2xl ring-1 ring-black/5 sm:aspect-[3/4] lg:aspect-[4/5]">
                <div ref={innerImageRef} className="absolute -inset-[6%]">
                  <Image
                    src={content.image as string}
                    alt={tenant?.name ? `${tenant.name} hero` : "Hero image"}
                    fill
                    priority
                    sizes="(min-width: 1024px) 42vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[var(--brand-text)]/20 via-transparent to-transparent"
                />

                {/* Editorial floating tag inside image — bottom-right */}
                <div className="pointer-events-none absolute bottom-5 right-5 hidden sm:block">
                  <div className="rounded-full border border-white/30 bg-white/15 px-4 py-2 shadow-lg backdrop-blur-md">
                    <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white drop-shadow">
                      Est. 2020
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
