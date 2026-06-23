"use client";

/**
 * @file AIStore.tsx
 * @description Split-grid section of image and video tiles with tags.
 * @responsibilities
 *  - Render heading, eyebrow, and lede from config.
 *  - Show image tiles or click-to-play video tiles.
 *  - Render nothing when no tiles are configured.
 * @dependencies React useState, renderRichHeading, config types
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */

import { useState } from "react";
import type { AIStoreSectionData, AIStoreTile } from "@/types/config.types";
import { renderRichHeading } from "@/modules/RichHeading";
import { safeSrc } from "@/lib/safeUrl";

type AIStoreProps = {
  data: AIStoreSectionData;
};

/**
 * Tile - Shows one image tile, or a poster that swaps to video on play.
 * @props {AIStoreTile} tile - Tile image, optional video, tag, and colors.
 * @returns JSX element
 */
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
              src={safeSrc(tile.image)}
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
          <video autoPlay controls src={safeSrc(tile.videoUrl)} />
        )}
      </div>
    );
  }

  return (
    <div className="split__tile" style={wrapperStyle}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={safeSrc(tile.image)} alt={tile.alt ?? ""} />
      {tile.tag && (
        <span className="imgbox__tag" style={tagStyle}>
          {tile.tag}
        </span>
      )}
    </div>
  );
}

/**
 * AIStore - Section header plus a grid of image and video tiles.
 * @props {AIStoreSectionData} data - Eyebrow, heading, lede, and tiles.
 * @returns JSX element
 */
export function AIStore({ data }: AIStoreProps) {
  if (!data?.tiles || data.tiles.length === 0) return null;

  const heading = renderRichHeading(data.heading);

  return (
    <section className="section" id="ai-store">
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
