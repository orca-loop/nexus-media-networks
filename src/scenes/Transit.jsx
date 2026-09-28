import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { scrollState } from '../state/scrollState';
import { AdPanel, BoxField, CityGround, cityBuildings, SceneOverlay, isLow, C } from '../lib/kit';

const Wheel = ({ p, r = 0.55 }) => (
  <mesh position={p} rotation-x={Math.PI / 2}><cylinderGeometry args={[r, r, 0.4, 8]} /><meshStandardMaterial color={C.black} flatShading /></mesh>
);

function Bus() {
  return (
    <group>
      <mesh position={[0, 2.1, 0]}><boxGeometry args={[9, 3, 2.6]} /><meshStandardMaterial color={C.red} flatShading /></mesh>
      <mesh position={[0, 3.1, 0]}><boxGeometry args={[8.6, 0.9, 2.7]} /><meshStandardMaterial color={C.black} flatShading /></mesh>
      <mesh position={[4.55, 1.6, 0]}><boxGeometry args={[0.1, 0.5, 2]} /><meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.6} /></mesh>
      <AdPanel position={[-0.3, 1.6, 1.32]} size={[6.2, 1.3]} variant={2} frame={false} />
      <AdPanel position={[-0.3, 1.6, -1.32]} rotation={[0, Math.PI, 0]} size={[6.2, 1.3]} variant={1} frame={false} />
      {[-3, 3].flatMap((x) => [-1.3, 1.3].map((z) => <Wheel key={`${x}${z}`} p={[x, 0.55, z]} />))}
    </group>
  );
}
function Auto() {
  return (
    <group>
      <mesh position={[0, 1.0, 0]}><boxGeometry args={[2.6, 1.3, 1.5]} /><meshStandardMaterial color={C.red} flatShading /></mesh>
      <mesh position={[-0.2, 2.2, 0]}><boxGeometry args={[2.2, 0.15, 1.7]} /><meshStandardMaterial color={C.black} flatShading /></mesh>
      {[[-1, -0.7], [-1, 0.7], [0.9, -0.7], [0.9, 0.7]].map(([x, z], i) => <mesh key={i} position={[x, 1.6, z]}><boxGeometry args={[0.08, 1.2, 0.08]} /><meshStandardMaterial color={C.black} /></mesh>)}
      <AdPanel position={[-0.4, 1.0, 0.77]} size={[1.3, 0.7]} variant={0} frame={false} />
      <AdPanel position={[-0.4, 1.0, -0.77]} rotation={[0, Math.PI, 0]} size={[1.3, 0.7]} variant={2} frame={false} />
      <Wheel p={[1.0, 0.4, 0]} r={0.4} /><Wheel p={[-0.9, 0.4, -0.75]} r={0.4} /><Wheel p={[-0.9, 0.4, 0.75]} r={0.4} />
    </group>
  );
}

// A vehicle that loops along the road; speed follows scroll velocity
function Mover({ x0, z, dir, base, children }) {
  const g = useRef();
  useFrame((_, dt) => {
    const v = (base + scrollState.velocity * 34) * dir * Math.min(dt, 0.05);
    let x = g.current.position.x + v;
    if (x > 46) x = -46; if (x < -46) x = 46;
    g.current.position.x = x;
  });
  return <group ref={g} position={[x0, 0, z]} rotation-y={dir > 0 ? 0 : Math.PI}>{children}</group>;
}

export default function Scene() {
  const low = isLow();
  const back = useMemo(() => cityBuildings(31, 50, -50, 1), []);
  const shelter = useMemo(() => [
    { p: [-6, 3.1, 7], s: [4.4, 0.2, 2.2], c: C.red }, { p: [-8, 1.5, 6.1], s: [0.15, 3, 0.15], c: C.black }, { p: [-8, 1.5, 7.9], s: [0.15, 3, 0.15], c: C.black },
    { p: [-4, 1.5, 6.1], s: [0.15, 3, 0.15], c: C.black }, { p: [-4, 1.5, 7.9], s: [0.15, 3, 0.15], c: C.black }, { p: [-6, 0.5, 7.7], s: [3, 0.15, 0.6], c: C.grey },
  ], []);
  return (
    <group>
      <group rotation-y={Math.PI / 2}><CityGround z={0} length={110} /><BoxField items={back} /></group>
      <BoxField items={shelter} />
      <AdPanel position={[-6, 1.8, 6.2]} size={[2, 2.6]} variant={1} />
      <Mover x0={-24} z={-1.6} dir={1} base={4}><Bus /></Mover>
      {!low && <Mover x0={18} z={-1.6} dir={1} base={4}><Bus /></Mover>}
      <Mover x0={-30} z={1.8} dir={-1} base={5}><Auto /></Mover>
      <Mover x0={-2} z={1.8} dir={-1} base={5}><Auto /></Mover>
      {!low && <Mover x0={28} z={1.8} dir={-1} base={5}><Auto /></Mover>}
    </group>
  );
}

export const cameraKeys = [
  { t: 0, pos: [-10, 2.2, 15], look: [-2, 1.8, 0] },
  { t: 0.5, pos: [0, 3, 13], look: [0, 1.8, 0] },
  { t: 1, pos: [10, 2.4, 15], look: [4, 1.8, 0] },
];
export function Overlay() {
  return <SceneOverlay id="transit" title="Transit media that moves with the city" text="Buses and autos carry your brand through every lane. Scroll faster and the traffic speeds up." top />;
}
