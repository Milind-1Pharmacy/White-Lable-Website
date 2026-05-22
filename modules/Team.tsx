"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type {
  Branding,
  TeamDepartment,
  TeamSectionData,
} from "@/types/config.types";
import { renderRichHeading } from "@/modules/RichHeading";
import { MobileCarousel } from "@/components/common/MobileCarousel";

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

function renderCell(d: TeamDepartment, i: number, total: number) {
  return (
    <div
      key={i}
      className="team2__cell"
      style={{ background: d.bg, color: d.fg }}
    >
      <div className="team2__cell-top">
        <span
          className="mono"
          style={{ fontSize: 11, letterSpacing: ".14em", opacity: 0.75 }}
        >
          {d.code} / {String(total).padStart(2, "0")}
        </span>
        <span
          className="mono"
          style={{ fontSize: 11, letterSpacing: ".14em", opacity: 0.75 }}
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
  );
}

type TeamProps = {
  data: TeamSectionData;
  branding?: Branding;
};

export function Team({ data, branding }: TeamProps) {
  const departments = data?.departments ?? [];
  const credentials = data?.credentials ?? [];
  const quote = renderRichHeading(data?.quote);

  if (
    !data?.eyebrow &&
    !quote &&
    departments.length === 0 &&
    credentials.length === 0
  ) {
    return null;
  }

  const mark = data?.logoMark ?? branding?.logo;
  const total = departments.length;

  return (
    <section className="section section--cream" id="team">
      <div className="wrap">
        {data.eyebrow && (
          <div style={{ marginBottom: 56 }}>
            <span className="eyebrow">
              <span className="dot" />
              {data.eyebrow}
            </span>
          </div>
        )}

        {(quote || data.signature) && (
          <div className="team2__quote">
            {mark && (
              <span className="team2__mark">
                <Image src={mark} alt="" width={64} height={64} />
              </span>
            )}
            {quote && (
              <p className="team2__pull" style={{ lineHeight: 1.2 }}>
                {quote}
              </p>
            )}
            {data.signature && (
              <div className="team2__sig">
                {data.signatureLabel && (
                  <span className="label">{data.signatureLabel}</span>
                )}
                <span
                  className="serif-it"
                  style={{ fontSize: 22, color: "var(--ink)" }}
                >
                  {data.signature}
                </span>
              </div>
            )}
          </div>
        )}

        {departments.length > 0 && (
          <>
            <div className="team2__grid m-desktop-only">
              {departments.map((d, i) => renderCell(d, i, total))}
            </div>
            <MobileCarousel
              ariaLabel="Our team"
              cardWidth="84%"
              maxCardWidth={360}
              gap={14}
              edgePadding={24}
            >
              {departments.map((d, i) => renderCell(d, i, total))}
            </MobileCarousel>
          </>
        )}

        {credentials.length > 0 && (
          <div className="team2__creds">
            {credentials.map((c, i) => (
              <div key={i} className="team2__creds-item">
                <span className="label">{c.label}</span>
                <span>{c.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
