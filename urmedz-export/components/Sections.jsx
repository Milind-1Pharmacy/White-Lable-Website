// mid-sections.jsx — About + Services + Savings video + Stats
const { useState: useStateMS, useEffect: useEffectMS, useRef: useRefMS } = React;

// ─── About + Features (manifesto + pillars) ──────────────────────────
const PILLARS = [
  {
    n: '01',
    title: '50,000 sft fulfilment',
    body: 'Purpose-built centres in Bengaluru and Hyderabad. The widest array of medicines — sourced, traced, dispatched.',
    accent: '#F5A623',
    meta: 'Bengaluru · Hyderabad'
  },
  {
    n: '02',
    title: 'Affordable alternatives',
    body: 'Same composition. Often a fraction of the cost. Our engine surfaces the best generic and brand equivalents for every prescription.',
    accent: '#1FAFA6',
    meta: 'Avg. 48% saved'
  },
  {
    n: '03',
    title: 'Pharmacist-reviewed',
    body: 'Every order is checked by a registered pharmacist for dosage, interactions and validity — before it leaves the counter.',
    accent: '#E5326C',
    meta: '75+ registered'
  }
];

function About({ accent }) {
  return (
    <section className="section wrap" id="about">
      <div className="about2__head">
        <span className="eyebrow"><span className="dot"></span>About UrMedz · Est. 2024 · Bengaluru</span>
        <h2 className="about2__title">
          Medicines are <span className="serif-it">indispensable.</span><br/>
          <span className="serif-it" style={{ color: accent }}>Access</span> and <span className="serif-it" style={{ color: accent }}>affordability</span> change everything.
        </h2>
        <p className="about2__lede">
          The pharma sector is experiencing a much-needed transformation. UrMedz is the
          pharmacy-and-platform layer that brings a wide range of options — and real choice — to
          your doorstep.
        </p>
      </div>

      <div className="about2__pillars">
        {PILLARS.map((p, i) => (
          <div key={i} className="about2__pillar" style={{ '--pillar-accent': p.accent }}>
            <div className="about2__pillar-top">
              <span className="about2__pillar-badge">{p.n}</span>
              <span className="mono" style={{ fontSize: 11, letterSpacing: '.14em', color: 'var(--mute)' }}>{p.meta}</span>
            </div>
            <h3 className="about2__pillar-title">{p.title}</h3>
            <p className="body-s" style={{ margin: 0 }}>{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Services row ────────────────────────────────────────────────────
const SERVICES = [
  { slug: 'retail', title: 'Retail Stores', desc: 'A network of 25 stores and counting — neighbourhood pharmacies stocked with authentic medicines.' },
  { slug: 'quick-commerce', title: 'Quick Commerce', desc: "India's largest network of dark stores in pharma — same-day and on-demand delivery." },
  { slug: 'fulfillment', title: 'Hi-Tech Fulfilment', desc: "India's most advanced fulfilment centres in pharmaceutical distribution." },
  { slug: 'ecommerce', title: 'E-commerce Partner', desc: "India's largest pharmaceutical fulfilment partner in e-commerce." },
];

function Services({ accent }) {
  return (
    <section className="section section--cream" id="services">
      <div className="wrap">
        <div className="between" style={{ marginBottom: 56, alignItems: 'end' }}>
          <div style={{ maxWidth: 720 }}>
            <span className="eyebrow"><span className="dot"></span>What we do</span>
            <h2 className="h-display h-2" style={{ marginTop: 14 }}>
              Four pillars. <span className="serif-it">One network.</span>
            </h2>
          </div>
          <a className="btn btn-ghost" href="#services" style={{ background: 'transparent' }}>All services →</a>
        </div>
        <div className="services__grid">
          {SERVICES.map((s, i) => (
            <div key={s.slug} className="service">
              <div>
                <div className="service__num">{String(i + 1).padStart(2, '0')} / 04</div>
              </div>
              <div>
                <h3 className="service__title">{s.title}</h3>
                <p className="service__desc">{s.desc}</p>
              </div>
              <div className="service__arrow">↗</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Reveal hook (intersection observer) ─────────────────────────────
function useReveal() {
  const ref = useRefMS(null);
  const [seen, setSeen] = useStateMS(false);
  useEffectMS(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); io.disconnect(); }
    }, { threshold: 0.25 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, seen];
}

// ─── Animated number ─────────────────────────────────────────────────
function AnimNum({ value, fmt }) {
  const [ref, seen] = useReveal();
  const [n, setN] = useStateMS(0);
  useEffectMS(() => {
    if (!seen) return;
    const start = performance.now();
    const dur = 1600;
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, value]);
  return <span ref={ref}>{fmt ? fmt(n) : n}</span>;
}

// ─── Savings — price ladder ──────────────────────────────────────────
const SAVINGS = [
  { name: 'Diabetes Tablets',        cat: 'Cat. 01 · Metformin 500mg',          brand: 1240, urmedz: 670, pct: 46, color: '#F5A623' },
  { name: 'Blood Sugar Tablets',     cat: 'Cat. 02 · Glimepiride 2mg',          brand: 980,  urmedz: 431, pct: 56, color: '#1FAFA6' },
  { name: 'Blood Pressure Tablets',  cat: 'Cat. 03 · Amlodipine 5mg',           brand: 1480, urmedz: 296, pct: 80, color: '#6B3FA0' },
  { name: 'Gastric Relief Tablets',  cat: 'Cat. 04 · Pantoprazole 40mg',        brand: 1120, urmedz: 504, pct: 55, color: '#E5326C' },
];

function SavingsRow({ row, accent }) {
  const [ref, seen] = useReveal();
  return (
    <div className="sv__row" ref={ref}>
      <div className="sv__row-l">
        <span className="mono" style={{ fontSize: 11, letterSpacing: '.14em', color: 'var(--mute)' }}>{row.cat}</span>
        <span className="sv__row-name">{row.name}</span>
      </div>
      <div className="sv__row-ladder">
        <div className="sv__price sv__price--brand">
          <span className="sv__price-tag">Branded</span>
          <span className="sv__price-amt">₹<AnimNum value={row.brand} /></span>
        </div>
        <div className="sv__row-arrow">
          <span className="sv__arrow-line" />
          <span className="sv__arrow-pct" style={{ background: row.color }}>
            <AnimNum value={row.pct} />% saved
          </span>
        </div>
        <div className="sv__price sv__price--ours">
          <span className="sv__price-tag">UrMedz pick</span>
          <span className="sv__price-amt">₹<AnimNum value={row.urmedz} /></span>
        </div>
      </div>
      <div className="sv__row-bar">
        <div className="sv__row-bar-track">
          <div className="sv__row-bar-fill" style={{ width: seen ? row.pct + '%' : 0, background: row.color }} />
        </div>
      </div>
    </div>
  );
}

function Savings({ accent }) {
  const [playing, setPlaying] = useStateMS(false);
  return (
    <section className="section section--cream">
      <div className="wrap">
        <div className="sv__head">
          <div>
            <span className="eyebrow"><span className="dot"></span>Customer savings · Q1 2026</span>
            <h2 className="h-display h-2" style={{ marginTop: 14, maxWidth: 760 }}>
              Unraveling the magic of <span className="serif-it" style={{ color: accent }}>brand options</span> in medicines.
            </h2>
          </div>
          <p className="body" style={{ maxWidth: 380, margin: 0 }}>
            Prices vary dramatically from brand to brand, yet the composition stays identical. The
            UrMedz engine surfaces the optimal pick for every prescription.
          </p>
        </div>

        <div className="sv__ledger">
          <div className="sv__ledger-head">
            <span className="label">Receipt no. URM-SV-2026Q1</span>
            <span className="label">Avg. saving across 80,000 SKUs</span>
            <span className="sv__ledger-tag">
              <span className="serif-it" style={{ fontSize: 30, color: accent, lineHeight: 1 }}>59%</span>
              <span className="mono" style={{ fontSize: 10.5, letterSpacing: '.14em', color: 'var(--mute)' }}>avg.</span>
            </span>
          </div>
          {SAVINGS.map((s, i) => <SavingsRow key={i} row={s} accent={accent} />)}
          <div className="sv__ledger-foot">
            <span className="mono" style={{ fontSize: 11, letterSpacing: '.14em' }}>* Indicative for a 30-day pack. Actual savings vary by composition, strength &amp; location.</span>
          </div>
        </div>

        <div className="sv__video">
          {!playing && (
            <>
              <img src="https://www.urmedz.in/wp-content/uploads/2024/12/img.jpg" alt="Brand options unraveled" />
              <div className="sv__video-overlay">
                <span className="imgbox__tag" style={{ background: 'rgba(255,255,255,.92)', color: 'var(--ink)' }}>▶  2:14 · How brand options work</span>
                <div className="sv__video-bottom">
                  <h3 className="bts__headline" style={{ color: '#fff', maxWidth: 600 }}>
                    See it on the pharmacy floor.
                  </h3>
                  <button className="btn btn-accent" onClick={() => setPlaying(true)}>
                    <span style={{ width: 0, height: 0, borderLeft: '10px solid currentColor', borderTop: '7px solid transparent', borderBottom: '7px solid transparent', marginRight: 2 }}></span>
                    Watch the demo
                  </button>
                </div>
              </div>
            </>
          )}
          {playing && (
            <video controls autoPlay src="https://www.urmedz.in/wp-content/uploads/2024/11/ur_medz_video-3.mp4"
              poster="https://www.urmedz.in/wp-content/uploads/2024/12/img.jpg" />
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Big stats ───────────────────────────────────────────────────────
const STATS = [
  { v: 25, suf: '+', l: 'Retail stores', f: 'South India · Q2 2026' },
  { v: 10000, suf: '+', l: 'Orders fulfilled daily', f: 'Retail + quick commerce' },
  { v: 80000, l: 'SKUs catalogued', f: 'Medicines, OTC, wellness' },
  { v: 2, l: 'Fulfilment centres', f: 'Bengaluru &amp; Hyderabad' },
];

function fmtK(n) {
  if (n >= 1000) return Math.round(n / 100) / 10 + 'k';
  return n.toString();
}

function Stats({ accent, label = "By the numbers", headline }) {
  return (
    <section className="section section--ink">
      <div className="wrap">
        <div className="between" style={{ marginBottom: 56, alignItems: 'end', flexWrap: 'wrap' }}>
          <div>
            <span className="eyebrow" style={{ color: 'rgba(244,239,230,.5)' }}>
              <span className="dot" style={{ background: accent }}></span>{label}
            </span>
            {headline && (
              <h2 className="h-display h-2" style={{ color: 'var(--cream)', marginTop: 14 }}>{headline}</h2>
            )}
          </div>
          <p className="body" style={{ color: 'rgba(244,239,230,.62)', maxWidth: 380, margin: 0 }}>
            A pharmacy-and-platform footprint sized for the country, built quietly in the background.
          </p>
        </div>
        <div className="stats__grid" style={{ borderColor: 'rgba(244,239,230,.16)' }}>
          {STATS.map((s, i) => (
            <div key={i} className="stat-cell" style={{ borderColor: 'rgba(244,239,230,.16)' }}>
              <span className="v" style={{ color: 'var(--cream)' }}>
                <AnimNum value={s.v} fmt={fmtK} />
                {s.suf && <em style={{ color: accent }}>{s.suf}</em>}
              </span>
              <span className="l" style={{ color: 'var(--cream)' }}>{s.l}</span>
              <span className="f" dangerouslySetInnerHTML={{ __html: s.f }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { About, Services, Savings, Stats, useReveal, AnimNum });
