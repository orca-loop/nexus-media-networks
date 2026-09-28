import { useEffect } from 'react';
import { BRAND, CONTACT, TIER1_CITIES, TIER2_CITIES } from '../config/siteConfig';

const DOMAIN = 'https://displaynexusmedia.com';
const TITLE = `${BRAND.name} | BTL, OOH & Offline Activations in Tier 2 and 3 India`;
const DESC = `${BRAND.tagline} BTL, OOH, DOOH, RWA activations and sampling across 15+ Tier 2/3 cities and every major Tier 1 metro in India.`;

function tag(sel, attrs) {
  let el = document.head.querySelector(sel);
  if (!el) { el = document.createElement(sel.startsWith('meta') ? 'meta' : 'link'); document.head.appendChild(el); }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

export default function SeoHead() {
  useEffect(() => {
    document.title = TITLE;
    document.documentElement.lang = 'en';
    tag('meta[name="description"]', { name: 'description', content: DESC });
    tag('link[rel="canonical"]', { rel: 'canonical', href: DOMAIN + '/' });
    [['og:title', TITLE], ['og:description', DESC], ['og:type', 'website'], ['og:url', DOMAIN + '/'], ['og:site_name', BRAND.name]]
      .forEach(([p, c]) => tag(`meta[property="${p}"]`, { property: p, content: c }));
    [['twitter:card', 'summary'], ['twitter:title', TITLE], ['twitter:description', DESC]]
      .forEach(([n, c]) => tag(`meta[name="${n}"]`, { name: n, content: c }));

    let ld = document.getElementById('ld-json');
    if (!ld) { ld = document.createElement('script'); ld.id = 'ld-json'; ld.type = 'application/ld+json'; document.head.appendChild(ld); }
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'LocalBusiness', name: BRAND.name, description: DESC, url: DOMAIN + '/',
      email: CONTACT.email, telephone: `+91${CONTACT.phone}`, slogan: BRAND.tagline,
      areaServed: [...TIER2_CITIES, ...TIER1_CITIES].map((name) => ({ '@type': 'City', name })),
    });
  }, []);
  return null;
}
