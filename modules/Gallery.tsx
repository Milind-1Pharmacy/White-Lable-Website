"use client";
import { useIsMobile } from "@/lib/useIsMobile";
import type { GallerySectionData } from "@/types/config.types";

const CDN_IMAGES = [
  {
    src: "/urmedz/gallery/img-1.png",
    cap: "Retail stores",
  },
  {
    src: "/urmedz/gallery/img-2.png",
    cap: "Fulfilment centre",
  },
  {
    src: "/urmedz/gallery/img-3.png",
    cap: "Store floor",
  },
  {
    src: "/urmedz/gallery/img-1.png",
    cap: "Quick commerce",
  },
  {
    src: "/urmedz/gallery/img-2.png",
    cap: "Brand options",
  },
  {
    src: "/urmedz/gallery/img-3.png",
    cap: "Dispensing",
  },
];

type GalleryProps = {
  data: GallerySectionData;
};

export function Gallery({ data }: GalleryProps) {
  // Use config images if provided, but fall back to CDN if local paths don't load
  const configImages = data.images?.length
    ? data.images.map((img) => ({
        src: img.src,
        cap: img.caption ?? img.alt ?? "",
      }))
    : [];
  const images = configImages.length ? configImages : CDN_IMAGES;

  const row1 = images.slice(0, 3);
  const row2 = images.slice(3, 6);
  const isMobile = useIsMobile();
  return (
    <section className="section">
      <div className="wrap">
        <div style={{ marginBottom: 40 }}>
          {data.eyebrow && (
            <span className="eyebrow">
              <span className="dot" />
              {data.eyebrow}
            </span>
          )}
          <h2
            className="h-display h-2"
            style={{
              marginTop: 14,
              maxWidth: 720,
              minHeight: isMobile ? 64 : 108,
              lineHeight: 1.1,
            }}
          >
            {data.heading ? (
              data.heading
            ) : (
              <>
                From the store to the{" "}
                <span className="serif-it">fulfilment floor.</span>
              </>
            )}
          </h2>
        </div>
        {row1.length > 0 && (
          <div className="gallery__row">
            {row1.map((it, i) => (
              <div key={i} className="gallery__cell">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.src} alt={it.cap} style={{ objectFit: "cover" }} />
                {it.cap && <span className="gallery__cap">{it.cap}</span>}
              </div>
            ))}
          </div>
        )}
        {row2.length > 0 && (
          <div className="gallery__row">
            {row2.map((it, i) => (
              <div key={i} className="gallery__cell">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.src} alt={it.cap} />
                {it.cap && <span className="gallery__cap">{it.cap}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
