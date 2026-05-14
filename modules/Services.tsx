import type { ServiceItem } from "@/types/config.types";

type ServicesProps = {
  data: ServiceItem[];
};

export function Services({ data }: ServicesProps) {
  if (!data?.length) return null;

  return (
    <section className="section section--cream" id="services">
      <div className="wrap">
        <div
          className="between"
          style={{ marginBottom: 64, alignItems: "end" }}
        >
          <div style={{ maxWidth: 720 }}>
            <span className="eyebrow">
              <span className="dot" />
              What we do
            </span>
            <h2 className="h-display h-2" style={{ marginTop: 14 }}>
              Four pillars. <span className="serif-it">One network.</span>
            </h2>
          </div>
          <a
            className="btn btn-ghost mobile-btn"
            href="/services"
            style={{ background: "transparent", marginTop: 16 }}
          >
            All services →
          </a>
        </div>
        <div className="services__grid">
          {data.map((s, i) => (
            <div key={i} className="service">
              <div>
                <div className="service__num">
                  {String(i + 1).padStart(2, "0")} /{" "}
                  {String(data.length).padStart(2, "0")}
                </div>
              </div>
              <div>
                <h3 className="service__title">{s.title}</h3>
                <p className="service__desc">{s.description}</p>
              </div>
              <div className="service__arrow">↗</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
