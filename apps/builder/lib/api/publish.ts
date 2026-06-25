/**
 * @file publish.ts
 * @description Front-end client for the tenant publish pipeline. The browser
 *  CANNOT run `next build` — Publish hands the backend a complete "flavor"
 *  (slug + theme + the full AppConfig) and the backend runs
 *  `TENANT=<slug> next build` on an async Lambda, uploads the static export to
 *  that tenant's S3 bucket, and reports status. This client only sends the flavor
 *  and polls for status. See docs/system-architecture.md → Backend Requirements.
 * @responsibilities
 *  - publishTenant(payload) → POST tenant_config/publish (fire-and-forget).
 *  - getPublishStatus(slug) → GET tenant_config/status (builder polls this).
 *  - getTenantConfig() → GET tenant_config (builder load: the stored/last-published
 *    AppConfig, used as a fallback seed + "reset to published"; never a draft).
 * @dependencies ./endpoints
 * @author WhiteLabel Platform Team
 * @created 2026-06-23
 */
import type { AppConfig } from "@wl/config-types";
import { getURL } from "./endpoints";

/** The exact body the builder POSTs on Publish — the publishable "flavor". */
export type PublishPayload = {
  /** Tenant slug — unique; also the build target `TENANT=<slug>` and bucket name. */
  slug: string;
  /** Which CSS theme/flavor the published site ships (e.g. "urmedz", "aarav_pharmacy"). */
  theme: string;
  /** The full AppConfig the render engine consumes (sections inlined, order set). */
  appConfig: AppConfig;
};

/** Build status the builder polls for; mirrors the backend `status` enum + URL. */
export type PublishStatus = {
  status: "draft" | "queued" | "building" | "live" | "failed";
  siteUrl?: string;
  message?: string;
};

/** The session token the API expects (same `session-token` header as upload). */
function authHeaders(token?: string): Record<string, string> {
  return token ? { "session-token": token } : {};
}

/**
 * Resolve the session token to send. A caller-supplied token wins; otherwise fall
 * back to the build-time `NEXT_PUBLIC_PUBLISH_TOKEN` (a dev/test token set in
 * `.env.local`). Returns undefined when neither is set (unauthenticated call).
 */
export function publishToken(token?: string): string | undefined {
  return token || process.env.NEXT_PUBLIC_PUBLISH_TOKEN || undefined;
}

/**
 * Unwrap the UNIVERSAL response envelope — the platform contract is that every
 * success payload sits under `data` ({ statusCode, data } | { statusCode, error }).
 * This peels exactly that one envelope layer (same as upload.ts's `json.data.*`).
 * The publish/status handlers nest their own object one level deeper still
 * (`data: { status }`) — that second peel is the caller's job, not this helper's,
 * so this stays a faithful single-envelope unwrap shared by both endpoints.
 */
async function unwrap(res: Response): Promise<Record<string, unknown> | null> {
  const json = await res.json().catch(() => null);
  if (!res.ok || (json && json.error)) {
    const msg = json?.error?.userMessage || `Request failed (HTTP ${res.status})`;
    throw new Error(msg);
  }
  return (json?.data ?? json ?? null) as Record<string, unknown> | null;
}

/**
 * Pull the `{ status, siteUrl, message }` object out of an already-envelope-
 * unwrapped publish/status response. The handler wraps it under its own `data`
 * key ({ data: { status } }) but tolerate a flat `{ status }` too, so the client
 * survives if the backend ever drops the inner nesting.
 */
function readStatusObject(unwrapped: Record<string, unknown> | null): Partial<PublishStatus> {
  if (!unwrapped) return {};
  const inner = "data" in unwrapped ? (unwrapped.data as Record<string, unknown>) : unwrapped;
  return (inner ?? {}) as Partial<PublishStatus>;
}

/**
 * Submit the flavor to the backend. Fire-and-forget: the backend persists the
 * config, sets status=building, and triggers the async build; it returns
 * immediately (the build itself completes out-of-band, polled via getPublishStatus).
 * @returns the initial status (typically `{ status: "building" | "queued" }`).
 */
export async function publishTenant(payload: PublishPayload, token?: string): Promise<PublishStatus> {
  const res = await fetch(getURL({ key: "TENANT_PUBLISH" }), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(publishToken(token)) },
    body: JSON.stringify(payload),
  });
  const data = readStatusObject(await unwrap(res));
  return { status: data.status ?? "building", siteUrl: data.siteUrl, message: data.message };
}

/**
 * Poll the build status for the authed user's tenant. The backend resolves the
 * slug from the session token, so it isn't in the path (a `slug` query is sent
 * only as a hint / for service contexts).
 */
export async function getPublishStatus(slug: string, token?: string): Promise<PublishStatus> {
  const res = await fetch(getURL({ key: "TENANT_STATUS", queryParams: { slug } }), {
    method: "GET",
    headers: { ...authHeaders(publishToken(token)) },
  });
  const data = readStatusObject(await unwrap(res));
  return { status: data.status ?? "building", siteUrl: data.siteUrl, message: data.message };
}

/** The authed tenant's stored config, as returned by `GET /tenant_config`. */
export type TenantConfigRecord = {
  /** Tenant slug the backend resolved from the session token. */
  slug?: string;
  /** The stored AppConfig — the last-published config (render-ready). */
  tenantConfig: AppConfig;
  /** Current build state of that config. */
  status?: PublishStatus["status"];
  /** The live URL, set once the tenant has gone live (null/absent until then). */
  siteUrl?: string;
};

/** True when a tenantConfig is the backend's valid-empty first-use default (no real content). */
function isEmptyTenantConfig(cfg: AppConfig | undefined): boolean {
  if (!cfg) return true;
  const c = cfg as unknown as { tenant?: { name?: string }; content?: { hero?: { headline?: string; headlineRich?: { parts?: unknown[] } }; sections?: unknown[]; services?: unknown[] } };
  const hasName = !!c.tenant?.name?.trim();
  const hasHero = !!(c.content?.hero?.headline?.trim() || (c.content?.hero?.headlineRich?.parts?.length));
  const hasSections = !!(c.content?.sections?.length || c.content?.services?.length);
  return !hasName && !hasHero && !hasSections;
}

/**
 * Load the authed tenant's stored config — `GET /tenant_config` (docs/backend-
 * requirements.md §2). This is the LAST-PUBLISHED AppConfig the backend holds (or a
 * valid-empty default the backend creates on first use); the tenant is resolved from
 * the session token, so no slug is sent. It is deliberately SEPARATE from the user's
 * local in-progress draft (localStorage): it answers "what is stored/live?", never
 * "what unsaved edits do I have?".
 *
 * Returns null when there is no usable config to seed from — i.e. the response has no
 * `tenantConfig`, OR it's the backend's valid-empty first-use default — so the caller
 * falls back to the local `BLANK()` seed rather than seeding an empty record.
 */
export async function getTenantConfig(token?: string): Promise<TenantConfigRecord | null> {
  const res = await fetch(getURL({ key: "TENANT_CONFIG" }), {
    method: "GET",
    headers: { ...authHeaders(publishToken(token)) },
  });
  const data = await unwrap(res); // peels the universal { statusCode, data } envelope
  const cfg = data?.tenantConfig as AppConfig | undefined;
  if (!cfg || isEmptyTenantConfig(cfg)) return null;
  return {
    slug: data?.slug as string | undefined,
    tenantConfig: cfg,
    status: data?.status as PublishStatus["status"] | undefined,
    siteUrl: data?.siteUrl as string | undefined,
  };
}
