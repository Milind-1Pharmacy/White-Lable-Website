import type { ReactNode } from "react";

export type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export type SectionWrapperProps = {
  id?: string;
  heading?: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
};

export type NavItem = {
  label: string;
  href: string;
};

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
