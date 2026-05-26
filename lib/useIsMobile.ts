"use client";

/**
 * @file useIsMobile.ts
 * @description Hook reporting whether the viewport is below a breakpoint.
 * @responsibilities
 *  - Track a max-width media query via useSyncExternalStore.
 *  - Return false on the server to avoid hydration mismatch.
 * @dependencies react useSyncExternalStore
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */

import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 560;

function subscribe(breakpoint: number) {
  return (onChange: () => void) => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  };
}

function getClientSnapshot(breakpoint: number) {
  return () => window.matchMedia(`(max-width: ${breakpoint}px)`).matches;
}

const getServerSnapshot = () => false;

/**
 * useIsMobile - Reports whether the viewport is at or below the breakpoint.
 * @param {number} [breakpoint] - Max-width in px (defaults to 560).
 * @returns True when the viewport is mobile-sized.
 */
export function useIsMobile(breakpoint: number = MOBILE_BREAKPOINT): boolean {
  return useSyncExternalStore(
    subscribe(breakpoint),
    getClientSnapshot(breakpoint),
    getServerSnapshot,
  );
}
