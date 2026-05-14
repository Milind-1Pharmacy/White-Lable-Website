import type { ServiceItem, ServicesMeta } from "@/types/config.types";
import { renderRichHeading } from "@/modules/RichHeading";

type ServicesProps = {
  data: ServiceItem[];
  meta?: ServicesMeta;
};

export function Services({ data, meta }: ServicesProps) {
  if (!data?.length) return null;

  const heading = renderRichHeading(meta?.heading);

  return (
    <section className="section section--cream" id="services">
      <div className="wrap">
        <div
          className="between"
          style={{ marginBottom: 64, alignItems: "end" }}
        >
          <div style={{ maxWidth: 720 }}>
            {meta?.eyebrow && (
              <span className="eyebrow">
                <span className="dot" />
                {meta.eyebrow}
              </span>
            )}
            {heading && (
              <h2 className="h-display h-2" style={{ marginTop: 14 }}>
                {heading}
              </h2>
            )}
          </div>
          {meta?.ctaLabel && (
            <a
              className="btn btn-ghost mobile-btn"
              href={meta.ctaHref ?? "/services"}
              style={{ background: "transparent", marginTop: 16 }}
            >
              {meta.ctaLabel}
            </a>
          )}
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
