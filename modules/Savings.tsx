"use client";

import { useEffect, useRef, useState } from "react";
import type { SavingsSectionData } from "@/types/config.types";
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

function SavingsCard({
  row,
  index,
}: {
  row: {
    name: string;
    cat: string;
    ourPrice?: number;
    pct: number;
    color?: string;
  };
  index: number;
}) {
  const [ref, seen] = useReveal();
  const color = row.color ?? "var(--accent)";
  return (
    <article
      className={"sv-card" + (seen ? " is-seen" : "")}
      ref={ref}
      style={{
        ["--card-accent" as string]: color,
        ["--card-delay" as string]: `${index * 80}ms`,
      }}
    >
      <h3 className="sv-card__title">{row.name}</h3>
      <div className="sv-card__meta">
        <span className="sv-card__badge" aria-label={`${row.pct}% lower`}>
          <span className="sv-card__badge-num">{row.pct}</span>
          <span className="sv-card__badge-sym" aria-hidden="true">%</span>
        </span>
        <span className="sv-card__label mono">vs. brand average</span>
      </div>
    </article>
  );
}

type SavingsProps = {
  data: SavingsSectionData;
};

export function Savings({ data }: SavingsProps) {
  const [playing, setPlaying] = useState(false);
  if (!data?.items?.length) return null;

  const heading = renderRichHeading(data.heading);
  const ledger = data.ledger;
  const video = data.videoCopy;

  return (
    <section className="section section--cream">
      <div className="wrap">
        {(data.eyebrow || heading || data.lede) && (
          <div
            className="between section-head"
            style={{ marginBottom: 40, alignItems: "end", flexWrap: "wrap" }}
          >
            <div>
              {data.eyebrow && (
                <span className="eyebrow">
                  <span className="dot" />
                  {data.eyebrow}
                </span>
              )}
              {heading && (
                <h2
                  className="h-display h-2"
                  style={{
                    marginTop: 14,
                    maxWidth: 760,
                    minHeight: 108,
                    lineHeight: 1.1,
                  }}
                >
                  {heading}
                </h2>
              )}
            </div>
            {data.lede && <p className="body section-head__sub">{data.lede}</p>}
          </div>
        )}

        {ledger &&
          (ledger.receiptLabel ||
            ledger.averageLabel ||
            ledger.averageValue) && (
            <div className="sv-meta">
              {ledger.receiptLabel && (
                <span className="sv-meta__label mono">
                  {ledger.receiptLabel}
                </span>
              )}
              {ledger.averageLabel && (
                <span className="sv-meta__label mono">
                  {ledger.averageLabel}
                </span>
              )}
              {ledger.averageValue && (
                <span className="sv-meta__tag">
                  <span
                    className="serif-it"
                    style={{
                      fontSize: 30,
                      color: "var(--accent)",
                      lineHeight: 1,
                    }}
                  >
                    {ledger.averageValue}
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
              )}
            </div>
          )}

        <div className="sv-grid m-desktop-only">
          {data.items.map((row, idx) => (
            <SavingsCard key={idx} row={row} index={idx} />
          ))}
        </div>
        <MobileCarousel
          ariaLabel="Sample savings"
          cardWidth="86%"
          maxCardWidth={360}
          gap={14}
          edgePadding={24}
        >
          {data.items.map((row, idx) => (
            <SavingsCard key={idx} row={row} index={idx} />
          ))}
        </MobileCarousel>

        {ledger?.footnote && <p className="sv-foot mono">{ledger.footnote}</p>}

        {data.videoUrl && (
          <div className="sv__video">
            {!playing ? (
              <>
                {data.videoPoster && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.videoPoster} alt={video?.headline ?? ""} />
                )}
                <div className="sv__video-overlay">
                  {video?.tag && (
                    <span
                      className="imgbox__tag"
                      style={{
                        background: "rgba(255,255,255,.92)",
                        color: "var(--ink)",
                      }}
                    >
                      {video.tag}
                    </span>
                  )}
                  <div className="sv__video-bottom">
                    {video?.headline && (
                      <h3
                        className="bts__headline"
                        style={{ color: "#fff", maxWidth: 600 }}
                      >
                        {video.headline}
                      </h3>
                    )}
                    {video?.ctaLabel && (
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
                        {video.ctaLabel}
                      </button>
                    )}
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
