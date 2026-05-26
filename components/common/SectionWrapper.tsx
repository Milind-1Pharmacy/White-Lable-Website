/**
 * @file SectionWrapper.tsx
 * @description Standard padded page section with optional eyebrow and heading.
 * @responsibilities
 *  - Provide consistent vertical rhythm for content sections.
 *  - Render optional eyebrow label and display heading.
 *  - Constrain content width via shared Container.
 * @dependencies cn util, Container, SectionWrapperProps UI type
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/Container";
import type { SectionWrapperProps } from "@/types/ui.types";

/**
 * SectionWrapper - Wraps a section with spacing, optional eyebrow and heading.
 * @props {string} [id] - Section anchor id
 * @props {string} [heading] - Section display heading
 * @props {string} [eyebrow] - Small uppercase label above heading
 * @props {React.ReactNode} children - Section body content
 * @props {string} [className] - Extra section classes
 * @returns JSX element
 */
// Styles: tall vertical padding, large light display heading
export function SectionWrapper({
  id,
  heading,
  eyebrow,
  children,
  className,
}: SectionWrapperProps) {
  return (
    <section id={id} className={cn("py-24 sm:py-32 lg:py-40", className)}>
      <Container>
        {(eyebrow || heading) && (
          <div className="mb-14 max-w-2xl sm:mb-20">
            {eyebrow ? (
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.25em] text-[var(--brand-primary)]">
                {eyebrow}
              </p>
            ) : null}
            {heading ? (
              <h2 className="font-display text-[clamp(2rem,4.5vw,3.75rem)] font-light leading-[1.05] tracking-tight text-[var(--brand-text)]">
                {heading}
              </h2>
            ) : null}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
