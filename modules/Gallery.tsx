import type { GallerySectionData } from "@/types/config.types";

const CDN_IMAGES = [
  { src: "https://www.urmedz.in/wp-content/uploads/2024/12/banners_final-03-1jpg.jpg", cap: "Retail stores" },
  { src: "https://www.urmedz.in/wp-content/uploads/2024/11/video.jpg", cap: "Fulfilment centre" },
  { src: "https://www.urmedz.in/wp-content/uploads/2025/08/shopn.png", cap: "Store floor" },
  { src: "https://www.urmedz.in/wp-content/uploads/2024/10/banners-new.jpg", cap: "Quick commerce" },
  { src: "https://www.urmedz.in/wp-content/uploads/2024/12/img.jpg", cap: "Brand options" },
  { src: "https://www.urmedz.in/wp-content/uploads/2024/10/bnr2-2.jpg", cap: "Dispensing" },
];

type GalleryProps = {
  data: GallerySectionData;
};

export function Gallery({ data }: GalleryProps) {
  // Use config images if provided, but fall back to CDN if local paths don't load
  const configImages = data.images?.length
    ? data.images.map((img) => ({ src: img.src, cap: img.caption ?? img.alt ?? "" }))
    : [];
  const images = configImages.length ? configImages : CDN_IMAGES;

  const row1 = images.slice(0, 3);
  const row2 = images.slice(3, 6);

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
          <h2 className="h-display h-2" style={{ marginTop: 14 }}>
            {data.heading
              ? data.heading
              : <>From the store to the <span className="serif-it">fulfilment floor.</span></>
            }
          </h2>
        </div>
        {row1.length > 0 && (
          <div className="gallery__row">
            {row1.map((it, i) => (
              <div key={i} className="gallery__cell">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.src} alt={it.cap} />
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
