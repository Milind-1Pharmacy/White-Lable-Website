/**
 * @file versionConfig.ts
 * @description Single selector for the active API environment, mirroring the
 *  1p-b2c-app `versionConfig.ts` contract. The builder's image-upload layer
 *  resolves its base URL from whichever environment this names.
 * @responsibilities
 *  - Expose `currentServerVersion` — the active environment key.
 *  - Allow a deploy/runtime override via `NEXT_PUBLIC_API_ENV` without a code edit.
 * @dependencies ./env (AppEnv type only)
 * @author WhiteLabel Platform Team
 * @created 2026-06-23
 */
import type { AppEnv } from "./env";

/** Environments the override may name (kept in sync with the ENV map in env.ts). */
const VALID: AppEnv[] = ["prod", "beta", "test", "atest", "stagging", "gamma", "theta"];

/** Read an optional build-time override; fall back to a non-prod env. */
function resolve(): AppEnv {
  const override = process.env.NEXT_PUBLIC_API_ENV as AppEnv | undefined;
  if (override && VALID.indexOf(override) >= 0) return override;
  // Non-prod default so builder uploads never touch prod unless
  // NEXT_PUBLIC_API_ENV=prod is set explicitly.
  return "gamma";
}

/** The active environment (non-prod by default; overridable via NEXT_PUBLIC_API_ENV). */
export const currentServerVersion: AppEnv = resolve();
