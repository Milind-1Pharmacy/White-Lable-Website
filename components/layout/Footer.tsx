import Image from "next/image";
import Link from "next/link";
import type { AppConfig } from "@/types/config.types";

type FooterProps = {
  app: AppConfig;
};

export function Footer({ app }: FooterProps) {
  const year = new Date().getFullYear();
  const fullLogo = app.branding?.logoFull ?? app.branding?.logo;

  return (
    <footer className="footer" id="contact">
      <div className="wrap">
        <div className="between" style={{ alignItems: "end", flexWrap: "wrap", gap: 32 }}>
          <h2 className="h-display h-big" style={{ maxWidth: 980, lineHeight: 0.92 }}>
            Authentic medicines,<br />
            <span className="serif-it" style={{ color: "var(--accent)" }}>delivered with</span> care.
          </h2>
          <Link href="/contact" className="btn btn-accent" style={{ padding: "18px 28px" }}>
            Start an order →
          </Link>
        </div>

        <div className="footer__grid">
          <div className="footer__col">
            {fullLogo && (
              <div style={{ background: "var(--cream)", borderRadius: 14, padding: "18px 22px", display: "inline-block", marginBottom: 22 }}>
                <Image
                  src={fullLogo}
                  alt={app.tenant.name}
                  width={140}
                  height={56}
                  style={{ height: 56, width: "auto", display: "block" }}
                />
              </div>
            )}
            <p className="body-s" style={{ color: "rgba(244,239,230,.55)", maxWidth: 320 }}>
              A pharmacy &amp; health-tech network — retail, quick commerce and hi-tech fulfilment for authentic medicines.
            </p>
            {(app.contact?.address || app.contact?.email || app.contact?.phone) && (
              <div style={{ marginTop: 24, fontSize: 13, color: "rgba(244,239,230,.7)", display: "flex", flexDirection: "column", gap: 6 }}>
                <span className="mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(244,239,230,.45)" }}>Head office</span>
                {app.contact.address && <span>{app.contact.address}</span>}
                {(app.contact.email || app.contact.phone) && (
                  <span style={{ marginTop: 8 }}>
                    {app.contact.email}
                    {app.contact.email && app.contact.phone ? " · " : ""}
                    {app.contact.phone}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="footer__col">
            <h5>Company</h5>
            <ul>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/about">Team</Link></li>
              <li><Link href="/contact">Careers</Link></li>
              <li><Link href="/contact">Press</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h5>Services</h5>
            <ul>
              <li><Link href="/services">Retail stores</Link></li>
              <li><Link href="/services">Quick commerce</Link></li>
              <li><Link href="/services">Fulfilment</Link></li>
              <li><Link href="/services">E-commerce partner</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h5>Resources</h5>
            <ul>
              <li><Link href="/contact">FAQ</Link></li>
              <li><Link href="/contact">Support</Link></li>
              <li><Link href="/privacy-policy">Privacy</Link></li>
              <li><Link href="/terms-and-conditions">Terms</Link></li>
            </ul>
          </div>
        </div>

        {app.compliance?.disclaimer && (
          <p className="footer__disc">{app.compliance.disclaimer}</p>
        )}

        <div className="footer__bottom">
          <span>© {year} {app.tenant.name}.</span>
          <span>RX-001 · DRG-LIC-KA · ISO 9001:2015</span>
        </div>
      </div>
    </footer>
  );
}
