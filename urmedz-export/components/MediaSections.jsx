// media-sections.jsx — BTS video, AI store split, Team showcase, Gallery
const { useState: useStateMD, useEffect: useEffectMD, useRef: useRefMD } = React;

// ─── Behind-the-scenes video feature ─────────────────────────────────
function BtsVideo({ accent }) {
  const [playing, setPlaying] = useStateMD(false);
  return (
    <section className="section" id="fulfilment">
      <div className="wrap">
        <div className="bts">
          {!playing && (
            <>
              <img src="https://www.urmedz.in/wp-content/uploads/2024/11/video.jpg" alt="Inside a UrMedz fulfilment centre" />
              <div className="bts__overlay">
                <span className="bts__tag">Behind the scenes · Fulfilment</span>
                <div className="bts__bottom">
                  <h3 className="bts__headline">
                    A look at our <span className="serif-it" style={{ color: accent }}>hi-tech</span> fulfilment centres.
                  </h3>
                  <button className="btn btn-accent" onClick={() => setPlaying(true)}>
                    <span style={{ width: 0, height: 0, borderLeft: '10px solid currentColor', borderTop: '7px solid transparent', borderBottom: '7px solid transparent', marginRight: 2 }}></span>
                    Watch the tour · 3:42
                  </button>
                </div>
              </div>
            </>
          )}
          {playing && (
            <video autoPlay controls src="https://www.urmedz.in/wp-content/uploads/2024/11/new-ur_medz_video-4.mp4"
              poster="https://www.urmedz.in/wp-content/uploads/2024/11/video.jpg" style={{ background: '#000' }} />
          )}
        </div>

        <div className="marquee" style={{ marginTop: 40, paddingTop: 28, paddingBottom: 28, borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
          <div className="marquee__track">
            {[0,1].map(g => (
              <span key={g}>
                <span>Authentic</span>
                <span>Traceable</span>
                <span>Compliant</span>
                <span>Fast</span>
                <span>Scalable</span>
                <span>Trusted</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── AI store media split ────────────────────────────────────────────
function AIStore({ accent }) {
  const [playing, setPlaying] = useStateMD(false);
  return (
    <section className="section">
      <div className="wrap">
        <div className="split__head">
          <div>
            <span className="eyebrow"><span className="dot"></span>Technology · 2026</span>
            <h2 className="h-display h-2" style={{ marginTop: 14 }}>
              Our <span className="serif-it" style={{ color: accent }}>AI-driven</span> retail stores.
            </h2>
          </div>
          <p className="body" style={{ maxWidth: 380, margin: 0 }}>
            A store-assistant that knows your prescription history, your alternatives and your
            pickup time — quietly working alongside our pharmacists.
          </p>
        </div>
        <div className="split__grid">
          <div className="split__tile">
            <img src="https://www.urmedz.in/wp-content/uploads/2025/08/shopn.png" alt="UrMedz AI-driven retail store" />
            <span className="imgbox__tag" style={{ background: 'rgba(255,255,255,.92)', color: 'var(--ink)' }}>STORE FLOOR · WHITEFIELD</span>
          </div>
          <div className="split__tile" style={{ background: 'var(--ink)' }}>
            {!playing && (
              <>
                <img src="https://www.urmedz.in/wp-content/uploads/2025/08/shopn.png" alt="Store assistant preview" style={{ opacity: 0.55 }} />
                <button className="play-btn" onClick={() => setPlaying(true)} aria-label="Play store assistant video" />
                <span className="imgbox__tag" style={{ background: 'rgba(0,178,122,.95)', color: 'var(--ink)' }}>STORE ASSISTANT · DEMO</span>
              </>
            )}
            {playing && (
              <video autoPlay controls src="https://www.urmedz.in/wp-content/uploads/2025/08/Urmedz-Store-Assistant.mp4" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Team showcase (editorial departments) ──────────────────────────
const DEPTS = [
  { code: '01', count: 75,  label: 'Pharmacists',           role: 'Licensed dispensing',  bg: '#F5A623', fg: '#1B2A5B', detail: 'Registered with the Karnataka State Pharmacy Council. Every order reviewed.' },
  { code: '02', count: 25,  label: 'Doctors',               role: 'Consulting clinicians', bg: '#1FAFA6', fg: '#FFFFFF', detail: 'On-call for prescription validation, refills and pharmacist escalations.' },
  { code: '03', count: 60,  label: 'Supply chain',          role: 'Sourcing & logistics',  bg: '#6B3FA0', fg: '#FFFFFF', detail: 'From manufacturer pickup to last-mile — batch-traceable end to end.' },
  { code: '04', count: 40,  label: 'Health guardians',      role: 'Customer support',      bg: '#E5326C', fg: '#FFFFFF', detail: 'Reachable in four languages, average first reply under nine minutes.' },
];

function Team({ accent }) {
  return (
    <section className="section section--cream" id="team">
      <div className="wrap">
        <div style={{ marginBottom: 56 }}>
          <span className="eyebrow"><span className="dot"></span>Our team of specialists · 200+ strong</span>
        </div>

        {/* Manifesto pull-quote */}
        <div className="team2__quote">
          <span className="team2__mark">
            <img src="assets/urmedz-icon.png" alt="" />
          </span>
          <p className="team2__pull">
            United by a single purpose — to make healthcare<br/>
            <span className="serif-it" style={{ color: accent }}>accessible, affordable</span> and<br/>
            <span className="serif-it" style={{ color: accent }}>trustworthy</span> for everyone.
          </p>
          <div className="team2__sig">
            <span className="label">Signed,</span>
            <span className="serif-it" style={{ fontSize: 22, color: 'var(--ink)' }}>the UrMedz team</span>
          </div>
        </div>

        {/* Department cards */}
        <div className="team2__grid">
          {DEPTS.map((d, i) => (
            <div key={i} className="team2__cell" style={{ background: d.bg, color: d.fg }}>
              <div className="team2__cell-top">
                <span className="mono" style={{ fontSize: 11, letterSpacing: '.14em', opacity: 0.75 }}>{d.code} / 04</span>
                <span className="mono" style={{ fontSize: 11, letterSpacing: '.14em', opacity: 0.75 }}>{d.role}</span>
              </div>
              <div>
                <div className="team2__count">
                  <AnimNum value={d.count} />
                  <span className="serif-it" style={{ opacity: 0.7 }}>+</span>
                </div>
                <div className="team2__label">{d.label}</div>
              </div>
              <p className="team2__detail">{d.detail}</p>
            </div>
          ))}
        </div>

        {/* Credentials bar */}
        <div className="team2__creds">
          <div className="team2__creds-item">
            <span className="label">Regulatory</span>
            <span>Drug Licence · KA-RX-001</span>
          </div>
          <div className="team2__creds-item">
            <span className="label">Quality</span>
            <span>ISO 9001:2015 audited</span>
          </div>
          <div className="team2__creds-item">
            <span className="label">Affiliations</span>
            <span>IPA · ASCRS · NABP-equiv.</span>
          </div>
          <div className="team2__creds-item">
            <span className="label">Care SLA</span>
            <span>Avg. reply &lt; 9 min · 4 languages</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Gallery ─────────────────────────────────────────────────────────
function Gallery() {
  // Real-photo URLs are placeholders in config; use authentic UrMedz photo URLs we have
  const items = [
    { src: 'https://www.urmedz.in/wp-content/uploads/2024/12/banners_final-03-1jpg.jpg', cap: 'Retail stores' },
    { src: 'https://www.urmedz.in/wp-content/uploads/2024/11/video.jpg', cap: 'Fulfilment centre' },
    { src: 'https://www.urmedz.in/wp-content/uploads/2025/08/shopn.png', cap: 'Store floor' },
    { src: 'https://www.urmedz.in/wp-content/uploads/2024/10/banners-new.jpg', cap: 'Quick commerce' },
    { src: 'https://www.urmedz.in/wp-content/uploads/2024/12/img.jpg', cap: 'Brand options' },
    { src: 'https://www.urmedz.in/wp-content/uploads/2024/10/bnr2-2.jpg', cap: 'Dispensing' },
  ];
  return (
    <section className="section">
      <div className="wrap">
        <div className="between" style={{ marginBottom: 40, alignItems: 'end' }}>
          <div>
            <span className="eyebrow"><span className="dot"></span>Inside UrMedz</span>
            <h2 className="h-display h-2" style={{ marginTop: 14 }}>From the store to the <span className="serif-it">fulfilment floor.</span></h2>
          </div>
        </div>
        <div className="gallery__row">
          {items.slice(0, 3).map((it, i) => (
            <div key={i} className="gallery__cell">
              <img src={it.src} alt={it.cap} />
              <span className="gallery__cap">{it.cap}</span>
            </div>
          ))}
        </div>
        <div className="gallery__row">
          {items.slice(3, 6).map((it, i) => (
            <div key={i} className="gallery__cell">
              <img src={it.src} alt={it.cap} />
              <span className="gallery__cap">{it.cap}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { BtsVideo, AIStore, Team, Gallery });
