import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import { scrollState } from '../state/scrollState';
import { smoothstep } from '../utils/sceneMath';
import { AdPanel, BoxField, SceneOverlay, isLow, rng, C } from '../lib/kit';

const HS = {
  gate: { at: 0.02, label: 'Gate Branding', info: 'Branded arches and boundary walls at the entry that every resident and visitor passes.' },
  standee: { at: 0.16, label: 'Standees', info: 'Eye-level standees placed on the walkways where residents stop and read.' },
  canopy: { at: 0.3, label: 'Canopy Setup', info: 'Branded canopies for events, product trials and brand stalls inside the society.' },
  sampling: { at: 0.4, label: 'Sampling', info: 'Trained promoters hand product samples directly to households.' },
  gift: { at: 0.52, label: 'Festival Bundle Sampling', info: 'Festival gift bundles carrying your product, handed out during the big celebrations.' },
  engage: { at: 0.64, label: 'Engagement Activations', info: 'Games, contests and live activities that get families interacting with your brand.' },
  flea: { at: 0.76, label: 'Flea Market', info: 'Branded stalls inside society flea markets to sell, sample and collect leads.' },
};

// Wraps a 3D object with a pulsing marker, dotted connector, hover lift and click-to-open info card
function Hotspot({ id, obj, mark = [0, 4, 0], open, setOpen, children }) {
  const h = HS[id], el = useRef(), grp = useRef(), hov = useRef(false);
  useFrame(() => {
    const p = scrollState.scenes.society;
    const v = smoothstep(h.at, h.at + 0.07, p) * (1 - smoothstep(0.9, 0.98, p));
    if (el.current) { el.current.style.opacity = v; el.current.style.transform = `scale(${0.5 + 0.5 * v})`; el.current.style.pointerEvents = v > 0.5 ? 'auto' : 'none'; }
    if (grp.current) { const s = grp.current.scale.x, t = hov.current || open === id ? 1.06 : 1; grp.current.scale.setScalar(s + (t - s) * 0.15); }
  });
  const toggle = (e) => { e.stopPropagation(); setOpen(open === id ? null : id); };
  return (
    <group position={obj}>
      <group ref={grp} onPointerOver={(e) => { e.stopPropagation(); hov.current = true; }} onPointerOut={() => { hov.current = false; }} onClick={toggle}>{children}</group>
      <group position={mark}>
        <Html center pointerEvents="none" zIndexRange={[12, 0]}>
          <div ref={el} className="hotspot"><button data-cursor onClick={toggle}><i />{h.label}</button>{open === id && <div className="hs-card">{h.info}</div>}</div>
        </Html>
        <Line points={[[0, -0.5, 0], [0, -1.3, 0]]} color={C.red} dashed dashSize={0.15} gapSize={0.12} lineWidth={1.5} />
      </group>
    </group>
  );
}

const M = ({ p, s, c, r }) => <mesh position={p} rotation={r}><boxGeometry args={s} /><meshStandardMaterial color={c} flatShading /></mesh>;

