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
      {/* Keyframes the builder's inline spinner/pulse styles reference. */}
      <style>{`@keyframes wb-spin{to{transform:rotate(360deg);}}@keyframes wb-pulse{0%,100%{opacity:1;}50%{opacity:.4;}}`}</style>
      {children}
    </div>
  );
}
