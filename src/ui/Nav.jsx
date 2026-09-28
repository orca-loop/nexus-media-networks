import { scrollToScene } from '../engine/ScrollDriver';
import { BRAND } from '../config/siteConfig';

const LINKS = [['Services', 'street'], ['Cities', 'map'], ['Contact', 'contact']];

export default function Nav() {
  return (
    <header className="nav">
      <a className="nav-logo" href="#top" data-cursor onClick={(e) => { e.preventDefault(); scrollToScene('hero'); }} aria-label={BRAND.name}>
        <svg viewBox="0 0 40 32" width="34" height="28" aria-hidden="true">
          <path d="M22 4 H14 A12 12 0 0 0 14 28 H22" fill="none" stroke="#E01E26" strokeWidth="3" strokeLinecap="round" />
          <path d="M22 10 H15 A6 6 0 0 0 15 22 H22" fill="none" stroke="#E01E26" strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="17,14 24,13 21,17 27,16.5 18,21 20.5,17.5 15,18" fill="#E01E26" />
        </svg>
        <span>{BRAND.short}</span>
      </a>
      <nav aria-label="Main">
        {LINKS.map(([label, id]) => (
          <a key={id} href={`#${id}`} data-cursor onClick={(e) => { e.preventDefault(); scrollToScene(id); }}>{label}</a>
        ))}
      </nav>
    </header>
  );
}