const Gate = () => (
  <group>
    <M p={[-5, 3, 0]} s={[1.4, 6, 1.4]} c={C.black} /><M p={[5, 3, 0]} s={[1.4, 6, 1.4]} c={C.black} />
    <M p={[0, 6.4, 0]} s={[12, 1.6, 1.2]} c={C.red} />
    <AdPanel position={[0, 6.4, 0.65]} size={[8, 1.2]} variant={2} frame={false} />
  </group>
);
const Standee = ({ v = 0 }) => (
  <group>
    <M p={[0, 0.05, 0]} s={[1.3, 0.1, 0.9]} c={C.black} /><M p={[0, 1.2, -0.05]} s={[0.1, 2.4, 0.1]} c={C.black} />
    <AdPanel position={[0, 1.8, 0.05]} size={[1.3, 2.2]} variant={v} />
  </group>
);
const Canopy = () => (
  <group>
    {[[-1.8, -1.4], [1.8, -1.4], [-1.8, 1.4], [1.8, 1.4]].map(([x, z], i) => <M key={i} p={[x, 1.5, z]} s={[0.15, 3, 0.15]} c={C.black} />)}
    <M p={[0, 3.1, 0]} s={[4.4, 0.2, 3.4]} c={C.red} /><M p={[0, 2.8, 1.65]} s={[4.4, 0.5, 0.1]} c={C.white} />
  </group>
);
const Counter = () => (
  <group>
    <M p={[0, 0.5, 0]} s={[3, 1, 1]} c={C.black} />
    {[-1, 0, 1].map((i) => <M key={i} p={[i * 0.9, 1.15, 0]} s={[0.5, 0.3, 0.5]} c={C.red} />)}
  </group>
);
const Gift = () => {
  const boxes = useMemo(() => { const r = rng(9); return Array.from({ length: 9 }, (_, i) => ({ p: [-1.4 + (i % 5) * 0.7, 1.05 + Math.floor(i / 5) * 0.4, (r() - 0.5) * 0.6], c: [C.red, C.black, C.white][i % 3], rot: r() * 0.6 })); }, []);
  return (
    <group>
      <M p={[0, 0.45, 0]} s={[3.8, 0.9, 1.5]} c={C.peach} />
      {boxes.map((b, i) => <M key={i} p={b.p} s={[0.5, 0.4, 0.5]} c={b.c} r={[0, b.rot, 0]} />)}
      <AdPanel position={[0, 2.4, -0.8]} size={[3.6, 1.3]} variant={0} />
    </group>
  );
};
function Stage() {
  const ring = useRef();
  useFrame((s) => { if (ring.current) ring.current.rotation.y = s.clock.elapsedTime * 0.6; });
  const bits = useMemo(() => Array.from({ length: 16 }, (_, i) => ({ p: [Math.cos((i / 16) * 6.283) * 2.8, 3.6 + Math.sin(i) * 0.3, Math.sin((i / 16) * 6.283) * 2.8], s: [0.22, 0.22, 0.22], c: i % 2 ? C.red : C.black })), []);
  return (
    <group>
      <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[3.4, 3.4, 0.3, 24]} /><meshStandardMaterial color={C.red} flatShading /></mesh>
      <M p={[-2, 1.4, -2.6]} s={[0.15, 2.8, 0.15]} c={C.black} /><M p={[2, 1.4, -2.6]} s={[0.15, 2.8, 0.15]} c={C.black} />
      <AdPanel position={[0, 3, -2.5]} size={[4.2, 2.1]} variant={1} />
      <group ref={ring}><BoxField items={bits} /></group>
    </group>
  );
}
const Stall = ({ c }) => (
  <group>
    <M p={[0, 0.45, 0]} s={[3, 0.9, 1.4]} c={C.peach} />
    {[-1.4, 1.4].map((x) => <M key={x} p={[x, 1.6, -0.6]} s={[0.1, 3.2, 0.1]} c={C.black} />)}
    <M p={[0, 3.2, 0]} s={[3.4, 0.12, 1.9]} c={c} r={[0.15, 0, 0]} />
    {[-1, 0, 1].map((i) => <M key={i} p={[i * 0.9, 1.1, 0]} s={[0.55, 0.4, 0.55]} c={[C.red, C.black, C.grey][(i + 1) % 3]} />)}
  </group>
);
function People({ list }) {
  const g = useRef();
  useFrame((s) => { const t = s.clock.elapsedTime; g.current.children.forEach((c, i) => { c.position.y = Math.sin(t * 2 + i) * 0.04; }); });
  return (
    <group ref={g}>
      {list.map(([x, z, col], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.9, 0]}><capsuleGeometry args={[0.3, 0.8, 3, 6]} /><meshStandardMaterial color={col} flatShading /></mesh>
          <mesh position={[0, 1.85, 0]}><sphereGeometry args={[0.24, 6, 5]} /><meshStandardMaterial color="#e7b48c" flatShading /></mesh>
        </group>
      ))}
    </group>
  );
}

