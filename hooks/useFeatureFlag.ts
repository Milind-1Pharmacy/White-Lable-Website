import type { Features } from "@/types/config.types";

export function useFeatureFlag(features: Features, flag: keyof Features): boolean {
  return Boolean(features?.[flag]);
}
