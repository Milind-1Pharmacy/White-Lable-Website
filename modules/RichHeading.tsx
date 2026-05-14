import { Fragment } from "react";
import type { RichHeading as RichHeadingT } from "@/types/config.types";

type Props = {
  value?: RichHeadingT;
  fallback?: string;
};

export function renderRichHeading(value: RichHeadingT | undefined): React.ReactNode {
  if (!value?.parts?.length) return null;
  return value.parts.map((p, i) => {
    const content = p.text;
    let node: React.ReactNode = content;
    if (p.emphasis === "italic-accent") {
      node = (
        <span className="serif-it" style={{ color: "var(--accent)" }}>
          {content}
        </span>
      );
    } else if (p.emphasis === "italic") {
      node = <span className="serif-it">{content}</span>;
    } else if (p.emphasis === "accent") {
      node = <span style={{ color: "var(--accent)" }}>{content}</span>;
    }
    return (
      <Fragment key={i}>
        {node}
        {p.br && <br />}
      </Fragment>
    );
  });
}

export function RichHeading({ value, fallback }: Props) {
  const rendered = renderRichHeading(value);
  if (rendered) return <>{rendered}</>;
  if (fallback) return <>{fallback}</>;
  return null;
}
