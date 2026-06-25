/**
 * @file RichHeading.tsx
 * @description Renders config heading "parts" (fragments) with optional emphasis
 *  and line breaks. The single source of truth for fragment SPACING — a space is
 *  inserted between two adjacent fragments only when needed (not after a line
 *  break, not where one side already supplies whitespace, and not before closing
 *  punctuation). The builder's inline preview and the plain-text join reuse the
 *  same rule so editor preview = live site = SEO text, always.
 * @responsibilities
 *  - needsSpaceBetween: the smart between-fragment spacing rule (shared).
 *  - richHeadingToText: flatten parts to a plain string with the same spacing.
 *  - renderRichHeading: map parts to styled spans, inserting smart spaces + breaks.
 * @dependencies React Fragment, config RichHeading type
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-06-25
 */

import { Fragment } from "react";
import type { RichHeading as RichHeadingT } from "@/types/config.types";

type Props = {
  value?: RichHeadingT;
  fallback?: string;
};

/** Characters that should NOT have a space before them (closing punctuation). */
const NO_LEADING_SPACE = /^[\s,.!?;:)\]}»…’”%-]/;

/**
 * needsSpaceBetween - true when a single space should be inserted between two
 * adjacent fragments. We add the space UNLESS:
 *  - the previous fragment ended a line (`br`) — the break is the separator;
 *  - the previous text already ends in whitespace;
 *  - the next text already starts with whitespace; or
 *  - the next text starts with closing punctuation (",", ".", ")", "-", …).
 * Fixes "fingertip-"+"fast." → "fingertip- fast." while leaving already-spaced data
 * ("Download the "+"pharmacy") un-doubled.
 */
export function needsSpaceBetween(prevText: string, prevBr: boolean | undefined, nextText: string): boolean {
  if (prevBr) return false;
  if (!prevText || !nextText) return false;
  if (/\s$/.test(prevText)) return false;
  if (NO_LEADING_SPACE.test(nextText)) return false;
  return true;
}

/**
 * richHeadingToText - Flatten heading parts to one plain string, applying the same
 * smart spacing as the renderer (so SEO/fallback text matches what's displayed).
 */
export function richHeadingToText(value: RichHeadingT | string | undefined): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  const parts = value.parts || [];
  let out = "";
  parts.forEach((p, i) => {
    if (i > 0) {
      const prev = parts[i - 1];
      // After a line break, a single space keeps words apart in the flat text.
      if (prev.br || needsSpaceBetween(prev.text, prev.br, p.text)) out += " ";
    }
    out += p.text;
  });
  return out.trim();
}

/**
 * renderRichHeading - Turns heading parts into styled React nodes, inserting a
 * smart space between adjacent fragments and a <br/> after any part flagged `br`.
 * @param {RichHeadingT | undefined} value - Heading parts with emphasis and breaks.
 * @returns React node, or null when no parts exist
 */
export function renderRichHeading(value: RichHeadingT | undefined): React.ReactNode {
  if (!value?.parts?.length) return null;
  const parts = value.parts;
  return parts.map((p, i) => {
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
    // A space BEFORE this fragment when the previous one didn't supply the boundary.
    const prev = i > 0 ? parts[i - 1] : undefined;
    const space = prev && needsSpaceBetween(prev.text, prev.br, content) ? " " : "";
    return (
      <Fragment key={i}>
        {space}
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
