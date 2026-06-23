/**
 * @file safeUrl.ts
 * @description Boundary validators for config-supplied URLs. Tenant config (and
 *  the builder draft) can carry arbitrary href/src strings; rendering them into
 *  <a href>/<Link>/<img src>/<video src> without checking the scheme allows XSS
 *  (`javascript:`/`vbscript:`/`data:text/html`) and open-redirects (`//host`).
 *  These helpers normalise an untrusted URL to a safe one at the render boundary.
 * @responsibilities
 *  - safeHref: allow only navigational schemes (http/https/mailto/tel),
 *    root-relative paths and hashes; otherwise return a safe fallback.
 *  - safeSrc: allow only http(s), root-relative paths and `data:image/*`;
 *    otherwise return "" so the element simply renders nothing.
 * @dependencies none (pure, SSR-safe — no `new URL`, which needs a base)
 * @author WhiteLabel Platform Team
 * @created 2026-06-23
 */

/** Leading-scheme matcher, tolerant of leading whitespace/control chars. */
const SCHEME_RE = /^\s*([a-z][a-z0-9+.-]*):/i;

/**
 * Return a safe href for navigation, or `fallback` if the value is unsafe.
 * Allows: http(s), mailto, tel, root-relative ("/…"), and hashes ("#…").
 * Rejects: javascript:, data:, vbscript:, file:, any other scheme, and
 * protocol-relative ("//host", an open-redirect vector).
 */
export function safeHref(href: string | undefined | null, fallback = "/"): string {
  if (!href || typeof href !== "string") return fallback;
  const v = href.trim();
  if (!v) return fallback;
  // Protocol-relative URLs ("//evil.com") are open redirects — reject.
  if (v.startsWith("//")) return fallback;
  // Root-relative and in-page anchors are safe.
  if (v.startsWith("/") || v.startsWith("#")) return v;
  const m = SCHEME_RE.exec(v);
  if (!m) return v; // no scheme → a relative path, safe
  const scheme = m[1].toLowerCase();
  return ["http", "https", "mailto", "tel"].includes(scheme) ? v : fallback;
}

/**
 * Return a safe media src, or "" if the value is unsafe (so the element renders
 * nothing rather than executing a script scheme). Allows: http(s), root- or
 * relative paths, and `data:image/*`. Rejects every other scheme (javascript:,
 * vbscript:, data:text/html, etc.) and protocol-relative URLs.
 */
export function safeSrc(src: string | undefined | null): string {
  if (!src || typeof src !== "string") return "";
  const v = src.trim();
  if (!v) return "";
  if (v.startsWith("//")) return "";
  if (v.startsWith("/") || v.startsWith("#")) return v;
  const m = SCHEME_RE.exec(v);
  if (!m) return v; // relative path
  const scheme = m[1].toLowerCase();
  if (scheme === "http" || scheme === "https") return v;
  // Only image data URIs are allowed (never data:text/html, data:image/svg+xml
  // is allowed but does not execute as <img>).
  if (scheme === "data" && /^\s*data:image\//i.test(v)) return v;
  return "";
}
