/**
 * @file RichHeading.tsx
 * @description Renders config heading parts with optional emphasis and breaks.
 * @responsibilities
 *  - Map heading parts to styled spans (italic, accent, plain).
 *  - Insert line breaks between parts when flagged.
 *  - Return null or a fallback when no parts exist.
 * @dependencies React Fragment, config RichHeading type
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */

import { Fragment } from "react";
import type { RichHeading as RichHeadingT } from "@/types/config.types";

type Props = {
  value?: RichHeadingT;
  fallback?: string;
};

/**
 * renderRichHeading - Turns heading parts into styled React nodes.
 * @param {RichHeadingT | undefined} value - Heading parts with emphasis and breaks.
 * @returns React node, or null when no parts exist
 */
export function renderRichHeading(value: RichHeadingT | undefined): React.ReactNode {
  if (!value?.parts?.length) return null;
  return value.parts.map((p, i) => {
    const content = p.text;
    let node: React.ReactNode = content;
    if (p.emphasis === "italic-accent") {
      node = (
        <span className="serif-it" style={{ color: "var(--accent)" }}>
          {content}
        </span>
      );
    } else if (p.emphasis === "italic") {
      node = <span className="serif-it">{content}</span>;
    } else if (p.emphasis === "accent") {
      node = <span style={{ color: "var(--accent)" }}>{content}</span>;
    }
    return (
      <Fragment key={i}>
        {node}
        {p.br && <br />}
      </Fragment>
    );
  });
}

/**
 * RichHeading - Renders heading parts, or a fallback string.
 * @props {RichHeadingT} value - Heading parts to render.
 * @props {string} fallback - Text used when no parts render.
 * @returns JSX element
 */
export function RichHeading({ value, fallback }: Props) {
  const rendered = renderRichHeading(value);
  if (rendered) return <>{rendered}</>;
  if (fallback) return <>{fallback}</>;
  return null;
}
