"use client";

/**
 * @file AIStore.tsx
 * @description Capability showcase for the AI/platform section. An asymmetric grid
 *  of capability cards — each a media tile with a numbered, technical caption block
 *  (status dot · tag · title · description) over a gradient scrim. Video tiles keep
 *  the click-to-play behaviour. Replaces the old flat 2-up tag-chip grid that left
 *  dead space and carried no copy. Collapses to a swipeable slider on mobile via the
 *  shared MobileCarousel.
 * @responsibilities
 *  - Render an editorial header (eyebrow · serif heading · lede).
 *  - Lay tiles into a capability grid; the first tile leads (wide).
 *  - Overlay each tile with a numbered, technical caption.
 *  - Click-to-play for video tiles; render nothing when no tiles configured.
 * @dependencies React useState, renderRichHeading, config types, MobileCarousel
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-06-24
 */

import { useState } from "react";
import type { AIStoreSectionData, AIStoreTile } from "@/types/config.types";
import { renderRichHeading } from "@/modules/RichHeading";
import { safeSrc } from "@/lib/safeUrl";
import { MobileCarousel } from "@/components/common/MobileCarousel";

type AIStoreProps = {
  data: AIStoreSectionData;
};

/** Two-digit, 1-based index label (01, 02, …). */
function idx(n: number): string {
  return String(n + 1).padStart(2, "0");
}

/**
 * Tile - One capability card: media + scrim + numbered technical caption. Video
 * tiles show a poster with a play button that swaps to the playing <video>.
 * `lead` makes it the wide feature card.
 */
function Tile({
  tile,
  i,
  lead = false,
}: {
  tile: AIStoreTile;
  i: number;
  lead?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const hasMeta = tile.tag || tile.title || tile.description;

  return (
    <article className={"ais__tile" + (lead ? " ais__tile--lead" : "")}>
      {tile.videoUrl && playing ? (
        <video className="ais__media" autoPlay controls src={safeSrc(tile.videoUrl)} />
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="ais__media" src={safeSrc(tile.image)} alt={tile.alt ?? tile.title ?? ""} />
          <span className="ais__scrim" aria-hidden="true" />
          <span className="ais__corner">
            <span className="ais__num">{idx(i)}</span>
            <span className="ais__live">
              <span className="ais__live-dot" />
              live
            </span>
          </span>
          {tile.videoUrl && (
            <button className="ais__play" onClick={() => setPlaying(true)} aria-label="Play video" />
          )}
          {hasMeta && (
            <div className="ais__meta">
              {tile.tag && <span className="ais__tag">{tile.tag}</span>}
              {tile.title && <span className="ais__title">{tile.title}</span>}
              {tile.description && <span className="ais__desc">{tile.description}</span>}
            </div>
          )}
        </>
      )}
    </article>
  );
}

/**
 * AIStore - Capability showcase: header + asymmetric grid of capability cards.
 * @props {AIStoreSectionData} data - Eyebrow, heading, lede, and tiles.
 * @returns JSX element
 */
export function AIStore({ data }: AIStoreProps) {
  if (!data?.tiles || data.tiles.length === 0) return null;

  const heading = renderRichHeading(data.heading);
  const [lead, ...rest] = data.tiles;

  return (
    <section className="section ais" id="ai-store">
      <div className="wrap">
        {(data.eyebrow || heading || data.lede) && (
          <header className="ais__head">
            <div className="ais__head-main">
              {data.eyebrow && (
                <span className="eyebrow">
                  <span className="dot" />
                  {data.eyebrow}
                </span>
              )}
              {heading && <h2 className="h-display h-2 ais__heading">{heading}</h2>}
            </div>
            {data.lede && <p className="ais__lede">{data.lede}</p>}
          </header>
        )}

        {/* Desktop: asymmetric capability grid (lead card wide, rest beside it). */}
        <div className="ais__grid m-desktop-only">
          {lead && <Tile tile={lead} i={0} lead />}
          {rest.map((tile, i) => (
            <Tile key={i + 1} tile={tile} i={i + 1} />
          ))}
        </div>

        {/* Mobile: same cards as a swipeable slider (shared MobileCarousel). */}
        <MobileCarousel
          className="ais__carousel"
          ariaLabel="Platform capabilities"
          cardWidth="82%"
          maxCardWidth={340}
          gap={14}
          edgePadding={24}
        >
          {data.tiles.map((tile, i) => (
            <Tile key={i} tile={tile} i={i} />
          ))}
        </MobileCarousel>
      </div>
    </section>
  );
}
