import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { scrollState } from '../state/scrollState';
import { fadeWindow, smoothstep } from '../utils/sceneMath';
import { BoxField, C } from '../lib/kit';
import { CONTACT, TIER1_CITIES, TIER2_CITIES, BRAND } from '../config/siteConfig';

const TYPES = ['Hoardings / OOH', 'DOOH Screens', 'Transit', 'RWA Activation', 'Sampling', 'Lift Branding', 'Corporate Activation', 'Flea Market', 'Festival Bundle', 'Other'];

// Shared so LiteSite (Part 5's earlier stub) can reuse the exact same form.
export function ContactForm() {
  const [state, setState] = useState('idle'); // idle | sending | ok | bad
  const [err, setErr] = useState('');
  const onSubmit = async (e) => {
    e.preventDefault();
    const f = e.target, data = Object.fromEntries(new FormData(f).entries());
    if (data._gotcha) return; // honeypot
    if (!data.name || !data.phone) { setErr('Name and phone are required.'); return; }
    setErr(''); setState('sending');
    try {
      const res = await fetch(CONTACT.formEndpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(f) });
      if (res.ok) { setState('ok'); f.reset(); } else setState('bad');
    } catch { setState('bad'); }
  };
  return (
    <form className="cform" onSubmit={onSubmit}>
      <input className="hp" name="_gotcha" tabIndex={-1} autoComplete="off" />
      <div className="cform-row">
        <div><label htmlFor="name">Name</label><input id="name" name="name" required data-cursor /></div>
        <div><label htmlFor="company">Company</label><input id="company" name="company" data-cursor /></div>
      </div>
      <div className="cform-row">
        <div><label htmlFor="phone">Phone</label><input id="phone" name="phone" required data-cursor /></div>
        <div><label htmlFor="city">City</label><input id="city" name="city" data-cursor /></div>
      </div>
      <div>
        <label htmlFor="type">Campaign type</label>
        <select id="type" name="type" data-cursor defaultValue={TYPES[0]}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
      </div>
      <div><label htmlFor="message">Message</label><textarea id="message" name="message" data-cursor /></div>
      <button className="btn" type="submit" data-cursor disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send'}</button>
      {err && <div className="cform-msg bad">{err}</div>}
      {state === 'ok' && <div className="cform-msg ok">Thanks — we'll get back to you shortly.</div>}
      {state === 'bad' && <div className="cform-msg bad">Something went wrong. Please WhatsApp or call us instead.</div>}
    </form>
  );
}

function Magnet() {
  const g = useRef(), dots = useRef();
  const pts = useMemo(() => Array.from({ length: 90 }, (_, i) => ({ a: (i / 90) * Math.PI * 2, r: 3.4 + (i % 5) * 0.5, sp: 0.3 + (i % 3) * 0.15 })), []);
  useFrame((s, dt) => {
    const t = s.clock.elapsedTime, p = scrollState.scenes.contact;
    if (g.current) { g.current.rotation.y += (scrollState.pointer.x * 0.6 - g.current.rotation.y) * 0.03; g.current.rotation.x += (-scrollState.pointer.y * 0.25 - g.current.rotation.x) * 0.03; g.current.scale.setScalar(0.6 + 0.4 * smoothstep(0, 0.2, p)); }
    if (dots.current) dots.current.children.forEach((m, i) => { const pt = pts[i], pull = 1 - ((t * pt.sp) % 1); m.position.set(Math.cos(pt.a) * pt.r * (0.4 + 0.6 * pull), Math.sin(t + i) * 0.3, Math.sin(pt.a) * pt.r * (0.4 + 0.6 * pull)); m.scale.setScalar(0.06 + 0.05 * pull); });
  });
  return (
    <group position={[0, 3.4, 0]}>
      <group ref={g}>
        <mesh position={[-1.1, 0, 0]}><torusGeometry args={[1.5, 0.45, 8, 20, Math.PI]} /><meshStandardMaterial color={C.red} flatShading /></mesh>
        <mesh position={[-1.1, 1.5, 0]} rotation-z={Math.PI}><boxGeometry args={[0.9, 0.9, 0.9]} /><meshStandardMaterial color={C.black} flatShading /></mesh>
        <mesh position={[-1.1, -1.5, 0]} rotation-z={Math.PI}><boxGeometry args={[0.9, 0.9, 0.9]} /><meshStandardMaterial color={C.black} flatShading /></mesh>
        <mesh position={[0.3, 0.2, 0.2]}><coneGeometry args={[0.6, 1.6, 3]} /><meshStandardMaterial color={C.black} flatShading /></mesh>
      </group>
      <group ref={dots}>{pts.map((_, i) => <mesh key={i}><boxGeometry /><meshStandardMaterial color={i % 4 ? C.red : C.black} flatShading /></mesh>)}</group>
    </group>
  );
}

export default function Scene() {
  const floor = useMemo(() => [{ p: [0, -0.1, 0], s: [40, 0.2, 40], c: C.peachD }], []);
  return (<group><BoxField items={floor} /><Magnet /></group>);
}

export const cameraKeys = [
  { t: 0, pos: [0, 3.4, 16], look: [0, 3.4, 0] },
  { t: 1, pos: [0, 3.6, 11], look: [0, 3.2, 0] },
];

export function Overlay() {
  const root = useRef();
  useEffect(() => {
    const f = () => { const el = root.current; if (!el) return; const o = smoothstep(0.06, 0.22, scrollState.scenes.contact); el.style.opacity = o; el.style.visibility = o < 0.02 ? 'hidden' : 'visible'; };
    gsap.ticker.add(f); return () => gsap.ticker.remove(f);
  }, []);
  return (
    <div ref={root} className="ov" style={{ visibility: 'hidden' }}>
      <div className="ov-copy top" style={{ maxWidth: 460 }}>
        <h2>Let's put your brand where it gets noticed.</h2>
        <div className="contact-wrap"><ContactForm /></div>
        <div className="quicklinks">
          <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer" data-cursor>WhatsApp</a>
          <a href={`mailto:${CONTACT.email}`} data-cursor>{CONTACT.email}</a>
          <a href={`tel:+91${CONTACT.phone}`} data-cursor>{CONTACT.phone}</a>
        </div>
      </div>
      <div className="footer-list">
        <span><b>{BRAND.name}</b></span>
        {[...TIER2_CITIES, ...TIER1_CITIES].map((c) => <span key={c}>{c}</span>)}
        <span>© {new Date().getFullYear()} {BRAND.short}. All rights reserved.</span>
      </div>
    </div>
  );
}
