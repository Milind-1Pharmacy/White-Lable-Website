/**
 * @file MotionProvider.tsx
 * @description Client wrapper that refreshes ScrollTrigger on window resize.
 * @responsibilities
 *  - Listen for resize and refresh ScrollTrigger layout.
 *  - Clean up the listener on unmount.
 *  - Pass children through unchanged.
 * @dependencies React useEffect, ScrollTrigger from lib/motion
 * @author WhiteLabel Platform Team
 * @created 2026-05-26
 * @lastUpdated 2026-05-26
 */
"use client";

import { useEffect } from "react";

import { ScrollTrigger } from "@wl/render-engine/lib/motion";

type MotionProviderProps = {
  children: React.ReactNode;
};

/**
 * MotionProvider - Keeps GSAP ScrollTrigger positions correct across resizes.
 * @props {React.ReactNode} children - Subtree that uses scroll animations
 * @returns JSX element
 */
export function MotionProvider({ children }: MotionProviderProps) {
  useEffect(() => {
    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <>{children}</>;
}
