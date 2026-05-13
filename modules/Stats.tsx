"use client";

import { useEffect, useRef, useState } from "react";
import type { StatsSectionData } from "@/types/config.types";

function useReveal(): [React.RefObject<HTMLSpanElement | null>, boolean] {
  const ref = useRef<HTMLSpanElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } },
      { threshold: 0.25 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, seen];
}

function fmtK(n: number): string {
  if (n >= 1000) return (Math.round(n / 100) / 10) + "k";
  return n.toString();
}

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

export function Stats({ data }: StatsProps) {
  return (
    <section className="section section--ink">
      <div className="wrap">
        <div className="between section-head" style={{ marginBottom: 56, alignItems: "end", flexWrap: "wrap" }}>
          <div>
            <span className="eyebrow" style={{ color: "rgba(244,239,230,.5)" }}>
              <span className="dot" style={{ background: "var(--accent)" }} />
              {data.eyebrow ?? "By the numbers"}
            </span>
            {data.headline && (
              <h2 className="h-display h-2" style={{ color: "var(--cream)", marginTop: 14 }}>{data.headline}</h2>
            )}
          </div>
          <p className="body section-head__sub" style={{ color: "rgba(244,239,230,.62)" }}>
            A pharmacy-and-platform footprint sized for the country, built quietly in the background.
          </p>
        </div>
        <div className="stats__grid" style={{ borderColor: "rgba(244,239,230,.16)" }}>
          {data.items.map((s, i) => (
            <div key={i} className="stat-cell" style={{ borderColor: "rgba(244,239,230,.16)" }}>
              <span className="v" style={{ color: "var(--cream)" }}>
                <AnimNum value={parseInt(s.value)} suffix={s.suffix} />
              </span>
              <span className="l" style={{ color: "var(--cream)" }}>{s.label}</span>
              {s.footnote && (
                <span className="f">{s.footnote}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
