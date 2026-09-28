import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { scrollState } from '../state/scrollState';
import { AdPanel, BoxField, PopLabel, SceneOverlay, isLow, rng, C } from '../lib/kit';

const RISE = 55; // lift travels from lobby (y 0) to rooftop (y 55)

const M = ({ p, s, c }) => <mesh position={p} ><boxGeometry args={s} /><meshStandardMaterial color={c} flatShading /></mesh>;
const MiniCanopy = () => (
  <group>
    {[[-1.3, -1], [1.3, -1], [-1.3, 1], [1.3, 1]].map(([x, z], i) => <M key={i} p={[x, 1.4, z]} s={[0.12, 2.8, 0.12]} c={C.black} />)}
    <M p={[0, 2.9, 0]} s={[3.2, 0.18, 2.6]} c={C.red} /><M p={[0, 0.5, 0]} s={[2.4, 1, 0.9]} c={C.black} />
  </group>
);

export default function Scene() {
  const cab = useRef();
  const low = isLow();
  const sky = useMemo(() => { // low-poly skyline all around the tower
    const r = rng(77), out = [], n = low ? 45 : 90;
    for (let i = 0; i < n; i++) {
      const x = (r() * 2 - 1) * 60, z = -26 - r() * 48, h = 5 + r() * 45, w = 4 + r() * 5;
      out.push({ p: [x, h / 2, z], s: [w, h, w + r() * 3], c: [C.peachD, '#EFBE98', C.grey, C.black, C.peach, C.red][Math.floor(r() * (r() > 0.9 ? 6 : 5))] });
    }
    return out;
  }, [low]);
  const fixed = useMemo(() => {
    const it = [
      { p: [-12, 3, 4], s: [0.4, 6, 34], c: C.peachD }, { p: [12, 3, 4], s: [0.4, 6, 34], c: C.peachD }, // lobby walls
      { p: [0, -0.1, 4], s: [24, 0.2, 34], c: C.peach }, // lobby floor
      { p: [0, 0.6, -4.5], s: [6, 1.2, 1.2], c: C.black }, // reception desk
      { p: [-1.75, RISE / 2 + 1, -13.4], s: [0.2, RISE + 4, 0.2], c: C.black }, { p: [1.75, RISE / 2 + 1, -13.4], s: [0.2, RISE + 4, 0.2], c: C.black }, // shaft
      { p: [-1.75, RISE / 2 + 1, -10.6], s: [0.2, RISE + 4, 0.2], c: C.black }, { p: [1.75, RISE / 2 + 1, -10.6], s: [0.2, RISE + 4, 0.2], c: C.black },
      { p: [0, RISE - 0.2, 0.9], s: [26, 0.4, 22], c: C.peach }, // rooftop platform
      { p: [0, RISE + 0.5, 12.1], s: [26, 1, 0.4], c: C.peachD }, { p: [-13, RISE + 0.5, 0.9], s: [0.4, 1, 22], c: C.peachD }, { p: [13, RISE + 0.5, 0.9], s: [0.4, 1, 22], c: C.peachD },
    ];
    for (let y = 4; y < RISE; y += 3.5) it.push({ p: [-1.75, y, -13.5], s: [0.3, 0.25, 0.3], c: C.red }, { p: [1.75, y, -13.5], s: [0.3, 0.25, 0.3], c: C.red }); // floor markers
    for (let i = -2; i <= 2; i++) if (i) it.push({ p: [i * 5, 3, -1], s: [0.6, 6, 0.6], c: C.grey }); // lobby columns
    return it;
  }, []);
  // the cab rides exactly with the camera so nothing jitters
  useFrame((s) => { if (cab.current) cab.current.position.y = Math.min(RISE, Math.max(0, s.camera.position.y - 1.7 - scrollState.pointer.y * 0.35)); });
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.2, -20]}><planeGeometry args={[240, 200]} /><meshStandardMaterial color={C.peachD} /></mesh>
      <BoxField items={sky} /><BoxField items={fixed} />
      <group position={[6, 0, 2]}><M p={[0, 0.5, 0]} s={[2.6, 1, 1]} c={C.black} /><M p={[0, 1.1, 0]} s={[0.6, 0.25, 0.6]} c={C.red} /></group>
      <group position={[-7, 0, 4]}><MiniCanopy /></group>
      <group position={[0, 0, -12]} ref={cab}>
        <M p={[0, 0, 0]} s={[3, 0.15, 3]} c={C.black} /><M p={[0, 2.7, 0]} s={[3, 0.15, 3]} c={C.black} /><M p={[0, 2.5, 0]} s={[3, 0.1, 3]} c={C.red} />
        <AdPanel position={[-1.45, 1.4, 0]} rotation={[0, Math.PI / 2, 0]} size={[2.8, 1.9]} variant={0} frame={false} />
        <AdPanel position={[1.45, 1.4, 0]} rotation={[0, -Math.PI / 2, 0]} size={[2.8, 1.9]} variant={1} frame={false} />
        <PopLabel id="tower" position={[0.9, 2.3, 0.6]} from={0.4} to={0.82}>Lift Branding</PopLabel>
      </group>
      <group position={[-6, RISE, -1]} rotation-y={0.3}>
        <M p={[-3, 1.5, 0]} s={[0.3, 3, 0.3]} c={C.black} /><M p={[3, 1.5, 0]} s={[0.3, 3, 0.3]} c={C.black} />
        <AdPanel position={[0, 4.3, 0.2]} size={[8.6, 3.4]} variant={2} />
        <PopLabel id="tower" position={[0, 7.6, 0]} from={0.86} to={1.1}>Corporate Branding</PopLabel>
      </group>
      <PopLabel id="tower" position={[6, 3.4, 2]} from={0.04} to={0.3}>Corporate Sampling</PopLabel>
      <PopLabel id="tower" position={[-7, 4.4, 4]} from={0.1} to={0.34}>Canopy in Corporate Parks</PopLabel>
    </group>
  );
}

export const cameraKeys = [
  { t: 0, pos: [0, 1.7, 22], look: [0, 2.5, 0] },
  { t: 0.22, pos: [-2, 1.7, 6], look: [0, 2.5, -12] },
  { t: 0.38, pos: [0, 1.7, -10.7], look: [0, 1.7, -40] },
  { t: 0.86, pos: [0, RISE + 1.7, -10.7], look: [0, RISE + 1, -40] },
  { t: 1, pos: [0, RISE + 3.5, 4], look: [0, RISE - 3, -45] },
];
export const fog = { near: 30, far: 150 };
export function Overlay() {
  return <SceneOverlay id="tower" title="Where corporate India waits" text="Lift panels, sampling desks and canopies inside the towers where thousands of professionals work every day." top />;
}
