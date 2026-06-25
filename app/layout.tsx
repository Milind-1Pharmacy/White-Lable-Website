/**
 * @file layout.tsx
 * @description Lean root layout shared by BOTH apps in this repo (the builder at
 *  "/" and the render engine under the (site) group). It only sets up the html
 *  shell, Google fonts, and the MotionProvider — it does NOT load tenant config.
 *  Tenant theme/stylesheet/metadata live in the (site) layout, which the builder
 *  doesn't inherit, so the builder root stays config-free.
 * @responsibilities
 *  - Register Google fonts as CSS variables on the html element.
 *  - Wrap the app with the MotionProvider.
 * @dependencies MotionProvider
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-06-23
 */
import { Fraunces, Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

import { MotionProvider } from "@/components/motion/MotionProvider";

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
 * RootLayout - The html/body shell with fonts + motion. App-agnostic: no tenant
 * config is loaded here (the builder doesn't need it; the (site) layout applies
 * tenant theme for the render engine).
 * @param {React.ReactNode} children - App content to render
 * @returns JSX element
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="flex min-h-full flex-col">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
