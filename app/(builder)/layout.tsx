/**
 * @file layout.tsx
 * @description Layout for the (builder) route group — the Foundry form-builder app.
 * @responsibilities
 *  - Render the builder full-screen, without the public site Navbar/Footer/StickyCta.
 *  - Provide the keyframes the builder's inline-styled spinners/animations rely on.
 * @dependencies react
 * @author WhiteLabel Platform Team
 * @created 2026-06-22
 * @lastUpdated 2026-06-22
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Website Builder",
  robots: { index: false, follow: false },
};

/**
 * BuilderLayout - Full-screen shell for the authoring UI.
 * The builder uses its own fixed "Foundry" palette via inline styles, so it does
 * not consume the tenant --brand-* vars set on <body> by the root layout.
 */
export default function BuilderLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="h-screen w-full overflow-hidden bg-[#F1F1F4]">
      {/* Keyframes the builder's inline spinner/pulse styles reference, plus the
          publish "deploy console" loader animations (orbit, scanline, dots,
          bar-shimmer, grid drift, fade-up). */}
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
      {children}
    </div>
  );
}
