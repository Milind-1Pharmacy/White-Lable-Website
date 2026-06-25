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
 * @dependencies ./endpoints
 * @author WhiteLabel Platform Team
 * @created 2026-06-23
 */
import type { AppConfig } from "@/types/config.types";
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

/** Unwrap the universal envelope: { statusCode, data } | { statusCode, error }. */
async function unwrap(res: Response): Promise<unknown> {
  const json = await res.json().catch(() => null);
  if (!res.ok || (json && json.error)) {
    const msg = json?.error?.userMessage || `Request failed (HTTP ${res.status})`;
    throw new Error(msg);
  }
  return json?.data ?? json;
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
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  const data = (await unwrap(res)) as Partial<PublishStatus> | null;
  return { status: data?.status ?? "building", siteUrl: data?.siteUrl, message: data?.message };
}

/**
 * Poll the build status for the authed user's tenant. The backend resolves the
 * slug from the session token, so it isn't in the path (a `slug` query is sent
 * only as a hint / for service contexts).
 */
export async function getPublishStatus(slug: string, token?: string): Promise<PublishStatus> {
  const res = await fetch(getURL({ key: "TENANT_STATUS", queryParams: { slug } }), {
    method: "GET",
    headers: { ...authHeaders(token) },
  });
  const data = (await unwrap(res)) as Partial<PublishStatus> | null;
  return { status: data?.status ?? "building", siteUrl: data?.siteUrl, message: data?.message };
}
