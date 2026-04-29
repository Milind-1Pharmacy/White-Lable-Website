import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/Container";
import type { SectionWrapperProps } from "@/types/ui.types";

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
