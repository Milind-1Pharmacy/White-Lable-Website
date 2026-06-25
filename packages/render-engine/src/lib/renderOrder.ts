/**
 * @file renderOrder.ts
 * @description Resolve the home page's block render order from config.
 *  The builder can author an explicit `content.order`; when absent we fall back
 *  to the legacy fixed order so existing tenant configs render unchanged.
 * @responsibilities
 *  - Turn `content.order` (tokens) + `content.sections[]` into a flat, ordered
 *    list of render blocks the page/preview can map straight to components.
 * @dependencies @wl/config-types
 * @author WhiteLabel Platform Team
 * @created 2026-06-23
 */
import type { Content, Section } from "@wl/config-types";

/** One resolved block to render, in final order. */
export type RenderBlock =
  | { kind: "hero" }
  | { kind: "about" }
  | { kind: "services" }
  | { kind: "section"; section: Section; index: number };

/**
 * Resolve the ordered list of blocks for the home page.
 * Hero is always first. If `content.order` is present it drives the sequence;
 * otherwise the legacy order is used: hero → appStrip → about → services → rest.
 */
export function resolveRenderOrder(content: Content): RenderBlock[] {
  const sections = content.sections || [];

  if (content.order && content.order.length) {
    const blocks: RenderBlock[] = [];
    const seenSection = new Set<number>();
    // Hero is pinned first regardless of where it appears in order.
    blocks.push({ kind: "hero" });
    for (const token of content.order) {
      if (token === "hero") continue; // already emitted
      if (token === "about") blocks.push({ kind: "about" });
      else if (token === "services") blocks.push({ kind: "services" });
      else if (token.startsWith("section:")) {
        const i = Number(token.slice("section:".length));
        // `i >= 0` rejects a crafted `section:-1` token — a negative index would
        // otherwise pass Number.isInteger and read from the end of the array.
        if (Number.isInteger(i) && i >= 0 && sections[i] && !seenSection.has(i)) {
          seenSection.add(i);
          blocks.push({ kind: "section", section: sections[i], index: i });
        }
      }
    }
    // Append any sections not referenced by order (e.g. newly added), in order.
    sections.forEach((section, i) => {
      if (!seenSection.has(i)) blocks.push({ kind: "section", section, index: i });
    });
    return blocks;
  }

  // Legacy fixed order: hero → appStrip → about → services → remaining sections.
  const blocks: RenderBlock[] = [{ kind: "hero" }];
  sections.forEach((section, i) => {
    if (section.type === "appStrip") blocks.push({ kind: "section", section, index: i });
  });
  blocks.push({ kind: "about" });
  blocks.push({ kind: "services" });
  sections.forEach((section, i) => {
    if (section.type !== "appStrip") blocks.push({ kind: "section", section, index: i });
  });
  return blocks;
}

/** Whether About has any content worth rendering (mirrors page.tsx's guard). */
export function aboutHasContent(content: Content): boolean {
  const a = content.about;
  return (
    !!a &&
    (!!a.eyebrow || !!a.title || !!a.lede || !!a.description || !!(a.pillars && a.pillars.length))
  );
}
