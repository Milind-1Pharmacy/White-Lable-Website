"use client";

import { useEffect } from "react";

import { ScrollTrigger } from "@/lib/motion";

type MotionProviderProps = {
  children: React.ReactNode;
};

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
