"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { HeroContent } from "@/types/config.types";

const HERO_SLIDES = [
  {
    img: "https://www.urmedz.in/wp-content/uploads/2024/12/banners_final-03-1jpg.jpg",
    tag: "Authentic · Traceable",
    cap: "Authentic medicines at your fingertips",
  },
  {
    img: "https://www.urmedz.in/wp-content/uploads/2024/10/banners-new.jpg",
    tag: "Quick commerce",
    cap: "Same-day delivery, neighbourhood-fast",
  },
  {
    img: "https://www.urmedz.in/wp-content/uploads/2024/10/bnr2-2.jpg",
    tag: "Hi-tech fulfilment",
    cap: "India's most advanced pharma centres",
  },
];

type HeroProps = {
  data: HeroContent;
};

export function Hero({ data }: HeroProps) {
  const [i, setI] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(
      () => setI((v) => (v + 1) % HERO_SLIDES.length),
      5500,
    );
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const go = (n: number) => {
    if (timer.current) clearInterval(timer.current);
    setI((n + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  return (
    <section className="hero wrap" id="top">
      <div className="hero__grid">
        <div className="hero__copy">
          <div className="row" style={{ gap: 14 }}>
            <span className="eyebrow">
              <span className="dot" />
              {data.eyebrow ?? "Pharmacy & Health-Tech · Est. 2024"}
            </span>
          </div>

          <h1 className="hero__h">
            Authentic
            <br />
            medicines, <em style={{ letterSpacing: 1.2 }}>fingertip-</em>
            fast.
          </h1>

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
                href={data.secondaryCta.href ?? "/services"}
              >
                {data.secondaryCta.label}
              </Link>
            )}
          </div>

          <div className="hero__meta">
            <div className="stack">
              <span className="num">
                25
                <em
                  style={{
                    color: "var(--accent)",
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                  }}
                >
                  +
                </em>
              </span>
              <span className="lbl">Retail stores across South India</span>
            </div>
            <div className="stack">
              <span className="num">
                10k
                <em
                  style={{
                    color: "var(--accent)",
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                  }}
                >
                  {" "}
                  / day
                </em>
              </span>
              <span className="lbl">
                Orders dispensed by licensed pharmacists
              </span>
            </div>
            <div className="stack">
              <span className="num">80k</span>
              <span className="lbl">SKUs — medicines, OTC &amp; wellness</span>
            </div>
          </div>
        </div>

        <div className="hero__media">
          {HERO_SLIDES.map((s, idx) => (
            <div
              key={idx}
              className={"slide" + (idx === i ? " is-active" : "")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.img} alt={s.cap} />
              <div className="overlay" />
            </div>
          ))}
          <span className="badge">
            <span className="dot" style={{ background: "var(--accent)" }} />
            {HERO_SLIDES[i].tag}
          </span>
          <div className="arr">
            <button aria-label="Previous" onClick={() => go(i - 1)}>
              ‹
            </button>
            <button aria-label="Next" onClick={() => go(i + 1)}>
              ›
            </button>
          </div>
          <div className="dots">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                aria-label={"Slide " + (idx + 1)}
                className={idx === i ? "is-active" : ""}
                onClick={() => go(idx)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="hero__rail" style={{ marginTop: 56 }}>
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
          Live
        </span>
        <span className="body-s">
          Now serving Bengaluru &amp; Hyderabad. Pin-code check in the app.
        </span>
        <span className="sep" />
        <span className="row" style={{ gap: 6 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "#F5A623",
            }}
          />
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "#6B3FA0",
            }}
          />
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "#1FAFA6",
            }}
          />
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "#E5326C",
            }}
          />
        </span>
        <span
          className="body-s mono"
          style={{ fontSize: 12, letterSpacing: ".06em" }}
        >
          RX-001 · DRG-LIC-KA · ISO 9001:2015
        </span>
      </div>
    </section>
  );
}
