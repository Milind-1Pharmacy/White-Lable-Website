/**
 * @file Container.tsx
 * @description Centered max-width content wrapper with responsive gutters.
 * @responsibilities
 *  - Constrain content to max-w-7xl (1280px).
 *  - Apply responsive horizontal padding.
 *  - Merge optional extra classes.
 * @dependencies cn util, ContainerProps UI type
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import { cn } from "@wl/render-engine/lib/utils";
import type { ContainerProps } from "@wl/render-engine/types/ui.types";

/**
 * Container - Centers content at max-w-7xl with responsive side padding.
 * @props {React.ReactNode} children - Content to wrap
 * @props {string} [className] - Extra classes merged onto the wrapper
 * @returns JSX element
 */
export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12 xl:px-16",
        className,
      )}
    >
      {children}
    </div>
  );
}
