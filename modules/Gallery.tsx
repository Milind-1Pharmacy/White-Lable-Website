"use client";
/**
 * @file Gallery.tsx
 * @description Renders a two-row image gallery with captions.
 * @responsibilities
 *  - Show optional eyebrow and heading.
 *  - Split images into two rows of up to three.
 *  - Render optional caption for each image.
 *  - Render nothing when no images are given.
 * @dependencies useIsMobile, RichHeading, config.types
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import { useIsMobile } from "@/lib/useIsMobile";
import type { GallerySectionData } from "@/types/config.types";
import { renderRichHeading } from "@/modules/RichHeading";

type GalleryProps = {
  data: GallerySectionData;
};

/**
 * Gallery - Shows business photos in two captioned rows.
 * @props {GallerySectionData} data - Gallery content from config.
 * @returns JSX element
 */
export function Gallery({ data }: GalleryProps) {
  const isMobile = useIsMobile();
  if (!data?.images?.length) return null;

  const heading = renderRichHeading(data.heading);
  const row1 = data.images.slice(0, 3);
  const row2 = data.images.slice(3, 6);

  return (
    <section className="section">
      <div className="wrap">
        {(data.eyebrow || heading) && (
          <div style={{ marginBottom: 40 }}>
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
                  minHeight: isMobile ? 64 : 108,
                  lineHeight: 1.1,
                }}
              >
                {heading}
              </h2>
            )}
          </div>
        )}
        {row1.length > 0 && (
          <div className="gallery__row">
            {row1.map((it, i) => (
              <div key={i} className="gallery__cell">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.src}
                  alt={it.alt ?? it.caption ?? ""}
                  style={{ objectFit: "cover" }}
                />
                {it.caption && (
                  <span className="gallery__cap">{it.caption}</span>
                )}
              </div>
            ))}
          </div>
        )}
        {row2.length > 0 && (
          <div className="gallery__row">
            {row2.map((it, i) => (
              <div key={i} className="gallery__cell">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.src} alt={it.alt ?? it.caption ?? ""} />
                {it.caption && (
                  <span className="gallery__cap">{it.caption}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
