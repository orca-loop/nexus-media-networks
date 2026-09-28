import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { scrollState } from '../state/scrollState';
import { smoothstep } from '../utils/sceneMath';
import { TIER1_CITIES, TIER2_CITIES } from '../config/siteConfig';
import { BoxField, SceneOverlay, isLow, C } from '../lib/kit';

// Simplified outline of India (lon, lat). Approximate on purpose: stylised, not survey-accurate.
const OUTLINE = [[74.5,37],[77.8,35.5],[79,34],[78.9,32.5],[80.2,30.8],[81,30.2],[80.1,28.8],[81.8,27.8],[84,27.3],[86,26.6],[88.1,26.5],[89.8,26.7],[92,26.8],[95.5,27.9],[97.3,28.2],[96,26],[94.5,24],[93.2,22.2],[92.3,23.9],[91.2,24.2],[89.8,25.3],[88.5,24.8],[88.7,23.2],[89,21.8],[87,21.5],[86.5,20.2],[85,19.5],[84,18.3],[82.3,16.6],[80.3,15.5],[80.2,13.4],[80,11.5],[79.9,10.3],[78.9,9.2],[77.6,8.1],[76.4,9.5],[75.4,11.8],[74.7,13.6],[74,15.4],[73.3,17.6],[72.8,19.1],[72.7,21],[72.2,21.8],[70.3,20.8],[69,22.3],[68.4,23.6],[70,24.2],[71,24.4],[70.8,26],[69.5,27],[70.3,28],[71.9,27.9],[73,29.6],[74.3,31],[74.7,32.4],[74,34],[73.8,35.5]];
const LL = { Indore:[75.86,22.72], Bhopal:[77.41,23.26], Jaipur:[75.79,26.91], Lucknow:[80.95,26.85], Surat:[72.83,21.17], Rajkot:[70.8,22.3], Gandhinagar:[72.64,23.22], Ahmedabad:[72.57,23.03], Nagpur:[79.09,21.15], Kanpur:[80.35,26.45], Jabalpur:[79.93,23.18], Prayagraj:[81.85,25.43], Ujjain:[75.78,23.18], Bhubaneswar:[85.82,20.3], Goa:[73.83,15.5],
  'Delhi NCR':[77.21,28.61], Mumbai:[72.88,19.08], Bangalore:[77.59,12.97], Hyderabad:[78.49,17.39], Chennai:[80.27,13.08], Kolkata:[88.36,22.57] };
const K = 1.4, LON0 = 83, LAT0 = 22.5, DEPTH = 0.7;
const px = (lon) => (lon - LON0) * K, pz = (lat) => -(lat - LAT0) * K;
const CITIES = [...TIER2_CITIES.map((name) => ({ name, t: 2 })), ...TIER1_CITIES.map((name) => ({ name, t: 1 }))].map((c, i) => ({ ...c, order: c.t === 2 ? i : i - TIER2_CITIES.length, x: px(LL[c.name][0]), z: pz(LL[c.name][1]) }));
const SERVICES = {
  2: ['Sampling (RWA, corporate)', 'RWA activations', 'Lift and gate branding', 'Canopy and standees', 'Flea market', 'DOOH screens'],
  1: ['Hoardings and DOOH', 'RWA activations', 'Sampling and canopies', 'Lift and corporate branding', 'Screens in cafes, hotels, towers, bus stops'],
};
const inside = (lon, lat) => { let c = false; for (let i = 0, j = OUTLINE.length - 1; i < OUTLINE.length; j = i++) { const [xi, yi] = OUTLINE[i], [xj, yj] = OUTLINE[j]; if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) c = !c; } return c; };