export default function Scene() {
  const [open, setOpen] = useState(null);
  const low = isLow();
  const world = useMemo(() => {
    const it = [];
    [-24, -6, 12, 30].forEach((x, i) => { // back row of apartment blocks with windows
      it.push({ p: [x, 8, -44], s: [12, 16, 10], c: [C.peachD, '#EFBE98', C.grey, C.peachD][i] });
      if (!low) for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) it.push({ p: [x - 4.2 + c * 2.8, 3 + r * 3.2, -38.9], s: [1.4, 1.6, 0.2], c: (r + c) % 3 ? C.white : C.black });
    });
    [-1, 1].forEach((s, i) => it.push({ p: [s * 27, 7, -16], s: [10, 14, 16], c: i ? C.peachD : '#EFBE98' }));
    [-1, 1].forEach((s) => it.push({ p: [s * 14, 1, 14], s: [16, 2, 0.6], c: C.peachD })); // boundary walls
    it.push({ p: [0, 0.03, -10], s: [4, 0.06, 56], c: C.grey }); // path
    return it;
  }, [low]);
  const people = useMemo(() => [[-9, -0.4, C.black], [-7.5, 0.8, C.red], [-6.5, -2.6, C.grey], [7.4, -2.6, C.black], [9.4, -3.6, C.red], [8.6, -5.3, C.grey],
    [-2.6, -10, C.red], [2.6, -10, C.black], [0, -7.4, C.grey], [0, -12.6, C.red], [-2.2, -12, C.black], [2.2, -8, C.red], [-2.2, -18, C.black], [1.6, -16.4, C.red], [4.4, -18, C.grey]], []);
  const P = { open, setOpen };
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, -10]}><planeGeometry args={[140, 110]} /><meshStandardMaterial color={C.peachD} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, -10]}><planeGeometry args={[34, 60]} /><meshStandardMaterial color={C.peach} /></mesh>
      <BoxField items={world} />
      <Hotspot id="gate" obj={[0, 0, 14]} mark={[0, 8.6, 0]} {...P}><Gate /></Hotspot>
      <Hotspot id="standee" obj={[3.6, 0, 9]} mark={[0, 4.4, 0]} {...P}><Standee v={1} /></Hotspot>
      <group position={[-3.6, 0, 9]}><Standee v={2} /></group>
      <Hotspot id="canopy" obj={[-9, 0, -2]} mark={[0, 4.8, 0]} {...P}><Canopy /></Hotspot>
      <Hotspot id="sampling" obj={[-9, 0, -2.4]} mark={[0, 2.4, 2.4]} {...P}><Counter /></Hotspot>
      <Hotspot id="gift" obj={[9, 0, -4]} mark={[0, 4.2, 0]} {...P}><Gift /></Hotspot>
      <Hotspot id="engage" obj={[0, 0, -10]} mark={[0, 5.4, 0]} {...P}><Stage /></Hotspot>
      <Hotspot id="flea" obj={[0, 0, -20]} mark={[0, 5.4, 0]} {...P}>
        <group><group position={[-4, 0, 0]}><Stall c={C.red} /></group><group position={[0, 0, 0]}><Stall c={C.black} /></group><group position={[4, 0, 0]}><Stall c={C.redD} /></group></group>
      </Hotspot>
      <People list={low ? people.slice(0, 9) : people} />
    </group>
  );
}

export const cameraKeys = [
  { t: 0, pos: [0, 2.4, 30], look: [0, 3, 0] },
  { t: 0.3, pos: [0, 1.9, 11], look: [0, 2.5, -8] },
  { t: 0.62, pos: [-7, 2.8, -5], look: [2, 1.5, -13] },
  { t: 1, pos: [6, 3.2, -10], look: [-1, 1.5, -24] },
];
export function Overlay() {
  return <SceneOverlay id="society" title="Inside the society" text="Gates, walkways, courtyards and festivals. Tap a marker to see how each RWA activation works." top />;
}
