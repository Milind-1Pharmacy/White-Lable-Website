// Barrel for @wl/render-engine. Prefer the subpath imports
// (@wl/render-engine/modules/Hero, /lib/getConfig, /components/layout/Navbar)
// for tree-shaking; this barrel re-exports the commonly composed pieces.
export * from "./lib/getConfig";
export * from "./lib/renderOrder";
export * from "./lib/seoBuilder";
export * from "./lib/themeBridge";
export * from "./lib/themeLoader";
export * from "./lib/legalRoutes";
export * from "./lib/safeUrl";
export * from "./lib/utils";
