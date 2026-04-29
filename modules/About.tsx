"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";
import { fadeUp, gsap, imageReveal, parallaxImage } from "@/lib/motion";
import type { AboutContent, Tenant } from "@/types/config.types";

type AboutProps = {
  content: AboutContent;
  tenant: Tenant;
};

export function About({ content, tenant }: AboutProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const eyebrowRef = useRef<HTMLParagraphElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const bodyRef = useRef<HTMLParagraphElement | null>(null);
  const imageWrapRef = useRef<HTMLDivElement | null>(null);
  const imageInnerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const trigger = sectionRef.current;
      if (eyebrowRef.current) {
        fadeUp(eyebrowRef.current, { trigger, y: 16, duration: 0.7 });
      }
      if (headingRef.current) {
        fadeUp(headingRef.current, { trigger, y: 24, duration: 0.9, delay: 0.1 });
      }
      if (bodyRef.current) {
        fadeUp(bodyRef.current, { trigger, y: 16, duration: 0.9, delay: 0.25 });
      }
      if (imageWrapRef.current) {
        imageReveal(imageWrapRef.current, { trigger });
      }
      if (imageInnerRef.current) {
        parallaxImage(imageInnerRef.current, { trigger, distance: 80 });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (!content?.description) return null;
  const hasImage = Boolean(content.image);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative py-24 sm:py-32 lg:py-40"
    >
      <Container>
        <div
          className={cn(
            "grid items-center gap-12 lg:gap-20",
            hasImage ? "lg:grid-cols-12" : "",
          )}
        >
          <div className={cn(hasImage ? "lg:col-span-5" : "max-w-3xl")}>
            <p
              ref={eyebrowRef}
              className="mb-5 text-xs font-medium uppercase tracking-[0.25em] text-[var(--brand-primary)]"
            >
              About us
            </p>
            <h2
              ref={headingRef}
              className="font-display text-[clamp(2rem,4.5vw,3.75rem)] font-light leading-[1.05] tracking-tight text-[var(--brand-text)]"
            >
              About {tenant.name}
            </h2>
            <p
              ref={bodyRef}
              className="mt-8 text-lg leading-relaxed text-[var(--brand-text)]/75"
            >
              {content.description}
            </p>
          </div>
          {hasImage ? (
            <div
              ref={imageWrapRef}
              className="lg:col-span-7 will-anim"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.75rem] shadow-xl ring-1 ring-black/5 sm:aspect-[3/2]">
                <div ref={imageInnerRef} className="absolute -inset-[6%]">
                  <Image
                    src={content.image as string}
                    alt={tenant?.name ? `Inside ${tenant.name}` : "About image"}
                    fill
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
