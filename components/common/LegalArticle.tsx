/**
 * @file LegalArticle.tsx
 * @description Renders config-driven legal page content (privacy, terms, disclaimer).
 * @responsibilities
 *  - Render intro, optional video, body blocks and titled sections.
 *  - Support string, paragraph, and ordered/unordered list block types.
 *  - Render nothing when no legal data is supplied.
 * @dependencies LegalPage / LegalBlock config types
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import type { LegalBlock, LegalPage } from "@/types/config.types";
import { safeSrc } from "@/lib/safeUrl";

type Props = {
  data?: LegalPage;
};

/**
 * renderBlock - Renders one legal content block as paragraph or list.
 * @param {string | LegalBlock} block - Text or structured block to render
 * @param {number} key - React list key
 * @param {boolean} [leading] - Emphasize as the leading paragraph
 * @returns JSX element or null
 */
function renderBlock(block: string | LegalBlock, key: number, leading?: boolean) {
  if (typeof block === "string") {
    return (
      <p key={key} className={leading ? "font-medium" : undefined}>
        {block}
      </p>
    );
  }
  if (block.type === "p") {
    return (
      <p key={key} className={leading ? "font-medium" : undefined}>
        {block.text}
      </p>
    );
  }
  if (block.type === "list") {
    const ListTag = block.ordered ? "ol" : "ul";
    return (
      <ListTag
        key={key}
        className={
          (block.ordered
            ? "list-decimal "
            : "list-disc ") +
          "ml-5 space-y-2 text-[var(--brand-text)]/85"
        }
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
 * LegalArticle - Shows a full legal page from config: intro, video, sections.
 * @props {LegalPage} [data] - Legal page content slice from config
 * @returns JSX element
 */
export function LegalArticle({ data }: Props) {
  if (!data) return null;
  const top = data.body ?? [];
  const sections = data.sections ?? [];

  return (
    <article className="prose prose-neutral max-w-3xl space-y-5 text-[var(--brand-text)]/85">
      {data.intro && <p className="font-medium">{data.intro}</p>}
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
      {top.map((b, i) =>
        renderBlock(b, i, i === 0 && !data.intro && top.length > 1),
      )}
      {sections.map((s, i) => (
        <section key={i} className="space-y-3">
          {s.heading && (
            <h3 className="text-xl font-semibold text-[var(--brand-text)]">
              {s.heading}
            </h3>
          )}
          {s.subheading && (
            <h4 className="text-base font-medium text-[var(--brand-text)]/90">
              {s.subheading}
            </h4>
          )}
          {s.body.map((b, j) => renderBlock(b, j))}
        </section>
      ))}
    </article>
  );
}
