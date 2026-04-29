import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-medium uppercase tracking-wider text-[var(--brand-primary)]">
        404
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-[var(--brand-text)] sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-[var(--brand-text)]/70">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className={cn(
          buttonVariants({ size: "lg" }),
          "mt-8 bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)]/90",
        )}
      >
        Back to home
      </Link>
    </Container>
  );
}
