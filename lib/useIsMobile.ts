"use client";

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

export function useIsMobile(breakpoint: number = MOBILE_BREAKPOINT): boolean {
  return useSyncExternalStore(
    subscribe(breakpoint),
    getClientSnapshot(breakpoint),
    getServerSnapshot,
  );
}
