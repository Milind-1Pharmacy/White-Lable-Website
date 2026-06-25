/**
 * @file utils.ts
 * @description Shared utility helpers for the platform.
 * @responsibilities
 *  - Merge Tailwind class names without conflicts.
 * @dependencies clsx, tailwind-merge
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * cn - Merges class names and resolves Tailwind conflicts.
 * @param {ClassValue[]} inputs - Class values to combine.
 * @returns A single merged class string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
