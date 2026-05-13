// nav-hero.jsx — sticky nav, rotating hero (3 variants), app strip
const { useState, useEffect, useRef } = React;

// ─── Sticky nav ──────────────────────────────────────────────────────
function Nav({ accent, isOverDark }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 60);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <header className={"nav" + (scrolled ? " is-scrolled" : "") + (isOverDark && !scrolled ? " is-over-dark" : "")}>
      <a href="#top" className="nav__brand">
        <img src="assets/urmedz-logo-full.png" alt="UrMedz Retail Pvt. Ltd." className="nav__logo-full" />
        <img src="assets/urmedz-icon.png" alt="UrMedz" className="nav__mark" />
      </a>
      <nav className="nav__links">
        <a href="#about">About</a>
        <a href="#services">Services</a>
        <a href="#fulfilment">Fulfilment</a>
        <a href="#team">Team</a>
        <a href="#faq">FAQ</a>
        <a href="#contact">Contact</a>
      </nav>
      <div className="nav__cta">
        <a href="#app" className="btn btn-ghost" style={{ padding: '10px 16px' }}>Get the app</a>
        <a href="#order" className="btn btn-primary" style={{ padding: '10px 18px' }}>Order now →</a>
      </div>
    </header>
  );
}

// ─── Hero — editorial (default) ──────────────────────────────────────
const HERO_SLIDES = [
  {
    img: 'https://www.urmedz.in/wp-content/uploads/2024/12/banners_final-03-1jpg.jpg',
    tag: 'Authentic · Traceable',
    cap: 'Authentic medicines at your fingertips',
  },
  {
    img: 'https://www.urmedz.in/wp-content/uploads/2024/10/banners-new.jpg',
    tag: 'Quick commerce',
    cap: 'Same-day delivery, neighbourhood-fast',
  },
  {
    img: 'https://www.urmedz.in/wp-content/uploads/2024/10/bnr2-2.jpg',
    tag: 'Hi-tech fulfilment',
    cap: "India's most advanced pharma centres",
  },
];

function HeroEditorial({ accent }) {
  const [i, setI] = useState(0);
  const timer = useRef(null);
  useEffect(() => {
    clearInterval(timer.current);
    timer.current = setInterval(() => setI(v => (v + 1) % HERO_SLIDES.length), 5500);
    return () => clearInterval(timer.current);
  }, []);
  const go = (n) => { clearInterval(timer.current); setI((n + HERO_SLIDES.length) % HERO_SLIDES.length); };

  return (
    <section className="hero wrap" id="top">
      <div className="hero__grid">
        <div className="hero__copy">
          <div className="row" style={{ gap: 14 }}>
            <span className="eyebrow"><span className="dot"></span>Pharmacy &amp; Health-Tech · Est. 2024</span>
          </div>

          <h1 className="hero__h">
            Authentic<br/>
            medicines, <em>fingertip-</em><br/>
            fast.
          </h1>

          <p className="body-l" style={{ maxWidth: 540 }}>
            UrMedz is a pharmacy network — retail stores, quick commerce and hi-tech fulfilment
            centres bringing traceable, licensed medicines to your doorstep across South India.
          </p>

          <div className="row" style={{ gap: 12 }}>
            <a className="btn btn-primary" href="#order">Order on the app <span style={{ marginLeft: 4 }}>→</span></a>
            <a className="btn btn-ghost" href="#services">Explore services</a>
          </div>

          <div className="hero__meta">
            <div className="stack">
              <span className="num">25<em style={{ color: accent, fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>+</em></span>
              <span className="lbl">Retail stores across South India</span>
            </div>
            <div className="stack">
              <span className="num">10k<em style={{ color: accent, fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>/day</em></span>
              <span className="lbl">Orders dispensed by licensed pharmacists</span>
            </div>
            <div className="stack">
              <span className="num">80k</span>
              <span className="lbl">SKUs — medicines, OTC &amp; wellness</span>
            </div>
          </div>
        </div>

        <div className="hero__media">
          {HERO_SLIDES.map((s, idx) => (
            <div key={idx} className={"slide" + (idx === i ? " is-active" : "")}>
              <img src={s.img} alt={s.cap} />
              <div className="overlay" />
            </div>
          ))}
          <span className="badge">
            <span className="dot" style={{ background: accent }}></span>
            {HERO_SLIDES[i].tag}
          </span>
          <div className="arr">
            <button aria-label="Previous" onClick={() => go(i - 1)}>‹</button>
            <button aria-label="Next" onClick={() => go(i + 1)}>›</button>
          </div>
          <div className="dots">
            {HERO_SLIDES.map((_, idx) => (
              <button key={idx} aria-label={"Slide " + (idx + 1)}
                className={idx === i ? "is-active" : ""}
                onClick={() => go(idx)} />
            ))}
          </div>
        </div>
      </div>

      <div className="hero__rail" style={{ marginTop: 56 }}>
        <span className="pill"><span style={{ width: 6, height: 6, borderRadius: 999, background: accent, display: 'inline-block', marginRight: 4 }}></span>Live</span>
        <span className="body-s">Now serving Bengaluru &amp; Hyderabad. Pin-code check in the app.</span>
        <span className="sep" />
        <span className="row" style={{ gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: '#F5A623' }}></span>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: '#6B3FA0' }}></span>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: '#1FAFA6' }}></span>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: '#E5326C' }}></span>
        </span>
        <span className="body-s mono" style={{ fontSize: 12, letterSpacing: '.06em' }}>RX-001 · DRG-LIC-KA · ISO 9001:2015</span>
      </div>
    </section>
  );
}

