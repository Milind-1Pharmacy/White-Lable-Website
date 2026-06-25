/**
 * @file endpoints.ts
 * @description Central endpoint-path map + URL builder, ported from 1p-b2c-app's
 *  `APIURLCollection.ts`. Keeps endpoint paths in one place and composes the
 *  base URL + path + query into a full request URL.
 * @responsibilities
 *  - Hold the endpoint path constants the builder needs (currently UPLOAD_URL).
 *  - `getURL({key, pathParams, queryParams})` — build a full URL against the env base.
 * @dependencies ./env
 * @author WhiteLabel Platform Team
 * @created 2026-06-23
 */
import { env } from "./env";

/** Endpoint path constants (mirrors the b2c key→path map). */
const APIURLCollection: Record<string, string> = {
  UPLOAD_URL: "upload_url",
  // Publish pipeline (see docs/backend-requirements.md §2).
  // Builder LOAD — GET the authed tenant's stored config ({slug, tenantConfig, status,
  // siteUrl}); the last-published AppConfig, or a valid-empty default on first use. The
  // tenant is resolved from the session token, so the slug is NOT in the path.
  TENANT_CONFIG: "tenant_config",
  TENANT_PUBLISH: "tenant_config/publish",
  TENANT_STATUS: "tenant_config/status",
};

/** Options accepted by the URL builder. */
export type GetURLOptions = {
  key: keyof typeof APIURLCollection | string;
  pathParams?: string | number | null;
  queryParams?: Record<string, string | number | null | undefined>;
};

/**
 * Build a full request URL: base + endpoint path + optional path/query params.
 * Faithful to the b2c `getURL` composition.
 */
export const getURL = (options: GetURLOptions): string => {
  const { key, pathParams, queryParams } = options;
  const basePath = APIURLCollection[key] ?? key;
  const pathWithParams = basePath + (pathParams != null ? `/${pathParams}` : "");
  // Encode keys + values so a param value can't inject extra params / break the URL.
  const params = new URLSearchParams();
  Object.entries(queryParams || {}).forEach(([k, v]) => {
    if (v != null) params.set(k, String(v));
  });
  const query = params.toString() ? "?" + params.toString() : "";
  return env.baseURL + pathWithParams + query;
};
