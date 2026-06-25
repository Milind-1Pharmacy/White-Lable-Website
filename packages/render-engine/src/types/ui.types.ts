/**
 * @file ui.types.ts
 * @description Shared prop types for reusable UI layout components.
 * @responsibilities
 *  - Define props for Container and SectionWrapper layout shells.
 *  - Define navigation item shape.
 *  - Define tunable props for the mobile carousel.
 * @dependencies React ReactNode type.
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import type { ReactNode } from "react";

/** Props for the max-width page container wrapper. */
export type ContainerProps = {
  children: ReactNode;
  className?: string;
};

/** Props for a titled page section with optional eyebrow text. */
export type SectionWrapperProps = {
  id?: string;
  heading?: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
};

/** A single navigation link with label and target href. */
export type NavItem = {
  label: string;
  href: string;
};

/** Props controlling sizing, spacing, and behavior of the mobile carousel. */
export type MobileCarouselProps = {
  children: ReactNode;
  className?: string;
  /** Card width: number (px) or any CSS length (e.g. "84%", "280px"). Default "84%". */
  cardWidth?: number | string;
  /** Upper cap so cards don't get oversized on tablet. Default 360. */
  maxCardWidth?: number;
  /** Optional lower cap (px). */
  minCardWidth?: number;
  /** Gap between cards (px). Default 14. */
  gap?: number;
  /** Left/right scroll-padding (px) — sets the peek of the next card. Default 24. */
  edgePadding?: number;
  /** Hide the carousel above this width (px) — desktop renders nothing. Default 980. */
  breakpoint?: number;
  /** Accessible label for the scroll region. */
  ariaLabel?: string;
};
