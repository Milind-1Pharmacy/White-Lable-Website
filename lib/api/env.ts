/**
 * @file env.ts
 * @description Per-environment API configuration, ported from 1p-b2c-app's
 *  `src/config/env.ts`. Single source of truth for base URLs + S3 metadata; the
 *  active environment is chosen in `versionConfig.ts`.
 * @responsibilities
 *  - Define every server environment (prod / beta / test / stagging / gamma / theta).
 *  - Expose the resolved `env` for the active environment + static API metadata.
 * @dependencies ./versionConfig (active-environment selector only)
 * @author WhiteLabel Platform Team
 * @created 2026-06-23
 */
import { currentServerVersion } from "./versionConfig";

/** Shape of one environment's settings. */
export interface EnvConfig {
  /** API base URL (trailing slash expected by the URL builder). */
  baseURL: string;
}

/**
 * Per-environment configuration (base URLs mirror 1p-b2c-app). Add an
 * environment here and it becomes selectable via `currentServerVersion`.
 */
export const ENV = {
  prod: { baseURL: "https://d7oupb2fs2659.cloudfront.net/" },
  beta: { baseURL: "https://apiv2.1pharmacy.io/beta/" },
  test: { baseURL: "https://apiv2.1pharmacy.io/test/" },
  // Dedicated dev stage for the tenant-publish pipeline (CodeBuild trigger). The
  // backend exposes tenant_config / tenant_config/publish / tenant_config/status here.
  atest: { baseURL: "https://apiv2.1pharmacy.io/a-test/" },
  stagging: { baseURL: "https://apiv2.1pharmacy.io/stagging/" },
  gamma: { baseURL: "https://apiv2.1pharmacy.io/gamma/" },
  theta: { baseURL: "https://apiv2.1pharmacy.io/theta/" },
} as const satisfies Record<string, EnvConfig>;

/** Valid environment names (derived from ENV, so the two never drift). */
export type AppEnv = keyof typeof ENV;

/** Static API host metadata, shared across all environments. */
export const API_META = {
  host: "apiv2.1pharmacy.io",
  s3Base: "https://1p-b2c-files.s3.amazonaws.com/",
} as const;

/** Resolved config for the currently-active environment. */
export const env: EnvConfig = ENV[currentServerVersion];
