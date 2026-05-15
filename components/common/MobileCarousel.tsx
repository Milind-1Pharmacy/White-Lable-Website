import { cn } from "@/lib/utils";
import type { MobileCarouselProps } from "@/types/ui.types";

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
