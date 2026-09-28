import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { scrollState } from '../state/scrollState';
import { smoothstep } from '../utils/sceneMath';
import { AdPanel, BoxField, CityGround, cityBuildings, poles, SceneOverlay, C } from '../lib/kit';

export default function Scene() {
  const items = useMemo(() => [...cityBuildings(11, 32, -74, -1), ...cityBuildings(12, 32, -74, 1), ...poles(32, -74)], []);
  const stop = useMemo(() => [
    { p: [6.4, 3, -10], s: [4, 0.2, 2.2], c: C.red }, { p: [4.6, 1.5, -10], s: [0.15, 3, 0.15], c: C.black },
    { p: [8.2, 1.5, -10], s: [0.15, 3, 0.15], c: C.black }, { p: [6.4, 0.5, -10.6], s: [3, 0.15, 0.7], c: C.black },
  ], []);
  const hoard = useMemo(() => [
    { p: [-2.4, 3.5, 0], s: [0.4, 7, 0.4], c: C.black }, { p: [2.4, 3.5, 0], s: [0.4, 7, 0.4], c: C.black },
  ], []);
  const glow1 = useRef(), glow2 = useRef();
  useFrame(() => {
    const p = scrollState.scenes.street;
    if (glow1.current) glow1.current.emissiveIntensity = 0.1 + smoothstep(0.25, 0.55, p) * 0.9; // the hoarding "lights up"
    if (glow2.current) glow2.current.emissiveIntensity = 0.1 + smoothstep(0.55, 0.85, p) * 0.8;
  });
  return (
    <group>
      <CityGround z={-20} />
      <BoxField items={items} />
      <BoxField items={stop} />
      <AdPanel position={[6.6, 2, -10.9]} size={[1.6, 2.4]} variant={2} matRef={undefined} />
      <group position={[-7, 0, -30]} rotation-y={0.55}>
        <BoxField items={hoard} />
        <AdPanel position={[0, 8.2, 0.1]} size={[9, 4.6]} variant={0} glow={0} matRef={glow1} />
      </group>
      <group position={[7, 0, -50]} rotation-y={-0.55}>
        <BoxField items={hoard} />
        <AdPanel position={[0, 8.2, 0.1]} size={[9, 4.6]} variant={1} glow={0} matRef={glow2} />
      </group>
    </group>
  );
}

export const cameraKeys = [
  { t: 0, pos: [0, 1.7, 26], look: [0, 3, 0] },
  { t: 0.5, pos: [0.5, 1.7, -4], look: [-6, 5.5, -30] },
  { t: 1, pos: [0, 1.8, -34], look: [4, 5, -70] },
];
export function Overlay() {
  return <SceneOverlay id="street" title="Hoardings & OOH" text="Big, bold, unmissable placements on the roads Tier 2 and Tier 3 India travels every day." />;
}
