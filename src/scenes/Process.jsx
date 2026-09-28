import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { scrollState } from '../state/scrollState';
import { smoothstep, clamp } from '../utils/sceneMath';
import { useDrawnTexture, SceneOverlay, C } from '../lib/kit';

const STEPS = [
  ['01', 'Place', 'We pick the exact spots, from roads and societies to towers and screens, where your audience really is.'],
  ['02', 'Engage', 'Sampling, activations and stalls that make people touch, try and talk to your brand.'],
  ['03', 'Execute', 'Our ground teams install, run and manage every site so the campaign lands on time.'],
  ['04', 'Report', 'Proof of display and clear campaign updates, shared with you for every location.'],
];
const GAP = 9, CY = 4.6;

function wrap(ctx, text, x, y, maxW, lh) {
  let line = '';
  text.split(' ').forEach((w) => { const t = line + w + ' '; if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y); line = w + ' '; y += lh; } else line = t; });
  ctx.fillText(line, x, y);
}
function Icon({ i }) {
  const g = useRef();
  useFrame((s) => { g.current.rotation.y = s.clock.elapsedTime * 0.8; });
  const red = <meshStandardMaterial color={C.red} flatShading />, blk = <meshStandardMaterial color={C.black} flatShading />;
  return (
    <group ref={g}>
      {i === 0 && <><mesh position={[0, -0.2, 0]} rotation-x={Math.PI}><coneGeometry args={[0.55, 1.3, 6]} />{red}</mesh><mesh position={[0, 0.7, 0]}><sphereGeometry args={[0.55, 8, 6]} />{red}</mesh></>}
      {i === 1 && <><mesh position={[-0.7, 0, 0]}><sphereGeometry args={[0.45, 8, 6]} />{red}</mesh><mesh position={[0.7, 0, 0]}><sphereGeometry args={[0.45, 8, 6]} />{blk}</mesh><mesh><torusGeometry args={[0.9, 0.08, 6, 20]} />{red}</mesh></>}
      {i === 2 && [0, 1, 2].map((k) => <mesh key={k} position={[(k - 1) * 0.7, -0.4 + k * 0.4, 0]}><boxGeometry args={[0.6, 0.8 + k * 0.8, 0.6]} />{k === 2 ? red : blk}</mesh>)}
      {i === 3 && [0, 1, 2].map((k) => <mesh key={k} position={[(k - 1) * 0.6, -0.5 + (0.5 + k * 0.4) / 2, 0]}><boxGeometry args={[0.45, 0.5 + k * 0.4, 0.45]} />{k === 2 ? red : blk}</mesh>)}
    </group>
  );
}
function Card({ i }) {
  const [n, title, desc] = STEPS[i], g = useRef();
  const { tex } = useDrawnTexture(512, 640, (ctx, w, h) => {
    ctx.fillStyle = C.peachD; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = C.black; ctx.lineWidth = 10; ctx.strokeRect(5, 5, w - 10, h - 10);
    ctx.fillStyle = C.red; ctx.textBaseline = 'top'; ctx.font = '800 150px Syne, "Arial Black", sans-serif'; ctx.fillText(n, 36, 30);
    ctx.fillStyle = C.black; ctx.font = '800 76px Syne, "Arial Black", sans-serif'; ctx.fillText(title, 36, 230);
    ctx.font = '400 28px "Space Mono", monospace'; wrap(ctx, desc, 36, 340, w - 72, 42);
  }, [i]);
  const x = (i - 1.5) * GAP, at = 0.03 + i * 0.22;
  useFrame((s) => {
    const v = smoothstep(at, at + 0.16, scrollState.scenes.process);
    g.current.scale.setScalar(0.3 + 0.7 * v);
    g.current.position.y = CY - 6 * (1 - v) + Math.sin(s.clock.elapsedTime + i) * 0.15;
    g.current.rotation.y = (1 - v) * 0.8 + Math.sin(s.clock.elapsedTime * 0.5 + i) * 0.04;
  });
  return (
    <group ref={g} position={[x, CY, -Math.abs(i - 1.5) * 0.8]}>
      <mesh position={[0, 0, -0.1]}><boxGeometry args={[6.3, 7.8, 0.2]} /><meshStandardMaterial color={C.black} flatShading /></mesh>
      <mesh><planeGeometry args={[6, 7.5]} /><meshStandardMaterial map={tex} /></mesh>
      <group position={[0, 5.2, 0]}><Icon i={i} /></group>
    </group>
  );
}
// squares that ripple along the track between cards (halftone dots turning into squares)
function Connectors() {
  const g = useRef();
  const pts = useMemo(() => [0, 1, 2].flatMap((k) => Array.from({ length: 5 }, (_, j) => ({ x: (k - 1) * GAP + 0.45 * GAP + (j * (0.1 * GAP + 0.2 + 0.0)) * 0.5 + 0.2, k, j }))), []);
  useFrame((s) => { const t = s.clock.elapsedTime; g.current.children.forEach((m, i) => { const v = 0.5 + 0.5 * Math.sin(t * 3 - i * 0.7); m.scale.setScalar(0.12 + 0.2 * v); m.rotation.z = v * 0.785; }); });
  return (
    <group ref={g}>
      {[0, 1, 2].flatMap((k) => [0, 1, 2, 3, 4].map((j) => (
        <mesh key={`${k}-${j}`} position={[(k - 1.5) * GAP + 3.3 + j * 0.6, CY, 0]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color={j % 2 ? C.black : C.red} flatShading /></mesh>
      )))}
    </group>
  );
}

export default function Scene() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, 0]}><planeGeometry args={[120, 60]} /><meshStandardMaterial color={C.peachD} /></mesh>
      {STEPS.map((_, i) => <Card key={i} i={i} />)}
      <Connectors />
    </group>
  );
}

const cx = (i) => (i - 1.5) * GAP;
export const cameraKeys = [
  { t: 0, pos: [cx(0) - 1, CY, 17], look: [cx(0), CY, 0] },
  { t: 0.33, pos: [cx(1), CY, 17], look: [cx(1), CY, 0] },
  { t: 0.66, pos: [cx(2), CY, 17], look: [cx(2), CY, 0] },
  { t: 1, pos: [cx(3) + 1, CY, 17], look: [cx(3), CY, 0] },
];

function Steps() {
  const el = useRef();
  useEffect(() => {
    const f = () => { const on = clamp(Math.floor(scrollState.scenes.process * 4), 0, 3); el.current && [...el.current.children].forEach((c, i) => c.classList.toggle('on', i === on)); };
    gsap.ticker.add(f); return () => gsap.ticker.remove(f);
  }, []);
  return <div className="steps" ref={el}>{STEPS.map((s) => <span key={s[1]}>{s[0]} {s[1]}</span>)}</div>;
}
export function Overlay() {
  return <SceneOverlay id="process" title="How we work" text="" top compact><Steps /></SceneOverlay>;
}
