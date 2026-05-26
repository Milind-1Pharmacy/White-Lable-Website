/**
 * @file useFeatureFlag.ts
 * @description Reads a single feature flag from the config features object.
 * @responsibilities
 *  - Look up one named flag from tenant config features.
 *  - Return a safe boolean even when features is missing.
 * @dependencies Features type from config.types.
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import type { Features } from "@/types/config.types";

/**
 * useFeatureFlag - Returns whether a given config feature flag is enabled.
 * @param {Features} features - The tenant config features object.
 * @param {keyof Features} flag - The flag name to read.
 * @returns True if the flag is set and truthy, else false.
 */
export function useFeatureFlag(features: Features, flag: keyof Features): boolean {
  return Boolean(features?.[flag]);
}
