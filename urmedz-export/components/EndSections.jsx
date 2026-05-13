// end-sections.jsx — Why, How it works, Testimonials, FAQ, Footer
const { useState: useStateES, useEffect: useEffectES, useRef: useRefES } = React;

// ─── Why UrMedz ──────────────────────────────────────────────────────
const WHY = [
  { t: 'Authenticity at the source', d: 'Every medicine on our shelves is sourced from licensed distributors and traceable to its manufacturer — no grey-market shortcuts.' },
  { t: 'Scale where it matters', d: 'A retail-plus-fulfilment footprint means the medicine you need is rarely more than a few kilometres away.' },
  { t: 'Built for compliance', d: 'Cold-chain handling, batch traceability and audit-ready dispatch — built into every store and centre.' },
  { t: 'An AI-assisted platform', d: 'Our SaaS platform helps partner pharmacies forecast demand, manage inventory and stay compliant — quietly, in the background.' },
];

function Why({ accent }) {
  return (
    <section className="section section--cream">
      <div className="wrap">
        <div className="between" style={{ alignItems: 'end', marginBottom: 56, flexWrap: 'wrap' }}>
          <div>
            <span className="eyebrow"><span className="dot"></span>Why UrMedz</span>
            <h2 className="h-display h-2" style={{ marginTop: 14, maxWidth: 720 }}>
              Pharmacy infrastructure, <span className="serif-it" style={{ color: accent }}>quietly</span> done right.
            </h2>
          </div>
        </div>
        <div className="why__grid">
          {WHY.map((w, i) => (
            <div key={i} className="why-cell">
              <div className="num">{String(i + 1).padStart(2, '0')}</div>
              <h4>{w.t}</h4>
              <p className="body-s">{w.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How it works ────────────────────────────────────────────────────
const STEPS = [
  { n: 1, t: 'Browse or upload', d: "Search our catalogue or upload a doctor's prescription — we'll match it to authentic, in-stock medicines." },
  { n: 2, t: 'Pharmacist reviews it', d: "Every order is checked by a registered pharmacist before it's dispensed — interactions, dosage, validity." },
  { n: 3, t: 'Delivered or pickup', d: 'Choose home delivery from your nearest UrMedz store, or pick it up on your way — usually within hours.' },
];

function How({ accent }) {
  return (
    <section className="section">
      <div className="wrap">
        <div className="between" style={{ alignItems: 'end', marginBottom: 32, flexWrap: 'wrap' }}>
          <div>
            <span className="eyebrow"><span className="dot"></span>How it works</span>
            <h2 className="h-display h-2" style={{ marginTop: 14 }}>
              Prescription to <span className="serif-it" style={{ color: accent }}>pocket</span> — in three steps.
            </h2>
          </div>
          <a href="#order" className="btn btn-primary">Start an order →</a>
        </div>
        <div className="steps">
          {STEPS.map(s => (
            <div key={s.n} className="step">
              <div className="step__n">Step {String(s.n).padStart(2, '0')} / 03</div>
              <h4>{s.t}</h4>
              <p className="body-s">{s.d}</p>
              <div className="step__big">{String(s.n).padStart(2, '0')}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ────────────────────────────────────────────────────
const TESTIMONIALS = [
  { q: "Knowing that every strip I pick up is genuine — and that a real pharmacist has looked at the prescription — is the part I'd been missing for years.", n: 'Anika Rao', r: 'Customer, Bengaluru' },
  { q: 'We moved our store onto the UrMedz platform and inventory finally stopped being a guessing game. The forecasting alone paid for itself in a quarter.', n: 'Rohit Menon', r: 'Partner pharmacy, Hyderabad' },
  { q: 'What stands out is the discipline — temperature logs, batch numbers, dispatch trails. It feels less like a pharmacy chain and more like infrastructure.', n: 'Dr. Priya Iyer', r: 'Consulting physician' },
];

function Testimonials({ accent }) {
  const [i, setI] = useStateES(0);
  const total = TESTIMONIALS.length;
  return (
    <section className="section section--ink">
      <div className="wrap">
        <div className="between" style={{ alignItems: 'end', marginBottom: 16, flexWrap: 'wrap' }}>
          <div>
            <span className="eyebrow" style={{ color: 'rgba(244,239,230,.5)' }}><span className="dot" style={{ background: accent }}></span>Testimony · 2026</span>
            <h2 className="h-display h-2" style={{ marginTop: 14, color: 'var(--cream)' }}>
              In the words of <span className="serif-it" style={{ color: accent }}>our customers</span>.
            </h2>
          </div>
          <div className="row" style={{ gap: 14, alignItems: 'center' }}>
            <span className="tm__count">{String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
            <div className="tm__nav">
              <button aria-label="Previous" onClick={() => setI((i - 1 + total) % total)}>‹</button>
              <button aria-label="Next" onClick={() => setI((i + 1) % total)}>›</button>
            </div>
          </div>
        </div>
        <div className="tm__viewport">
          <div className="tm__track" style={{ transform: `translateX(-${i * 100}%)` }}>
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="tm__card">
                <p className="tm__quote">{t.q}</p>
                <div className="tm__attr">
                  <span className="tm__name">— {t.n}</span>
                  <span className="tm__role">{t.r}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ accordion ───────────────────────────────────────────────────
const FAQS = [
  { q: 'Where do you source your medicines from?', a: 'All medicines on the UrMedz network are sourced from licensed distributors and authorised manufacturer channels. Every batch is traceable end to end, and our stores and fulfilment centres are audited against regulatory standards.' },
  { q: 'How do you handle prescriptions?', a: "Prescription-only medicines require a valid doctor's prescription. You can upload it through our app or hand it in at any UrMedz store. A registered pharmacist reviews every prescription before the order is dispensed." },
  { q: 'Which areas do you deliver to?', a: 'Quick commerce delivery is available across Bengaluru and Hyderabad today, with same-day or next-day delivery in several other cities. You can check live coverage for your pin code on the UrMedz app.' },
  { q: 'What is your return policy?', a: 'Medicines can be returned only in line with regulatory guidelines — typically unopened items in original packaging, returned within seven days, with a valid invoice. Cold-chain and prescription-controlled items are non-returnable for safety reasons.' },
  { q: 'How can I get in touch?', a: 'You can reach our support team via the contact page, walk in to any UrMedz retail store, or call our customer-care line for help with an order, a prescription, or a partnership query.' },
];

function Faq({ accent }) {
  const [open, setOpen] = useStateES(0);
  return (
    <section className="section" id="faq">
      <div className="wrap">
        <div className="about__grid" style={{ alignItems: 'start', gap: 64 }}>
          <div>
            <span className="eyebrow"><span className="dot"></span>Frequently asked</span>
            <h2 className="h-display h-1" style={{ marginTop: 18 }}>
              Questions,<br/><span className="serif-it" style={{ color: accent }}>answered.</span>
            </h2>
            <p className="body" style={{ marginTop: 20, maxWidth: 360 }}>
              Anything we missed? Reach out — our team replies within a working day.
            </p>
            <a className="btn btn-ghost" href="#contact" style={{ marginTop: 20 }}>Contact support →</a>
          </div>
          <div className="faq__list">
            {FAQS.map((f, i) => (
              <div key={i} className={"faq__item" + (open === i ? " is-open" : "")}>
                <button className="faq__btn" onClick={() => setOpen(open === i ? -1 : i)}>
                  <span className="faq__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="faq__q">{f.q}</span>
                  <span className="faq__plus">+</span>
                </button>
                <div className="faq__a">
                  <div>
                    <div className="faq__a-inner body">{f.a}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────
function Footer({ accent }) {
  return (
    <footer className="footer" id="contact">
      <div className="wrap">
        <div className="between" style={{ alignItems: 'end', flexWrap: 'wrap', gap: 32 }}>
          <h2 className="h-display h-big" style={{ maxWidth: 980, lineHeight: 0.92 }}>
            Authentic medicines,<br/><span className="serif-it" style={{ color: accent }}>delivered with</span> care.
          </h2>
          <a className="btn btn-accent" href="#order" style={{ padding: '18px 28px' }}>Start an order →</a>
        </div>

        <div className="footer__grid">
          <div className="footer__col">
            <div style={{ background: 'var(--cream)', borderRadius: 14, padding: '18px 22px', display: 'inline-block', marginBottom: 22 }}>
              <img src="assets/urmedz-logo-full.png" alt="UrMedz Retail Pvt. Ltd." style={{ height: 56, width: 'auto', display: 'block' }} />
            </div>
            <p className="body-s" style={{ color: 'rgba(244,239,230,.55)', maxWidth: 320 }}>
              A pharmacy &amp; health-tech network — retail, quick commerce and hi-tech fulfilment for authentic medicines.
            </p>
            <div style={{ marginTop: 24, fontSize: 13, color: 'rgba(244,239,230,.7)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="mono" style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(244,239,230,.45)' }}>Head office</span>
              <span>Cheemasandra, Whitefield</span>
              <span>Bengaluru 560049, India</span>
              <span style={{ marginTop: 8 }}>care@urmedz.example · +91 80 4567 0049</span>
            </div>
          </div>
          <div className="footer__col">
            <h5>Company</h5>
            <ul>
              <li><a href="#about">About</a></li>
              <li><a href="#team">Team</a></li>
              <li><a href="#contact">Careers</a></li>
              <li><a href="#contact">Press</a></li>
            </ul>
          </div>
          <div className="footer__col">
            <h5>Services</h5>
            <ul>
              <li><a href="#services">Retail stores</a></li>
              <li><a href="#services">Quick commerce</a></li>
              <li><a href="#fulfilment">Fulfilment</a></li>
              <li><a href="#services">E-commerce partner</a></li>
            </ul>
          </div>
          <div className="footer__col">
            <h5>Resources</h5>
            <ul>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#contact">Support</a></li>
              <li><a href="#">Privacy</a></li>
              <li><a href="#">Terms</a></li>
            </ul>
          </div>
        </div>

        <p className="footer__disc">
          UrMedz is an informational platform connecting customers with licensed pharmacies and partner clinicians. The content on this website is intended for general awareness only and is not a substitute for professional medical diagnosis, advice or treatment. Always consult a qualified medical practitioner for any health concern. Prescription medicines are dispensed by licensed pharmacies in accordance with applicable regulations and only against a valid prescription.
        </p>

        <div className="footer__bottom">
          <span>© 2026 UrMedz Healthcare Pvt. Ltd.</span>
          <span>RX-001 · DRG-LIC-KA · ISO 9001:2015</span>
        </div>
      </div>
    </footer>
  );
}

// ─── Sticky bottom CTA bar ───────────────────────────────────────────
function StickyCta({ accent }) {
  const [show, setShow] = useStateES(false);
  useEffectES(() => {
    const on = () => {
      const y = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setShow(y > 600 && y < h - 600);
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <div className={"cta-bar" + (show ? "" : " is-hidden")}>
      <span className="pulse" style={{ background: accent }}></span>
      <span style={{ opacity: 0.85 }}>The UrMedz app is here.</span>
      <a href="#app" className="btn btn-accent" style={{ padding: '8px 14px', fontSize: 13 }}>Download →</a>
    </div>
  );
}

Object.assign(window, { Why, How, Testimonials, Faq, Footer, StickyCta });
