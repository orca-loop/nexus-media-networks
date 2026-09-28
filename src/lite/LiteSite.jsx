import { BRAND, CONTACT, TIER1_CITIES, TIER2_CITIES } from '../config/siteConfig';
import { ContactForm } from '../scenes/Contact';

const GROUND = ['Hoardings & OOH', 'DOOH Screens', 'Transit Media', 'RWA Activations', 'Sampling', 'Gate & Lift Branding', 'Canopy Setup', 'Standee Placement', 'Flea Market', 'Festival Bundle Sampling', 'Corporate Sampling', 'Corporate Branding'];
const STEPS = [['01', 'Place', 'We pick the exact spots where your audience already is.'], ['02', 'Engage', 'Sampling and activations that get people to try your brand.'], ['03', 'Execute', 'Ground teams install and run every site on time.'], ['04', 'Report', 'Proof of display shared for every location.']];

// Non-3D fallback for weak devices / prefers-reduced-motion / ?lite. Same content and order as the 3D site.
export default function LiteSite() {
  return (
    <main className="lite">
      <section className="hero" id="hero">
        <h1>Right Placement.<br />True Engagement.</h1>
        <p className="pitch">Offline branding and activations that put your brand where India actually lives — from Tier 2 and 3 cities to every major metro.</p>
        <a className="btn" style={{ marginTop: 22, width: 'fit-content', textDecoration: 'none' }} href="#contact">Plan a Campaign</a>
      </section>

      <section id="street">
        <h2>What we run</h2>
        <div className="track">{GROUND.map((g) => <div key={g} className="chip">{g}</div>)}</div>
      </section>

      <section id="map">
        <h2>Tier 2 &amp; 3 India. Covered.</h2>
        <p className="pitch">15+ cities, plus every major Tier 1 metro.</p>
        <div className="cities" style={{ marginTop: 18 }}>
          {TIER2_CITIES.map((c) => <span key={c}>{c}</span>)}
          {TIER1_CITIES.map((c) => <span key={c} className="t1">{c}</span>)}
        </div>
      </section>

      <section id="process">
        <h2>How we work</h2>
        <div className="steps4">{STEPS.map(([n, t, d]) => <div key={n}><b>{n}</b>{t}<p style={{ marginTop: 6, fontSize: 13, opacity: .8 }}>{d}</p></div>)}</div>
      </section>

      <section id="contact">
        <h2>Let's put your brand where it gets noticed.</h2>
        <div className="contact-wrap"><ContactForm /></div>
        <div className="quicklinks">
          <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          <a href={`tel:+91${CONTACT.phone}`}>{CONTACT.phone}</a>
        </div>
      </section>

      <footer>{BRAND.name} — {BRAND.tagline} — © {new Date().getFullYear()}</footer>
    </main>
  );
}
