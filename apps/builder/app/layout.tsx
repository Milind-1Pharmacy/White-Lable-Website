/**
 * @file layout.tsx
 * @description Root layout for the BUILDER app (the authoring UI). This app is just
 *  the builder — it owns "/" — so the root layout is the builder shell: html/font
 *  base + MotionProvider, the full-screen frame, and the keyframes the builder's
 *  inline-styled spinners/loader animations rely on. No tenant config, no public
 *  Navbar/Footer (the builder uses its own fixed "Foundry" palette via inline styles).
 * @responsibilities
 *  - Register Google fonts; wrap with MotionProvider.
 *  - Provide the full-screen builder frame + animation keyframes.
 *  - Set builder metadata (noindex).
 * @dependencies MotionProvider
 * @author WhiteLabel Platform Team
 * @created 2026-06-25
 */
import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

import { MotionProvider } from "@wl/render-engine/components/motion/MotionProvider";

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

export const metadata: Metadata = {
  title: "Website Builder",
  robots: { index: false, follow: false },
};

/** Builder root: font/motion shell + full-screen frame + loader keyframes. */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="flex min-h-full flex-col">
        {/* Keyframes the builder's inline spinner/pulse styles + the publish
            "deploy console" loader animations rely on. */}
        <style>{`
@keyframes wb-spin{to{transform:rotate(360deg);}}
@keyframes wb-pulse{0%,100%{opacity:1;}50%{opacity:.45;}}
@keyframes wb-orbit{to{transform:rotate(360deg);}}
@keyframes wb-orbit-rev{to{transform:rotate(-360deg);}}
@keyframes wb-scan{0%{transform:translateY(-120%);}100%{transform:translateY(820%);}}
@keyframes wb-dot{0%,80%,100%{transform:scale(.55);opacity:.35;}40%{transform:scale(1);opacity:1;}}
@keyframes wb-bar{0%{background-position:0% 0;}100%{background-position:200% 0;}}
@keyframes wb-grid{to{transform:translateY(46px);}}
@keyframes wb-rise{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
@keyframes wb-glow{0%,100%{opacity:.5;}50%{opacity:1;}}
@keyframes wb-tick-in{from{opacity:0;transform:scale(.4);}to{opacity:1;transform:scale(1);}}
`}</style>
        <MotionProvider>
          <div className="h-screen w-full overflow-hidden bg-[#F1F1F4]">{children}</div>
        </MotionProvider>
      </body>
    </html>
  );
}
