/**
 * @file layout.tsx
 * @description Root layout that sets up fonts, theme, and motion provider.
 * @responsibilities
 *  - Register Google fonts as CSS variables on the html element.
 *  - Apply tenant theme and optional remote stylesheet.
 *  - Wrap the app with the MotionProvider.
 * @dependencies getConfig, themeStyle, buildMetadata, MotionProvider
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

import { MotionProvider } from "@/components/motion/MotionProvider";
import { getConfig } from "@/lib/getConfig";
import { themeStyle } from "@/lib/themeLoader";
import { buildMetadata } from "@/lib/seoBuilder";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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

/**
 * generateMetadata - Builds default SEO metadata for the whole app.
 * @returns Next.js Metadata
 */
export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return buildMetadata(config);
}

export const revalidate = 3600;

/**
 * RootLayout - Defines the html/body shell with fonts and theme.
 * @param {React.ReactNode} children - App content to render
 * @returns JSX element
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getConfig();
  const stylesheet = config.app.branding?.stylesheet;
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <head>
        {stylesheet && <link rel="stylesheet" href={stylesheet} />}
      </head>
      <body
        suppressHydrationWarning
        className="flex min-h-full flex-col text-[var(--brand-text)]"
        style={themeStyle(config)}
      >
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
