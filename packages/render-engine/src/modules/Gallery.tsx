"use client";
/**
 * @file Gallery.tsx
 * @description Editorial mosaic gallery. An asymmetric magazine-style grid: a tall
 *  feature frame alongside a stack of secondary frames, each with a numbered,
 *  editorial caption block (kicker · title · description) revealed over a gradient
 *  scrim on hover. Replaces the old flat two-row image grid that left dead space.
 * @responsibilities
 *  - Show an editorial header (eyebrow · serif heading · lede · frame counter).
 *  - Lay images into a mosaic: index 0 is the tall feature, the rest stack/wrap.
 *  - Overlay each frame with a numbered caption that reveals on hover/focus.
 *  - Render nothing when no images are given.
 * @dependencies RichHeading, config.types, safeSrc
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-06-24
 */
import type { GalleryImage, GallerySectionData } from "@wl/config-types";
import { renderRichHeading } from "@wl/render-engine/modules/RichHeading";
import { safeSrc } from "@wl/render-engine/lib/safeUrl";
import { MobileCarousel } from "@wl/render-engine/components/common/MobileCarousel";

type GalleryProps = {
  data: GallerySectionData;
};

/** Two-digit, 1-based index label (01, 02, …) for the editorial frame counter. */
function idx(n: number): string {
  return String(n + 1).padStart(2, "0");
}

/**
 * One mosaic frame: image + gradient scrim + numbered editorial caption.
 * `feature` makes it the tall lead frame; otherwise it's a standard cell.
 */
function Frame({
  it,
  i,
  feature = false,
}: {
  it: GalleryImage;
  i: number;
  feature?: boolean;
}) {
  const hasMeta = it.caption || it.title || it.description;
  const src = safeSrc(it.src);
  return (
    <figure className={"egal__frame" + (feature ? " egal__frame--feature" : "")}>
      {/* Only render the <img> with a real src — an empty src triggers a full
          page re-download warning and shows a broken image while editing. */}
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="egal__img"
          src={src}
          alt={it.alt ?? it.title ?? it.caption ?? ""}
        />
      ) : (
        <span className="egal__img egal__img--empty" aria-hidden="true" />
      )}
      <span className="egal__scrim" aria-hidden="true" />
      <span className="egal__num">{idx(i)}</span>
      {hasMeta && (
        <figcaption className="egal__meta">
          {it.caption && <span className="egal__kicker">{it.caption}</span>}
          {it.title && <span className="egal__title">{it.title}</span>}
          {it.description && <span className="egal__desc">{it.description}</span>}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * Gallery - Editorial mosaic of business photos with rich, revealed captions.
 * @props {GallerySectionData} data - Gallery content from config.
 * @returns JSX element
 */
export function Gallery({ data }: GalleryProps) {
  if (!data?.images?.length) return null;

  const heading = renderRichHeading(data.heading);
  const [feature, ...rest] = data.images;
  const total = data.images.length;

  return (
    <section className="section egal" id="gallery">
      <div className="wrap">
        {(data.eyebrow || heading || data.lede) && (
          <header className="egal__head">
            <div className="egal__head-main">
              {data.eyebrow && (
                <span className="eyebrow">
                  <span className="dot" />
                  {data.eyebrow}
                </span>
              )}
              {heading && <h2 className="h-display h-2 egal__heading">{heading}</h2>}
            </div>
            <div className="egal__head-aside">
              {data.lede && <p className="egal__lede">{data.lede}</p>}
              <span className="egal__count">
                <span className="egal__count-n">{idx(total - 1)}</span>
                <span className="egal__count-l">frames</span>
              </span>
            </div>
          </header>
        )}

        {/* Desktop: asymmetric editorial mosaic. */}
        <div className="egal__mosaic m-desktop-only">
          {feature && (
            <div className="egal__lead">
              <Frame it={feature} i={0} feature />
            </div>
          )}
          {rest.length > 0 && (
            <div className="egal__stack">
              {rest.map((it, i) => (
                <Frame key={i + 1} it={it} i={i + 1} />
              ))}
            </div>
          )}
        </div>

        {/* Mobile: same frames as a swipeable slider (shared MobileCarousel). */}
        <MobileCarousel
          className="egal__carousel"
          ariaLabel="Photo gallery"
          cardWidth="82%"
          maxCardWidth={340}
          gap={14}
          edgePadding={24}
        >
          {data.images.map((it, i) => (
            <Frame key={i} it={it} i={i} />
          ))}
        </MobileCarousel>
      </div>
    </section>
  );
}
