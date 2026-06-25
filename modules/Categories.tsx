"use client";
/**
 * @file Categories.tsx
 * @description Interactive categories section with sticky desktop preview and mobile rail.
 * @responsibilities
 *  - Show a numbered, hoverable list of categories.
 *  - Drive a sticky preview from the active row on desktop.
 *  - Render a horizontal card rail on mobile.
 * @dependencies react, config.types, RichHeading, useIsMobile
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import { useState } from "react";
import type { CategoriesSectionData } from "@wl/config-types";
import { renderRichHeading } from "@/modules/RichHeading";
import { safeSrc } from "@/lib/safeUrl";
import { useIsMobile } from "@/lib/useIsMobile";

type CategoriesProps = {
  data: CategoriesSectionData;
};

/**
 * Categories - Shows a category list driving a preview, plus a mobile rail.
 * @props {CategoriesSectionData} data - Heading, eyebrow, tagline, and category items.
 * @returns JSX element
 */
export function Categories({ data }: CategoriesProps) {
  // active row drives the right-hand sticky preview (desktop)
  const [active, setActive] = useState(0);
  const isMobile = useIsMobile();

  if (!data?.items?.length) return null;

  const heading = renderRichHeading(data.heading);
  const items = data.items;
  const total = String(items.length).padStart(2, "0");
  const current = items[active] ?? items[0];

  return (
    <section className="section section--cream" id="categories">
      <div className="wrap">
        {(data.eyebrow || heading || data.tagline) && (
          <div className="cat-head">
            {data.eyebrow && (
              <span className="eyebrow">
                <span className="dot" />
                {data.eyebrow}
              </span>
            )}
            {heading && (
              <h2
                className="h-display h-2"
                style={{ marginTop: 20, minHeight: isMobile ? 88 : 120 }}
              >
                {heading}
              </h2>
            )}
            {data.tagline && <p className="cat-head__tag">{data.tagline}</p>}
          </div>
        )}

        <div className="cat-index m-desktop-only">
          {/* Left: large sticky preview that reacts to the active row */}
          <aside className="cat-preview" aria-hidden="true">
            <div className="cat-preview__inner">
              <span className="cat-preview__count">
                {String(active + 1).padStart(2, "0")}
                <em> / {total}</em>
              </span>
              <div className="cat-preview__stage">
                {items.map(
                  (c, i) =>
                    safeSrc(c.icon) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={safeSrc(c.icon)}
                        alt=""
                        className={
                          "cat-preview__icon" + (i === active ? " is-on" : "")
                        }
                      />
                    ),
                )}
              </div>
              <span className="cat-preview__title">{current?.title}</span>
              {current?.description && (
                <span className="cat-preview__desc">{current.description}</span>
              )}
            </div>
          </aside>

          {/* Right: interactive numbered list of categories */}
          <ol className="cat-list">
            {items.map((c, i) => (
              <li
                key={i}
                className={"cat-row" + (i === active ? " is-active" : "")}
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(i)}
                onFocus={() => setActive(i)}
                tabIndex={0}
              >
                <div className="cat-row__line">
                  <span className="cat-row__num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="cat-row__title">{c.title}</span>
                  <span className="cat-row__arrow" aria-hidden="true">
                    ↗
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Mobile: a tactile horizontal rail of compact cards */}
        <div className="cat-rail m-mobile-only" role="list">
          {items.map((c, i) => (
            <article className="cat-tile" role="listitem" key={i}>
              <span className="cat-tile__num">
                {String(i + 1).padStart(2, "0")}
              </span>
              {safeSrc(c.icon) && (
                <span className="cat-tile__icon">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={safeSrc(c.icon)} alt="" aria-hidden="true" />
                </span>
              )}
              <span className="cat-tile__title">{c.title}</span>
              {c.description && (
                <p className="cat-tile__desc">{c.description}</p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
