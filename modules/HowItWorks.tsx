import Link from "next/link";
import type { HowItWorksSectionData } from "@/types/config.types";

type HowItWorksProps = {
  data: HowItWorksSectionData;
};

export function HowItWorks({ data }: HowItWorksProps) {
  return (
    <section className="section">
      <div className="wrap">
        <div className="between section-head" style={{ marginBottom: 32, alignItems: "end", flexWrap: "wrap" }}>
          <div>
            <span className="eyebrow">
              <span className="dot" />
              How it works
            </span>
            <h2 className="h-display h-2" style={{ marginTop: 14 }}>
              Prescription to{" "}
              <span className="serif-it" style={{ color: "var(--accent)" }}>pocket</span> — in three steps.
            </h2>
          </div>
          <Link href="/contact" className="btn btn-primary section-head__sub">Start an order →</Link>
        </div>
        <div className="steps">
          {data.steps.map((s) => (
            <div key={s.step} className="step">
              <div className="step__n">Step {String(s.step).padStart(2, "0")} / {String(data.steps.length).padStart(2, "0")}</div>
              <h4>{s.title}</h4>
              <p className="body-s">{s.description}</p>
              <div className="step__big">{String(s.step).padStart(2, "0")}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
