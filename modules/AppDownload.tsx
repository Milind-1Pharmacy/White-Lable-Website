import { Container } from "@/components/layout/Container";
import type { AppDownloadSectionData } from "@/types/config.types";

type AppDownloadProps = {
  data: AppDownloadSectionData;
};

function AppleGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5">
      <path
        fill="currentColor"
        d="M16.5 12.5c0-2.3 1.9-3.4 2-3.5-1.1-1.5-2.7-1.7-3.3-1.8-1.4-.1-2.8.8-3.5.8-.7 0-1.9-.8-3.1-.8-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.5.8 1.1 1.7 2.4 2.9 2.4 1.2 0 1.6-.7 3.1-.7 1.5 0 1.8.7 3.1.7 1.3 0 2.1-1.1 2.9-2.3.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.7-1-2.7-4z M14.2 5.5c.6-.8 1.1-1.9.9-3-.9.1-2 .6-2.7 1.4-.6.7-1.1 1.8-1 2.8 1.1.1 2.1-.5 2.8-1.2z"
      />
    </svg>
  );
}

function PlayGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5">
      <path
        fill="currentColor"
        d="M3 2.5c-.3.2-.5.5-.5.9v17.2c0 .4.2.7.5.9l9.8-9.5L3 2.5zm10.7 9.5L17 15l3.2-1.8c.8-.4.8-1.6 0-2L17 9l-3.3 3zm-.5-.5L4.5 3.1l8.1 8.1.6.3.6-.5zm0 1L4.5 21l8.1-8.4.6.3-.6-.4z"
      />
    </svg>
  );
}

export function AppDownload({ data }: AppDownloadProps) {
  if (!data?.badges?.length) return null;
  return (
    <section
      id="app-download"
      className="relative border-y border-[var(--brand-primary)]/12 py-10 sm:py-12"
    >
      <Container>
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-3 text-[15px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-primary)] sm:text-base">
            {data.heading}
            <span
              aria-hidden
              className="text-[var(--brand-warm)]"
              style={{ fontSize: "1.2em" }}
            >
              ↘
            </span>
          </h2>
          <ul className="flex flex-wrap items-stretch gap-3">
            {data.badges.map((badge) => (
              <li key={`${badge.kind}-${badge.href}`}>
                <a
                  href={badge.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 border border-[var(--brand-primary)] px-4 py-2.5 text-[var(--brand-primary)] transition-all duration-200 hover:border-[2px]"
                >
                  <span className="text-[var(--brand-warm)]">
                    {badge.kind === "appstore" ? <AppleGlyph /> : <PlayGlyph />}
                  </span>
                  <span className="flex flex-col items-start leading-tight">
                    <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-[var(--brand-primary)]/70">
                      {badge.kind === "appstore"
                        ? "Download on the"
                        : "Get it on"}
                    </span>
                    <span className="text-[13px] font-semibold tracking-tight">
                      {badge.kind === "appstore" ? "App Store" : "Google Play"}
                    </span>
                  </span>
                </a>
                {(badge.version || badge.size) && (
                  <p className="mt-1.5 text-center font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--brand-primary)]/45">
                    {[badge.version, badge.size].filter(Boolean).join(" · ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
