"use client";

import { useEffect, useRef, useState } from "react";
import type { SavingsSectionData } from "@/types/config.types";

function useReveal(): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
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
    return () => io.disconnect();
  }, []);
  return [ref, seen];
}

function AnimNum({
  value,
  fmt,
}: {
  value: number;
  fmt?: (n: number) => string;
}) {
  const [ref, seen] = useReveal();
  const [n, setN] = useState(0);
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
  return <span ref={ref}>{fmt ? fmt(n) : n}</span>;
}

function SavingsRow({
  row,
}: {
  row: {
    name: string;
    cat: string;
    brandPrice: number;
    ourPrice: number;
    pct: number;
    color?: string;
  };
}) {
  const [ref, seen] = useReveal();
  const color = row.color ?? "var(--accent)";
  return (
    <div className="sv__row" ref={ref}>
      <div className="sv__row-l">
        <span
          className="mono"
          style={{ fontSize: 11, letterSpacing: ".14em", color: "var(--mute)" }}
        >
          {row.cat}
        </span>
        <span className="sv__row-name">{row.name}</span>
      </div>
      <div className="sv__row-ladder">
        <div className="sv__price sv__price--brand">
          <span className="sv__price-tag">Branded</span>
          <span className="sv__price-amt">
            ₹<AnimNum value={row.brandPrice} />
          </span>
        </div>
        <div className="sv__row-arrow">
          <span className="sv__arrow-line" />
          <span className="sv__arrow-pct" style={{ background: color }}>
            <AnimNum value={row.pct} />% saved
          </span>
        </div>
        <div className="sv__price sv__price--ours">
          <span className="sv__price-tag">UrMedz pick</span>
          <span className="sv__price-amt">
            ₹<AnimNum value={row.ourPrice} />
          </span>
        </div>
      </div>
      <div className="sv__row-bar">
        <div className="sv__row-bar-track">
          <div
            className="sv__row-bar-fill"
            style={{
              width: seen ? row.pct + "%" : 0,
              background: color,
              transition: "width 1.2s cubic-bezier(.4,0,.2,1)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

type SavingsProps = {
  data: SavingsSectionData;
};

export function Savings({ data }: SavingsProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="section section--cream">
      <div className="wrap">
        <div
          className="between section-head"
          style={{ marginBottom: 40, alignItems: "end", flexWrap: "wrap" }}
        >
          <div>
            <span className="eyebrow">
              <span className="dot" />
              {data.eyebrow ?? "Customer savings · Q1 2026"}
            </span>
            <h2
              className="h-display h-2"
              style={{
                marginTop: 14,
                maxWidth: 760,
                minHeight: 108,
                lineHeight: 1.1,
              }}
            >
              Unraveling the magic of{" "}
              <span className="serif-it" style={{ color: "var(--accent)" }}>
                brand options
              </span>{" "}
              in medicines.
            </h2>
          </div>
          <p className="body section-head__sub">
            Prices vary dramatically from brand to brand, yet the composition
            stays identical. The UrMedz engine surfaces the optimal pick for
            every prescription.
          </p>
        </div>

        <div className="sv__ledger">
          <div className="sv__ledger-head">
            <span className="label">Receipt no. URM-SV-2026Q1</span>
            <span className="label">Avg. saving across 80,000 SKUs</span>
            <span className="sv__ledger-tag">
              <span
                className="serif-it"
                style={{ fontSize: 30, color: "var(--accent)", lineHeight: 1 }}
              >
                59%
              </span>
              <span
                className="mono"
                style={{
                  fontSize: 10.5,
                  letterSpacing: ".14em",
                  color: "var(--mute)",
                }}
              >
                avg.
              </span>
            </span>
          </div>
          {data.items.map((row, idx) => (
            <SavingsRow key={idx} row={row} />
          ))}
          <div className="sv__ledger-foot">
            <span
              className="mono"
              style={{ fontSize: 11, letterSpacing: ".14em" }}
            >
              * Indicative for a 30-day pack. Actual savings vary by
              composition, strength &amp; location.
            </span>
          </div>
        </div>

        {data.videoUrl && (
          <div className="sv__video">
            {!playing ? (
              <>
                {data.videoPoster && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.videoPoster} alt="Brand options unraveled" />
                )}
                <div className="sv__video-overlay">
                  <span
                    className="imgbox__tag"
                    style={{
                      background: "rgba(255,255,255,.92)",
                      color: "var(--ink)",
                    }}
                  >
                    ▶ 2:14 · How brand options work
                  </span>
                  <div className="sv__video-bottom">
                    <h3
                      className="bts__headline"
                      style={{ color: "#fff", maxWidth: 600 }}
                    >
                      See it on the pharmacy floor.
                    </h3>
                    <button
                      className="btn btn-accent"
                      onClick={() => setPlaying(true)}
                    >
                      <span
                        style={{
                          width: 0,
                          height: 0,
                          borderLeft: "10px solid currentColor",
                          borderTop: "7px solid transparent",
                          borderBottom: "7px solid transparent",
                          marginRight: 2,
                        }}
                      />
                      Watch the demo
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <video
                controls
                autoPlay
                src={data.videoUrl}
                poster={data.videoPoster}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
