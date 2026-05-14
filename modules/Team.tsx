"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { TeamSectionData } from "@/types/config.types";

const DEPTS = [
  {
    code: "01",
    count: 75,
    label: "Pharmacists",
    role: "Licensed dispensing",
    bg: "#F5A623",
    fg: "#1B2A5B",
    detail:
      "Registered with the Karnataka State Pharmacy Council. Every order reviewed.",
  },
  {
    code: "02",
    count: 25,
    label: "Doctors",
    role: "Consulting clinicians",
    bg: "#1FAFA6",
    fg: "#FFFFFF",
    detail:
      "On-call for prescription validation, refills and pharmacist escalations.",
  },
  {
    code: "03",
    count: 60,
    label: "Supply chain",
    role: "Sourcing & logistics",
    bg: "#6B3FA0",
    fg: "#FFFFFF",
    detail:
      "From manufacturer pickup to last-mile — batch-traceable end to end.",
  },
  {
    code: "04",
    count: 40,
    label: "Health guardians",
    role: "Customer support",
    bg: "#E5326C",
    fg: "#FFFFFF",
    detail:
      "Reachable in four languages, average first reply under nine minutes.",
  },
];

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

function AnimNum({ value }: { value: number }) {
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
  return <span ref={ref}>{n}</span>;
}

type TeamProps = {
  data: TeamSectionData;
};

export function Team({ data: _ }: TeamProps) {
  return (
    <section className="section section--cream" id="team">
      <div className="wrap">
        <div style={{ marginBottom: 56 }}>
          <span className="eyebrow">
            <span className="dot" />
            Our team of specialists · 200+ strong
          </span>
        </div>

        <div className="team2__quote">
          <span className="team2__mark">
            <Image src="/urmedz/logo.png" alt="" width={64} height={64} />
          </span>
          <p className="team2__pull" style={{ lineHeight: 1.2 }}>
            United by a single purpose — to make healthcare{" "}
            <span className="serif-it" style={{ color: "var(--accent)" }}>
              accessible, affordable
            </span>{" "}
            and
            <br />
            <span className="serif-it" style={{ color: "var(--accent)" }}>
              trustworthy
            </span>{" "}
            for everyone.
          </p>
          <div className="team2__sig">
            <span className="label">Signed,</span>
            <span
              className="serif-it"
              style={{ fontSize: 22, color: "var(--ink)" }}
            >
              the UrMedz team
            </span>
          </div>
        </div>

        <div className="team2__grid">
          {DEPTS.map((d, i) => (
            <div
              key={i}
              className="team2__cell"
              style={{ background: d.bg, color: d.fg }}
            >
              <div className="team2__cell-top">
                <span
                  className="mono"
                  style={{
                    fontSize: 11,
                    letterSpacing: ".14em",
                    opacity: 0.75,
                  }}
                >
                  {d.code} / 04
                </span>
                <span
                  className="mono"
                  style={{
                    fontSize: 11,
                    letterSpacing: ".14em",
                    opacity: 0.75,
                  }}
                >
                  {d.role}
                </span>
              </div>
              <div>
                <div className="team2__count">
                  <AnimNum value={d.count} />
                  <span className="serif-it" style={{ opacity: 0.7 }}>
                    +
                  </span>
                </div>
                <div className="team2__label">{d.label}</div>
              </div>
              <p className="team2__detail">{d.detail}</p>
            </div>
          ))}
        </div>

        <div className="team2__creds">
          <div className="team2__creds-item">
            <span className="label">Regulatory</span>
            <span>Drug Licence · KA-RX-001</span>
          </div>
          <div className="team2__creds-item">
            <span className="label">Quality</span>
            <span>ISO 9001:2015 audited</span>
          </div>
          <div className="team2__creds-item">
            <span className="label">Affiliations</span>
            <span>IPA · ASCRS · NABP-equiv.</span>
          </div>
          <div className="team2__creds-item">
            <span className="label">Care SLA</span>
            <span>Avg. reply &lt; 9 min · 4 languages</span>
          </div>
        </div>
      </div>
    </section>
  );
}
