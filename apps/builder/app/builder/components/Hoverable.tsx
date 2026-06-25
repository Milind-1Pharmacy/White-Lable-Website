/**
 * @file Hoverable.tsx
 * @description A small wrapper that applies a `hover` style overlay on mouse
 *  enter — a faithful port of the original design's style-hover behaviour.
 * @dependencies react
 * @author WhiteLabel Platform Team
 * @created 2026-06-23
 */
"use client";

import React, { useState } from "react";

type HoverableProps = {
  as?: "button" | "div";
  style: React.CSSProperties;
  hover?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
};

export function Hoverable({ as = "div", style, hover, onClick, children }: HoverableProps) {
  const [h, setH] = useState(false);
  const Tag = as as keyof React.JSX.IntrinsicElements;
  // If the hover state restyles `borderColor` but the base uses the `border`
  // shorthand, expand the base to longhand so React never removes a longhand while
  // a conflicting shorthand stays (which triggers a console warning + style bugs).
  let base = style;
  if (hover && "borderColor" in hover && typeof style.border === "string") {
    const { border, ...rest } = style;
    const m = /^\s*(\S+)\s+(\S+)\s+(.+)$/.exec(border as string);
    base = m
      ? { ...rest, borderWidth: m[1], borderStyle: m[2], borderColor: m[3] }
      : style;
  }
  return React.createElement(
    Tag,
    {
      style: h && hover ? { ...base, ...hover } : base,
      onClick,
      onMouseEnter: () => setH(true),
      onMouseLeave: () => setH(false),
    },
    children
  );
}
