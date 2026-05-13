import type { AboutContent } from "@/types/config.types";

type AboutProps = {
  data: AboutContent;
};

export function About({ data }: AboutProps) {
  const pillars = data.pillars ?? [];

  return (
    <section className="section wrap" id="about">
      <div className="about2__head">
        <span className="eyebrow">
          <span className="dot" />
          About UrMedz · Est. 2024 · Bengaluru
        </span>
        <h2 className="about2__title">
          Medicines are <span className="serif-it">indispensable.</span><br />
          <span className="serif-it" style={{ color: "var(--accent)" }}>Access</span> and{" "}
          <span className="serif-it" style={{ color: "var(--accent)" }}>affordability</span> change everything.
        </h2>
        <p className="about2__lede">
          The pharma sector is experiencing a much-needed transformation. UrMedz is the
          pharmacy-and-platform layer that brings a wide range of options — and real choice — to
          your doorstep.
        </p>
      </div>

      {pillars.length > 0 && (
        <div className="about2__pillars">
          {pillars.map((p, idx) => (
            <div key={idx} className="about2__pillar" style={{ ["--pillar-accent" as string]: p.accent }}>
              <div className="about2__pillar-top">
                <span className="about2__pillar-badge">{p.n}</span>
                <span className="mono" style={{ fontSize: 11, letterSpacing: ".14em", color: "var(--mute)" }}>{p.meta}</span>
              </div>
              <h3 className="about2__pillar-title">{p.title}</h3>
              <p className="body-s" style={{ margin: 0 }}>{p.body}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
