/**
 * @file LegalArticle.tsx
 * @description Renders a full config-driven legal page (privacy, terms, disclaimer,
 *  data-deletion) as a self-contained `.legal-page` section.
 * @responsibilities
 *  - Render the eyebrow + heading, intro, optional video, body blocks and sections.
 *  - Use the shared `site-css/blocks/legal.css` `legal-*` classes (NOT Tailwind
 *    utilities) so the layout matches the builder preview exactly (preview = live)
 *    and clears the fixed navbar via `.legal-page`'s top padding.
 *  - Support string, paragraph, and ordered/unordered list block types.
 *  - Render nothing when no legal data is supplied.
 * @dependencies LegalPage / LegalBlock config types, safeUrl
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-06-26
 */
import type { LegalBlock, LegalPage } from "@wl/config-types";
import { safeSrc } from "@wl/render-engine/lib/safeUrl";

type Props = {
  data?: LegalPage;
};

/**
 * renderBlock - Renders one legal content block as paragraph or list.
 * @param {string | LegalBlock} block - Text or structured block to render
 * @param {number} key - React list key
 * @returns JSX element or null
 */
function renderBlock(block: string | LegalBlock, key: number) {
  if (typeof block === "string") {
    return (
      <p key={key} className="legal-p">
        {block}
      </p>
    );
  }
  if (block.type === "p") {
    return (
      <p key={key} className="legal-p">
        {block.text}
      </p>
    );
  }
  if (block.type === "list") {
    const ListTag = block.ordered ? "ol" : "ul";
    return (
      <ListTag
        key={key}
        className={block.ordered ? "legal-list legal-list--ol" : "legal-list"}
      >
        {block.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ListTag>
    );
  }
  return null;
}

/**
 * LegalArticle - Shows a full legal page from config inside a `.legal-page` shell:
 * eyebrow, heading, intro, optional video, body and titled sections. Mirrors the
 * builder's LegalArticlePreview markup so the live page matches the preview.
 * @props {LegalPage} [data] - Legal page content slice from config
 * @returns JSX element
 */
export function LegalArticle({ data }: Props) {
  if (!data) return null;
  const top = data.body ?? [];
  const sections = data.sections ?? [];

  return (
    <section className="legal-page">
      <div className="legal-wrap">
        {data.eyebrow && <p className="legal-eyebrow">{data.eyebrow}</p>}
        {data.heading && <h1 className="legal-heading">{data.heading}</h1>}

        <article className="legal-article">
          {data.intro && <p className="legal-intro">{data.intro}</p>}
          {safeSrc(data.video?.src) && (
            <figure className="not-prose my-8 flex flex-col items-center">
              <div className="legal-video">
                <div className="legal-video__frame">
                  <video
                    className="legal-video__media"
                    src={safeSrc(data.video?.src)}
                    poster={safeSrc(data.video?.poster) || undefined}
                    controls
                    playsInline
                    preload="metadata"
                    controlsList="nodownload"
                  />
                </div>
              </div>
              {data.video?.caption && (
                <figcaption className="legal-video__caption mono">
                  {data.video.caption}
                </figcaption>
              )}
            </figure>
          )}
          {top.map((b, i) => renderBlock(b, i))}
          {sections.map((s, i) => (
            <div key={i} className="legal-section">
              {s.heading && <h2 className="legal-subhead">{s.heading}</h2>}
              {s.subheading && <h3 className="legal-subhead2">{s.subheading}</h3>}
              {s.body.map((b, j) => renderBlock(b, j))}
            </div>
          ))}
        </article>
      </div>
    </section>
  );
}
