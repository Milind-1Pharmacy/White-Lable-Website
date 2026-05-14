import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";
import { getConfig } from "@/lib/getConfig";

export default async function NotFound() {
  const { app } = await getConfig();
  const page = app.layout?.pages?.notFound;

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      {page?.code && (
        <p className="text-sm font-medium uppercase tracking-wider text-[var(--brand-primary)]">
          {page.code}
        </p>
      )}
      {page?.heading && (
        <h1 className="mt-3 text-3xl font-semibold text-[var(--brand-text)] sm:text-4xl">
          {page.heading}
        </h1>
      )}
      {page?.body && (
        <p className="mt-3 max-w-md text-[var(--brand-text)]/70">{page.body}</p>
      )}
      {page?.ctaLabel && (
        <Link
          href={page.ctaHref ?? "/"}
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-8 bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)]/90",
          )}
        >
          {page.ctaLabel}
        </Link>
      )}
    </Container>
  );
}
