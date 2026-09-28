import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { lenisRef } from '../engine/ScrollDriver';
import { BRAND } from '../config/siteConfig';

// Halftone "N": circles on top rows morph into squares lower down (offline -> digital)
const NDOTS = [];
for (let r = 0; r < 9; r++) for (let c = 0; c < 6; c++) {
  if (c <= 1 || c >= 4 || Math.abs(c - (1 + (r * 3) / 8)) < 0.7) NDOTS.push({ x: 204 + c * 11, y: 44 + r * 11, sq: r >= 5 });
}

export default function Loader() {
  const root = useRef();
  const [pct, setPct] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const q = (s) => root.current.querySelectorAll(s);
    const ctx = gsap.context(() => {
      q('.ld-path').forEach((p) => { const l = p.getTotalLength(); gsap.set(p, { strokeDasharray: l, strokeDashoffset: l }); gsap.to(p, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.out' }); });
      gsap.from(q('.ld-dot'), { x: () => gsap.utils.random(-260, 260), y: () => gsap.utils.random(-160, 160), opacity: 0, duration: 1.5, ease: 'power3.out', stagger: { each: 0.006, from: 'random' } });
      gsap.from(q('.ld-bolt'), { scale: 0, transformOrigin: '50% 50%', opacity: 0, duration: 0.5, delay: 1.2, ease: 'back.out(3)' });
    }, root);

    const st = { v: 0 };
    const upd = () => setPct(Math.round(st.v));
    const t1 = gsap.to(st, { v: 90, duration: 2.2, ease: 'power1.out', onUpdate: upd });
    const failsafe = setTimeout(() => { window.__dnmnReady = true; }, 8000);
    let finished = false;

    const reveal = () => {
      gsap.to(q('.ld-dot,.ld-path,.ld-bolt'), { x: 'random(-500,500)', y: 'random(-300,300)', opacity: 0, duration: 0.7, ease: 'power2.in' });
      gsap.to(root.current, { opacity: 0, duration: 0.6, delay: 0.35, onComplete: () => setGone(true) });
      lenisRef.current?.start();
      document.documentElement.classList.add('is-revealed');
      window.__dnmnRevealed = performance.now();
      window.dispatchEvent(new Event('dnmn:revealed'));
    };
    const poll = () => {
      if (!finished && t1.progress() >= 1 && window.__dnmnReady) {
        finished = true; gsap.ticker.remove(poll);
        gsap.to(st, { v: 100, duration: 0.4, onUpdate: upd, onComplete: reveal });
      }
    };
    gsap.ticker.add(poll);
    return () => { gsap.ticker.remove(poll); clearTimeout(failsafe); t1.kill(); ctx.revert(); };
  }, []);

  if (gone) return null;
  return (
    <div ref={root} className="loader" role="status" aria-label="Loading">
      <svg viewBox="60 20 240 140" className="loader-logo">
        <path className="ld-path" d="M150 40 H112 A50 50 0 0 0 112 140 H150" fill="none" stroke="#E01E26" strokeWidth="6" strokeLinecap="round" />
        <path className="ld-path" d="M150 64 H116 A26 26 0 0 0 116 116 H150" fill="none" stroke="#E01E26" strokeWidth="5" strokeLinecap="round" />
        <polygon className="ld-bolt" points="128,84 152,80 144,92 162,91 132,104 140,95 124,96" fill="none" stroke="#E01E26" strokeWidth="2.5" strokeLinejoin="round" />
        {NDOTS.map((d, i) => d.sq
          ? <rect key={i} className="ld-dot" x={d.x - 4} y={d.y - 4} width="8" height="8" fill="#E01E26" />
          : <circle key={i} className="ld-dot" cx={d.x} cy={d.y} r="4" fill="#E01E26" />)}
      </svg>
      <div className="loader-name">{BRAND.name}</div>
      <div className="loader-pct">{pct}%</div>
    </div>
  );
}
