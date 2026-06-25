"use client";

/**
 * @file Stats.tsx
 * @description Dark stats section with numbers that count up on scroll.
 * @responsibilities
 *  - Reveal each stat once it scrolls into view.
 *  - Animate numbers counting up to their target value.
 *  - Render nothing when no stat items exist.
 * @dependencies React hooks, IntersectionObserver, requestAnimationFrame
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */

import { useEffect, useRef, useState } from "react";
import type { StatsSectionData } from "@wl/config-types";

/**
 * useReveal - Reports when its element first scrolls into view.
 * @returns Tuple of element ref and a seen-once boolean
 */
function useReveal(): [React.RefObject<HTMLSpanElement | null>, boolean] {
  const ref = useRef<HTMLSpanElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(ref.current);
    // Fallback: if the observer never reports intersection (e.g. inside the
    // builder's static preview iframe, or content that never scrolls), reveal
    // anyway so the count lands on its final value instead of sticking at 0.
    const t = setTimeout(() => setSeen(true), 1200);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, []);
  return [ref, seen];
}

/**
 * fmtK - Formats large numbers as a "k" shorthand.
 * @param {number} n - The number to format.
 * @returns String like "12.3k" or the plain number
 */
function fmtK(n: number): string {
  if (n >= 1000) return Math.round(n / 100) / 10 + "k";
  return n.toString();
}

/**
 * AnimNum - Counts up to a value when scrolled into view, with suffix.
 * @props {number} value - Target number to count to.
 * @props {string} suffix - Optional accent suffix after the number.
 * @returns JSX element
 */
function AnimNum({ value, suffix }: { value: number; suffix?: string }) {
  const [ref, seen] = useReveal();
  const [n, setN] = useState(0);
  const isLarge = value >= 1000;

  useEffect(() => {
    if (!seen) return;
    const start = performance.now();
    const dur = 1600;
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, value]);

  return (
    <span ref={ref}>
      {isLarge ? fmtK(n) : n}
      {suffix && <em style={{ color: "var(--accent)" }}>{suffix}</em>}
    </span>
  );
}

type StatsProps = {
  data: StatsSectionData;
};

/**
 * Stats - Dark section header plus a grid of animated stat cells.
 * @props {StatsSectionData} data - Eyebrow, headline, descriptor, and items.
 * @returns JSX element
 */
export function Stats({ data }: StatsProps) {
  if (!data?.items?.length) return null;

  return (
    <section className="section section--ink" id="stats">
      <div className="wrap">
        {(data.eyebrow || data.headline || data.descriptor) && (
          <div
            className="between section-head"
            style={{ marginBottom: 56, alignItems: "end", flexWrap: "wrap" }}
          >
            <div>
              {data.eyebrow && (
                <span
                  className="eyebrow"
                  style={{ color: "rgba(244,239,230,.5)" }}
                >
                  <span
                    className="dot"
                    style={{ background: "var(--accent)" }}
                  />
                  {data.eyebrow}
                </span>
              )}
              {data.headline && (
                <h2
                  className="h-display h-2"
                  style={{
                    color: "var(--cream)",
                    marginTop: 14,
                    minHeight: 64,
                  }}
                >
                  {data.headline}
                </h2>
              )}
            </div>
            {data.descriptor && (
              <p
                className="body section-head__sub"
                style={{ color: "rgba(244,239,230,.62)" }}
              >
                {data.descriptor}
              </p>
            )}
          </div>
        )}
        <div
          className="stats__grid"
          style={{ borderColor: "rgba(244,239,230,.16)" }}
        >
          {data.items.map((s, i) => (
            <div
              key={i}
              className="stat-cell"
              style={{ borderColor: "rgba(244,239,230,.16)" }}
            >
              <span className="v" style={{ color: "var(--cream)" }}>
                <AnimNum value={parseInt(s.value)} suffix={s.suffix} />
              </span>
              <span className="l" style={{ color: "var(--cream)" }}>
                {s.label}
              </span>
              {s.footnote && <span className="f">{s.footnote}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
