import type { LegalBlock, LegalPage } from "@/types/config.types";

type Props = {
  data?: LegalPage;
};

function renderBlock(block: string | LegalBlock, key: number, leading?: boolean) {
  if (typeof block === "string") {
    return (
      <p key={key} className={leading ? "font-medium" : undefined}>
        {block}
      </p>
    );
  }
  if (block.type === "p") {
    return (
      <p key={key} className={leading ? "font-medium" : undefined}>
        {block.text}
      </p>
    );
  }
  if (block.type === "list") {
    const ListTag = block.ordered ? "ol" : "ul";
    return (
      <ListTag
        key={key}
        className={
          (block.ordered
            ? "list-decimal "
            : "list-disc ") +
          "ml-5 space-y-2 text-[var(--brand-text)]/85"
        }
      >
        {block.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ListTag>
    );
  }
  return null;
}

export function LegalArticle({ data }: Props) {
  if (!data) return null;
  const top = data.body ?? [];
  const sections = data.sections ?? [];

  return (
    <article className="prose prose-neutral max-w-3xl space-y-5 text-[var(--brand-text)]/85">
      {data.intro && <p className="font-medium">{data.intro}</p>}
      {top.map((b, i) =>
        renderBlock(b, i, i === 0 && !data.intro && top.length > 1),
      )}
      {sections.map((s, i) => (
        <section key={i} className="space-y-3">
          {s.heading && (
            <h3 className="text-xl font-semibold text-[var(--brand-text)]">
              {s.heading}
            </h3>
          )}
          {s.subheading && (
            <h4 className="text-base font-medium text-[var(--brand-text)]/90">
              {s.subheading}
            </h4>
          )}
          {s.body.map((b, j) => renderBlock(b, j))}
        </section>
      ))}
    </article>
  );
}