// ─── Hero — full-bleed photo with overlay ─────────────────────────────
function HeroFullBleed({ accent }) {
  const [i, setI] = useState(0);
  const timer = useRef(null);
  useEffect(() => {
    clearInterval(timer.current);
    timer.current = setInterval(() => setI(v => (v + 1) % HERO_SLIDES.length), 5500);
    return () => clearInterval(timer.current);
  }, []);
  const go = (n) => { clearInterval(timer.current); setI((n + HERO_SLIDES.length) % HERO_SLIDES.length); };

  return (
    <section className="hero hero--full" id="top">
      <div className="hero__media" style={{ borderRadius: 0, height: '100vh', minHeight: 720 }}>
        {HERO_SLIDES.map((s, idx) => (
          <div key={idx} className={"slide" + (idx === i ? " is-active" : "")}>
            <img src={s.img} alt={s.cap} />
            <div className="overlay" />
          </div>
        ))}
        <div className="hero__overlay">
          <div className="wrap" style={{ padding: 0 }}>
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,.7)' }}>
              <span className="dot" style={{ background: accent }}></span>
              Pharmacy &amp; Health-Tech · Est. 2024
            </span>
            <h1 className="h-display h-big" style={{ color: '#fff', marginTop: 18 }}>
              Authentic medicines,<br/>
              <span className="serif-it">fingertip-fast.</span>
            </h1>
            <p className="body-l" style={{ color: 'rgba(255,255,255,.78)', marginTop: 18, maxWidth: 620 }}>
              A pharmacy network of retail, quick-commerce and hi-tech fulfilment — licensed,
              traceable, on your doorstep.
            </p>
            <div className="row" style={{ gap: 12, marginTop: 28 }}>
              <a className="btn btn-accent" href="#order">Order on the app →</a>
              <a className="btn btn-ghost" href="#services" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.4)' }}>Explore services</a>
            </div>
          </div>
        </div>
        <div className="dots" style={{ right: 'var(--gutter)', bottom: 24 }}>
          {HERO_SLIDES.map((_, idx) => (
            <button key={idx} className={idx === i ? "is-active" : ""} onClick={() => go(idx)} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Hero — asymmetric grid ───────────────────────────────────────────
function HeroGrid({ accent }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(v => (v + 1) % HERO_SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="hero wrap hero--grid" id="top">
      <div style={{ marginBottom: 32 }}>
        <span className="eyebrow"><span className="dot"></span>Pharmacy &amp; Health-Tech · Est. 2024</span>
      </div>
      <div className="hero__grid">
        <div className="hero__copy" style={{ justifyContent: 'space-between' }}>
          <h1 className="hero__h" style={{ fontSize: 'clamp(46px, 6.6vw, 108px)' }}>
            Authentic medicines,<br />
            <em>fingertip-</em>fast.
          </h1>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 28 }}>
            <div className="card" style={{ padding: 24, borderRadius: 22 }}>
              <div className="label" style={{ marginBottom: 8 }}>Retail · live</div>
              <div className="hero__h" style={{ fontSize: 'clamp(36px,4vw,60px)' }}>25<span className="serif-it" style={{ color: accent }}>+</span></div>
              <div className="body-s" style={{ marginTop: 6 }}>Stores across South India</div>
            </div>
            <div className="card" style={{ padding: 24, borderRadius: 22, background: 'var(--ink)', color: '#fff', borderColor: 'transparent' }}>
              <div className="label" style={{ color: 'rgba(255,255,255,.55)', marginBottom: 8 }}>Daily orders</div>
              <div className="hero__h" style={{ color: '#fff', fontSize: 'clamp(36px,4vw,60px)' }}>10k<span className="serif-it" style={{ color: accent }}>/d</span></div>
              <div className="body-s" style={{ color: 'rgba(255,255,255,.6)', marginTop: 6 }}>Reviewed by pharmacists</div>
            </div>
          </div>
        </div>
        <div className="hero__media" style={{ aspectRatio: 'auto', height: '100%', minHeight: 480 }}>
          {HERO_SLIDES.map((s, idx) => (
            <div key={idx} className={"slide" + (idx === i ? " is-active" : "")}>
              <img src={s.img} alt={s.cap} />
              <div className="overlay" />
            </div>
          ))}
          <span className="badge"><span className="dot" style={{ background: accent }}></span>{HERO_SLIDES[i].tag}</span>
        </div>
      </div>
    </section>
  );
}

// ─── App download strip — minimal ────────────────────────────────────
function AppStrip({ accent }) {
  return (
    <section className="wrap" id="app" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <div className="appstrip">
        <div className="appstrip__left">
          <img src="assets/urmedz-icon.png" alt="UrMedz" className="appstrip__icon" />
          <div>
            <h2 className="appstrip__h">
              Download the <span className="serif-it" style={{ color: accent }}>UrMedz</span> app
            </h2>
            <p className="appstrip__body">Authentic medicines · licensed pharmacists · doorstep delivery</p>
          </div>
        </div>
        <div className="appstrip__badges">
          <a className="store-badge store-badge--apple" href="https://apps.apple.com/in/app/urmedz/id6753715891" target="_blank" rel="noreferrer">
            <svg viewBox="0 0 384 512" width="24" height="24" aria-hidden="true">
              <path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
            </svg>
            <span>
              <span className="store-badge__small">Download on the</span>
              <span className="store-badge__big">App Store</span>
            </span>
          </a>
          <a className="store-badge store-badge--google" href="https://play.google.com/store/apps/details?id=com.urmedzB2C" target="_blank" rel="noreferrer">
            <svg viewBox="0 0 512 512" width="24" height="24" aria-hidden="true">
              <path fill="#00C2A1" d="M325.3 234.3 104.6 13l280.8 161.2-60.1 60.1z"/>
              <path fill="#FFBC00" d="M104.6 13c-5 1.6-9.4 4.4-13.1 8.1L296.3 226.6l29-29L104.6 13z"/>
              <path fill="#00ACE0" d="M385.4 174.2 458 216.4l-72.6 41.9-29-30 29-54.1z"/>
              <path fill="#EE2D26" d="M91.5 21.1c-4.4 4.6-7 11-7 19.4v431.2c0 8.4 2.6 14.8 7 19.4l213.7-213.7-213.7-256.3z"/>
              <path fill="#00C2A1" d="M296.3 286.7 91.5 491.1c5.1 5.5 13.5 6.2 22.7 1l271.2-155.4-89.1-50z"/>
            </svg>
            <span>
              <span className="store-badge__small">Get it on</span>
              <span className="store-badge__big">Google Play</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Nav, HeroEditorial, HeroFullBleed, HeroGrid, AppStrip });
