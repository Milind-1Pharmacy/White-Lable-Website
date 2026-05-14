"use client";

import { useState } from "react";
import type { AIStoreSectionData, AIStoreTile } from "@/types/config.types";
import { renderRichHeading } from "@/modules/RichHeading";

type AIStoreProps = {
  data: AIStoreSectionData;
};

function Tile({ tile }: { tile: AIStoreTile }) {
  const [playing, setPlaying] = useState(false);
  const tagStyle: React.CSSProperties = {
    background: tile.tagBg ?? "rgba(255,255,255,.92)",
    color: tile.tagColor ?? "var(--ink)",
  };
  const wrapperStyle: React.CSSProperties = tile.background
    ? { background: tile.background }
    : {};

  if (tile.videoUrl) {
    return (
      <div className="split__tile" style={wrapperStyle}>
        {!playing ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tile.image}
              alt={tile.alt ?? ""}
              style={{ opacity: 0.55 }}
            />
            <button
              className="play-btn"
              onClick={() => setPlaying(true)}
              aria-label="Play video"
            />
            {tile.tag && (
              <span className="imgbox__tag" style={tagStyle}>
                {tile.tag}
              </span>
            )}
          </>
        ) : (
          <video autoPlay controls src={tile.videoUrl} />
        )}
      </div>
    );
  }

  return (
    <div className="split__tile" style={wrapperStyle}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={tile.image} alt={tile.alt ?? ""} />
      {tile.tag && (
        <span className="imgbox__tag" style={tagStyle}>
          {tile.tag}
        </span>
      )}
    </div>
  );
}

export function AIStore({ data }: AIStoreProps) {
  if (!data?.tiles || data.tiles.length === 0) return null;

  const heading = renderRichHeading(data.heading);

  return (
    <section className="section">
      <div className="wrap">
        {(data.eyebrow || heading || data.lede) && (
          <div className="split__head">
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
                  style={{ marginTop: 14, minHeight: 80, lineHeight: 1.1 }}
                >
                  {heading}
                </h2>
              )}
            </div>
            {data.lede && (
              <p className="body" style={{ maxWidth: 380, margin: 0 }}>
                {data.lede}
              </p>
            )}
          </div>
        )}
        <div className="split__grid">
          {data.tiles.map((tile, i) => (
            <Tile key={i} tile={tile} />
          ))}
        </div>
      </div>
    </section>
  );
}
