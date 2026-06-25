/**
 * @file layout.tsx
 * @description Root layout for the SITE app (the public tenant render engine). This
 *  app contains ONLY the site — no builder — so the root layout owns the full
 *  chrome: html/font shell + MotionProvider AND the tenant theme, navbar, footer,
 *  sticky CTA, structured data, and SEO metadata. (Pre-split these were two files —
 *  a config-free root + a (site) group layout — kept apart so the builder at "/"
 *  stayed config-free. With the builder in its own app that separation is moot.)
 * @responsibilities
 *  - Register Google fonts as CSS variables; wrap with MotionProvider.
 *  - Load tenant config, apply theme CSS vars, frame pages with Navbar/Footer/CTA.
 *  - Build default SEO metadata from config.
 * @dependencies MotionProvider, getConfig, themeStyle, buildMetadata, Navbar,
 *  Footer, StickyCta, StructuredData
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-06-25
 */
import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

import { MotionProvider } from "@wl/render-engine/components/motion/MotionProvider";
import { Navbar } from "@wl/render-engine/components/layout/Navbar";
import { Footer } from "@wl/render-engine/components/layout/Footer";
import { StickyCta } from "@wl/render-engine/components/layout/StickyCta";
import { StructuredData } from "@wl/render-engine/components/common/SEO";
import { getConfig } from "@wl/render-engine/lib/getConfig";
import { themeStyle } from "@wl/render-engine/lib/themeLoader";
import { buildMetadata } from "@wl/render-engine/lib/seoBuilder";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

/** Build default SEO metadata for the site from tenant config. */
export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return buildMetadata(config);
}

// This app builds with `output: "export"` (static S3/CloudFront), so ISR/`revalidate`
// does not run — pages are pre-rendered once and cache-busted at the CDN.

/**
 * RootLayout - html/font shell + MotionProvider, then the tenant-themed site chrome
 * (navbar, footer, sticky CTA, structured data) wrapping the page content.
 */
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const config = await getConfig();
  const tenant = process.env.TENANT ?? "app_master";
  // Resolve the colour-theme name: prefer branding.theme, else derive from the
  // legacy stylesheet path (e.g. "/urmedz.css" → "urmedz"), else the default.
  const branding = config.app.branding;
  const theme =
    branding?.theme ||
    (branding?.stylesheet || "").replace(/^.*\//, "").replace(/\.css$/, "") ||
    "default";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <head>
        {/* Shared site stylesheet (all blocks) + the chosen colour-theme tokens.
            blocks.css supplies structure; the theme file sets default colours, which
            the user's brand colours override via the bridged CSS vars in themeStyle. */}
        <link rel="stylesheet" href="/site-css/blocks.css" />
        <link rel="stylesheet" href={`/site-css/themes/${theme}.tokens.css`} />
      </head>
      <body suppressHydrationWarning className="flex min-h-full flex-col">
        <MotionProvider>
          <div
            data-tenant={tenant}
            className="flex min-h-screen flex-col text-[var(--brand-text)]"
            style={themeStyle(config)}
          >
            <StructuredData config={config} />
            <Navbar app={config.app} />
            <main className="flex-1">{children}</main>
            <Footer app={config.app} />
            <StickyCta config={config.app.layout?.stickyCta} />
          </div>
        </MotionProvider>
      </body>
    </html>
  );
}
