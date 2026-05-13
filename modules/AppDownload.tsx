import { Container } from "@/components/layout/Container";
import type { AppDownloadSectionData } from "@/types/config.types";

type AppDownloadProps = {
  data: AppDownloadSectionData;
};

function GooglePlayBadge({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Get it on Google Play"
      className="group relative inline-flex items-center gap-3.5 overflow-hidden rounded-2xl px-5 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
      style={{
        background: "var(--brand-primary)",
        border: "1.5px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* Shimmer */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/10 transition-transform duration-700 group-hover:translate-x-full"
      />
      <svg viewBox="0 0 24 24" className="relative h-7 w-7 shrink-0" aria-hidden>
        <defs>
          <linearGradient id="gp-a" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00C8E8" />
            <stop offset="100%" stopColor="#00A99D" />
          </linearGradient>
          <linearGradient id="gp-b" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5AEA8E" />
            <stop offset="100%" stopColor="#00C8E8" />
          </linearGradient>
          <linearGradient id="gp-c" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF5E5B" />
            <stop offset="100%" stopColor="#FFD040" />
          </linearGradient>
          <linearGradient id="gp-d" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FF3D7F" />
            <stop offset="100%" stopColor="#FF5E5B" />
          </linearGradient>
        </defs>
        <path d="M4.5 2.5L15.5 9L12.5 12L4.5 2.5Z" fill="url(#gp-a)" />
        <path d="M3 4V20L12.5 12L3 4Z" fill="url(#gp-b)" />
        <path d="M15.5 9L20.5 11.5C21.2 11.9 21.2 12.6 20.5 13L15.5 15.5L12.5 12L15.5 9Z" fill="url(#gp-c)" />
        <path d="M4.5 21.5L15.5 15.5L12.5 12L4.5 21.5Z" fill="url(#gp-d)" />
      </svg>
      <span className="relative flex flex-col">
        <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/50">Get it on</span>
        <span className="text-[15px] font-bold leading-tight tracking-tight text-white">Google Play</span>
      </span>
    </a>
  );
}

function AppStoreBadge({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Download on the App Store"
      className="group relative inline-flex items-center gap-3.5 overflow-hidden rounded-2xl px-5 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
      style={{
        background: "white",
        border: "1.5px solid rgba(10,23,76,0.12)",
        boxShadow: "0 2px 12px rgba(10,23,76,0.08)",
      }}
    >
      {/* Shimmer */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-[var(--brand-primary)]/5 transition-transform duration-700 group-hover:translate-x-full"
      />
      <svg viewBox="0 0 24 24" className="relative h-7 w-7 shrink-0" aria-hidden
        style={{ fill: "var(--brand-primary)" }}>
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
      <span className="relative flex flex-col">
        <span
          className="text-[9px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: "rgba(10,23,76,0.4)" }}
        >
          Download on the
        </span>
        <span
          className="text-[15px] font-bold leading-tight tracking-tight"
          style={{ color: "var(--brand-primary)" }}
        >
          App Store
        </span>
      </span>
    </a>
  );
}

export function AppDownload({ data }: AppDownloadProps) {
  if (!data?.badges?.length) return null;

  return (
    <section
      id="app-download"
      className="relative overflow-hidden"
      style={{ background: "var(--brand-primary)" }}
    >
      {/* Subtle mesh glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute right-0 top-0 h-full w-1/2 opacity-[0.07]"
          style={{
            background: "radial-gradient(ellipse at 80% 50%, var(--brand-cool, #1FB6B6), transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 h-full w-1/3 opacity-[0.06]"
          style={{
            background: "radial-gradient(ellipse at 10% 80%, #E63950, transparent 60%)",
          }}
        />
      </div>

      {/* Dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <Container>
        <div className="relative flex flex-col items-start gap-8 py-10 sm:py-12 md:flex-row md:items-center md:justify-between">

          {/* Left */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span
                className="inline-block h-1 w-6 rounded-full"
                style={{ background: "var(--brand-cool, #1FB6B6)" }}
                aria-hidden
              />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
                Available on mobile
              </p>
            </div>
            <h2
              className="font-display font-black leading-tight tracking-[-0.02em] text-white"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}
            >
              {data.heading}
            </h2>
            <p className="mt-2 text-sm text-white/40">
              iOS &amp; Android · Free download
            </p>
          </div>

          {/* Right — badges */}
          <div className="flex flex-wrap items-center gap-3">
            {data.badges.map((badge) =>
              badge.kind === "play" ? (
                <GooglePlayBadge key={badge.href} href={badge.href} />
              ) : (
                <AppStoreBadge key={badge.href} href={badge.href} />
              )
            )}
          </div>

        </div>
      </Container>

      {/* Top hairline */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)" }}
      />
    </section>
  );
}
