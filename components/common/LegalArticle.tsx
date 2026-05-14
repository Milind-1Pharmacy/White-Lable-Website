import type { LegalPage } from "@/types/config.types";

type Props = {
  data?: LegalPage;
};

export function LegalArticle({ data }: Props) {
  if (!data) return null;
  const top = data.body ?? [];
  const sections = data.sections ?? [];

  return (
    <article className="prose prose-neutral max-w-3xl space-y-4 text-[var(--brand-text)]/85">
      {top.map((p, i) => (
        <p key={i} className={i === 0 && top.length > 1 ? "font-medium" : ""}>
          {p}
        </p>
      ))}
      {sections.map((s, i) => (
        <div key={i}>
          {s.heading && <h3>{s.heading}</h3>}
          {s.body.map((p, j) => (
            <p key={j}>{p}</p>
          ))}
        </div>
      ))}
    </article>
  );
}
