"use client";

/**
 * @file Hero.tsx
 * @description Renders the hero section with auto-rotating image slides.
 * @responsibilities
 *  - Show headline, tagline, CTAs, and metric stats.
 *  - Auto-advance slides and allow manual arrow/dot control.
 *  - Render an optional info rail below the grid.
 *  - Degrade gracefully when slides or fields are missing.
 * @dependencies react, next/link, RichHeading, config.types
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { HeroContent, HeroSlide } from "@/types/config.types";
import { renderRichHeading } from "@/modules/RichHeading";
import { safeHref, safeSrc } from "@/lib/safeUrl";

type HeroProps = {
  data: HeroContent;
};

/**
 * Hero - Top section with copy, CTAs, and a rotating image slider.
 * @props {HeroContent} data - Hero content from config.
 * @returns JSX element
 */
export function Hero({ data }: HeroProps) {
  const slides: HeroSlide[] =
    data.slides && data.slides.length > 0
      ? data.slides
      : data.image
        ? [{ image: data.image }]
        : [];

  const [i, setI] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (slides.length <= 1) return;
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(
      () => setI((v) => (v + 1) % slides.length),
      5500,
    );
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [slides.length]);

  /**
   * Jumps to a slide index, wrapping around and stopping auto-rotation.
   */
  const go = (n: number) => {
    if (timer.current) clearInterval(timer.current);
    if (slides.length === 0) return;
    setI((n + slides.length) % slides.length);
  };

  const richHeadline = renderRichHeading(data.headlineRich);

  return (
    <section className="hero wrap" id="top">
      <div className="hero__grid">
        <div className="hero__copy">
          {data.eyebrow && (
            <div className="row" style={{ gap: 14 }}>
              <span className="eyebrow">
                <span className="dot" />
                {data.eyebrow}
              </span>
            </div>
          )}

          <h1 className="hero__h">{richHeadline ?? data.headline}</h1>

          <p className="body-l" style={{ maxWidth: 540 }}>
            {data.tagline}
          </p>

          <div className="row" style={{ gap: 12 }}>
            <Link className="btn btn-primary" href="/contact">
              {data.cta.label} <span style={{ marginLeft: 4 }}>→</span>
            </Link>
            {data.secondaryCta && (
              <Link
                className="btn btn-ghost"
                href={safeHref(data.secondaryCta.href, "/services")}
              >
                {data.secondaryCta.label}
              </Link>
            )}
          </div>

          {data.meta && data.meta.length > 0 && (
            <div className="hero__meta">
              {data.meta.map((m, idx) => (
                <div key={idx} className="stack">
                  <span className="num">
                    {m.value}
                    {m.suffix && (
                      <em
                        style={{
                          color: "var(--accent)",
                          fontFamily: "var(--font-display)",
                          fontStyle: "italic",
                        }}
                      >
                        {m.suffix}
                      </em>
                    )}
                  </span>
                  <span className="lbl">{m.label}</span>
                </div>
              ))}
            </div>
          )}

        </div>

        {slides.length > 0 && (
          <div className="hero__media">
            {slides.map((s, idx) => (
              <div
                key={idx}
                className={"slide" + (idx === i ? " is-active" : "")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={safeSrc(s.image)} alt={s.caption ?? ""} />
                <div className="overlay" />
              </div>
            ))}
            {slides[i]?.tag && (
              <span className="badge">
                <span className="dot" style={{ background: "var(--accent)" }} />
                {slides[i].tag}
              </span>
            )}
            {slides.length > 1 && (
              <>
                <div className="arr">
                  <button aria-label="Previous" onClick={() => go(i - 1)}>
                    ‹
                  </button>
                  <button aria-label="Next" onClick={() => go(i + 1)}>
                    ›
                  </button>
                </div>
                <div className="dots">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      aria-label={"Slide " + (idx + 1)}
                      className={idx === i ? "is-active" : ""}
                      onClick={() => go(idx)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {data.rail &&
        (data.rail.liveLabel ||
          data.rail.locationText ||
          data.rail.badgeText ||
          (data.rail.badgeColors && data.rail.badgeColors.length > 0)) && (
          <div className="hero__rail" style={{ marginTop: 56 }}>
            {data.rail.liveLabel && (
              <span className="pill">
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: "var(--accent)",
                    display: "inline-block",
                    marginRight: 4,
                  }}
                />
                {data.rail.liveLabel}
              </span>
            )}
            {data.rail.locationText && (
              <span className="body-s">{data.rail.locationText}</span>
            )}
            <span className="sep" />
            {data.rail.badgeColors && data.rail.badgeColors.length > 0 && (
              <span className="row" style={{ gap: 6 }}>
                {data.rail.badgeColors.map((c, idx) => (
                  <span
                    key={idx}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: c,
                    }}
                  />
                ))}
              </span>
            )}
            {data.rail.badgeText && (
              <span
                className="body-s mono"
                style={{ fontSize: 12, letterSpacing: ".06em" }}
              >
                {data.rail.badgeText}
              </span>
            )}
          </div>
        )}
    </section>
  );
}