function City({ c, sel, pin, setSel, setPin }) {
  const g = useRef(), ring = useRef(), t1 = c.t === 1, H = t1 ? 3.2 : 2.2, r = t1 ? 0.42 : 0.26;
  useFrame((s) => {
    const p = scrollState.scenes.map, start = t1 ? 0.68 + c.order * 0.03 : 0.1 + c.order * 0.035;
    const v = smoothstep(start, start + 0.08, p);
    g.current.scale.y = Math.max(0.001, v);
    const tt = (s.clock.elapsedTime * 0.7 + c.order * 0.3) % 1;
    ring.current.scale.setScalar(0.5 + tt * (t1 ? 3.4 : 2.2));
    ring.current.material.opacity = (1 - tt) * 0.7 * v;
  });
  const shown = (pin || sel) === c.name;
  return (
    <group position={[c.x, DEPTH, c.z]}>
      <group ref={g}>
        <mesh position={[0, H / 2, 0]}><cylinderGeometry args={[r, r, H, 6]} /><meshStandardMaterial color={t1 ? C.black : C.red} flatShading /></mesh>
        {t1 && <mesh position={[0, H + 0.15, 0]}><cylinderGeometry args={[r * 1.2, r * 1.2, 0.3, 6]} /><meshStandardMaterial color={C.red} flatShading /></mesh>}
      </group>
      <mesh ref={ring} rotation-x={-Math.PI / 2} position={[0, 0.06, 0]}><ringGeometry args={[0.8, 1, 28]} /><meshBasicMaterial color={C.red} transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, H / 2, 0]} onPointerOver={(e) => { e.stopPropagation(); setSel(c.name); }} onPointerOut={() => setSel(null)} onClick={(e) => { e.stopPropagation(); setPin(pin === c.name ? null : c.name); }}>
        <cylinderGeometry args={[0.7, 0.7, H + 1, 8]} /><meshBasicMaterial visible={false} />
      </mesh>
      {shown && (
        <Html position={[0, H + 0.8, 0]} center zIndexRange={[20, 0]} pointerEvents="none">
          <div className="city-card"><b>{c.name}</b><span>{c.t === 1 ? 'Tier 1 metro' : 'Tier 2 / 3 city'}</span><ul>{SERVICES[c.t].map((s) => <li key={s}>{s}</li>)}</ul></div>
        </Html>
      )}
    </group>
  );
}

export default function Scene() {
  const wrap = useRef();
  const [sel, setSel] = useState(null), [pin, setPin] = useState(null);
  const geo = useMemo(() => {
    const sh = new THREE.Shape(OUTLINE.map(([lo, la]) => new THREE.Vector2(px(lo), -pz(la))));
    return new THREE.ExtrudeGeometry(sh, { depth: DEPTH, bevelEnabled: false });
  }, []);
  const edge = useMemo(() => [...OUTLINE, OUTLINE[0]].map(([lo, la]) => [px(lo), DEPTH + 0.03, pz(la)]), []);
  const dots = useMemo(() => { // halftone dot grid on the map surface
    const out = [], step = isLow() ? 1.2 : 0.75;
    for (let lo = 68; lo < 98; lo += step) for (let la = 8; la < 37.5; la += step) if (inside(lo, la)) out.push({ p: [px(lo), DEPTH + 0.05, pz(la)], s: [0.26, 0.05, 0.26], c: '#E7A57A' });
    return out;
  }, []);
  useFrame((s) => {
    const { x, y } = scrollState.pointer, w = wrap.current;
    w.rotation.y += (x * 0.18 - w.rotation.y) * 0.05; w.rotation.x += (-y * 0.05 - w.rotation.x) * 0.05;
  });
  return (
    <group ref={wrap} onPointerMissed={() => setPin(null)}>
      <mesh geometry={geo} rotation-x={-Math.PI / 2}><meshStandardMaterial color={C.peachD} flatShading /></mesh>
      <BoxField items={dots} />
      <Line points={edge} color={C.red} lineWidth={2} />
      {CITIES.map((c) => <City key={c.name} c={c} sel={sel} pin={pin} setSel={setSel} setPin={setPin} />)}
    </group>
  );
}

export const cameraKeys = [
  { t: 0, pos: [0, 52, 14], look: [0, 0, 0] },
  { t: 0.5, pos: [0, 36, 24], look: [0, 0, -1] },
  { t: 1, pos: [0, 30, 28], look: [0, 0, -1] },
];

function Counter() {
  const el = useRef();
  useEffect(() => {
    const f = () => { if (!el.current) return; const n = Math.round(15 * smoothstep(0.1, 0.68, scrollState.scenes.map)); el.current.textContent = n >= 15 ? '15+ cities' : `${n} cities`; };
    gsap.ticker.add(f); return () => gsap.ticker.remove(f);
  }, []);
  return <div className="count" ref={el}>0 cities</div>;
}
export function Overlay() {
  return (
    <SceneOverlay id="map" title="Tier 2 & 3 India. Covered." text="Also live in Delhi NCR, Mumbai, Bangalore, Hyderabad, Chennai and Kolkata. Hover or tap a city to see what we run there." top>
      <Counter />
    </SceneOverlay>
  );
}
