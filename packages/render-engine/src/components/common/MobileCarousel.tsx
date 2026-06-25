/**
 * @file MobileCarousel.tsx
 * @description Horizontal swipe carousel for cards on small screens.
 * @responsibilities
 *  - Wrap children in a scrollable, snapping track.
 *  - Expose sizing/gap/padding as CSS variables for styling.
 *  - Apply accessible region roles with a generic aria label.
 * @dependencies cn util, MobileCarouselProps UI type
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import { cn } from "@wl/render-engine/lib/utils";
import type { MobileCarouselProps } from "@wl/render-engine/types/ui.types";

/**
 * MobileCarousel - Scrollable horizontal track of cards for mobile views.
 * @props {React.ReactNode} children - Cards to lay out in the track
 * @props {string} [className] - Extra classes on the carousel root
 * @props {string|number} [cardWidth] - Card width (CSS var --mc-card-w)
 * @props {number} [maxCardWidth] - Max card width in px
 * @props {number} [minCardWidth] - Min card width in px
 * @props {number} [gap] - Gap between cards in px
 * @props {number} [edgePadding] - Track edge padding in px
 * @props {number} [breakpoint] - Px breakpoint for carousel behavior
 * @props {string} [ariaLabel] - Region label; keep generic, no tenant name
 * @returns JSX element
 */
export function MobileCarousel({
  children,
  className,
  cardWidth = "84%",
  maxCardWidth = 360,
  minCardWidth,
  gap = 14,
  edgePadding = 24,
  breakpoint = 980,
  ariaLabel,
}: MobileCarouselProps) {
  const style = {
    "--mc-card-w": typeof cardWidth === "number" ? `${cardWidth}px` : cardWidth,
    "--mc-card-max": `${maxCardWidth}px`,
    "--mc-card-min": minCardWidth ? `${minCardWidth}px` : "0px",
    "--mc-gap": `${gap}px`,
    "--mc-edge": `${edgePadding}px`,
    "--mc-bp": `${breakpoint}px`,
  } as React.CSSProperties;

  return (
    <div
      className={cn("m-carousel", className)}
      style={style}
      role="region"
      aria-label={ariaLabel ?? "Scrollable content"}
      aria-roledescription="carousel"
    >
      <div className="m-carousel__track">
        {Array.isArray(children) ? (
          children.map((child, i) => (
            <div className="m-carousel__item" key={i}>
              {child}
            </div>
          ))
        ) : (
          <div className="m-carousel__item">{children}</div>
        )}
      </div>
    </div>
  );
}
