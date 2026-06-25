"use client";

/**
 * @file VideoFeature.tsx
 * @description Poster-based video feature with overlay and scrolling marquee.
 * @responsibilities
 *  - Show a poster that swaps to video on play.
 *  - Render heading, tag, and CTA over the poster.
 *  - Render a looping marquee of words; skip when no data.
 * @dependencies React useState, renderRichHeading, config types
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */

import { useState } from "react";
import type { VideoFeatureSectionData } from "@wl/config-types";
import { renderRichHeading } from "@wl/render-engine/modules/RichHeading";
import { safeSrc } from "@wl/render-engine/lib/safeUrl";

type VideoFeatureProps = {
  data: VideoFeatureSectionData;
};

/**
 * VideoFeature - Poster, click-to-play video, overlay, and word marquee.
 * @props {VideoFeatureSectionData} data - Poster, video, heading, tag, CTA, marquee.
 * @returns JSX element
 */
export function VideoFeature({ data }: VideoFeatureProps) {
  const [playing, setPlaying] = useState(false);
  const words = data.marquee ?? [];
  const heading = renderRichHeading(data.heading);

  if (!data.poster && !data.videoUrl && !heading && words.length === 0) {
    return null;
  }

  return (
    <section className="section" id="fulfilment">
      <div className="wrap">
        <div className="bts">
          {!playing ? (
            <>
              {data.poster && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={safeSrc(data.poster)} alt={data.tag ?? ""} />
              )}
              <div className="bts__overlay">
                {data.tag && <span className="bts__tag">{data.tag}</span>}
                <div className="bts__bottom">
                  {heading && <h3 className="bts__headline">{heading}</h3>}
                  {data.videoUrl && data.ctaLabel && (
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
                      {data.ctaLabel}
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <video
              autoPlay
              controls
              src={safeSrc(data.videoUrl)}
              poster={data.poster}
              style={{ background: "#000" }}
            />
          )}
        </div>

        {words.length > 0 && (
          <div
            className="marquee"
            style={{
              marginTop: 40,
              paddingTop: 28,
              paddingBottom: 28,
              borderTop: "1px solid var(--line)",
              borderBottom: "1px solid var(--line)",
            }}
          >
            <div className="marquee__track">
              {[0, 1].map((g) => (
                <span key={g}>
                  {words.map((w, wi) => (
                    <span key={wi}>{w}</span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
