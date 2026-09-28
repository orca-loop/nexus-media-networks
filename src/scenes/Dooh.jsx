import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BoxField, CityGround, cityBuildings, poles, drawAd, useDrawnTexture, PopLabel, SceneOverlay, C } from '../lib/kit';

const SLIDES = ['YOUR BRAND HERE', 'NOW SERVING', 'FESTIVE OFFER'];

// Glowing screen: cycles ad slides, brightens and skips to the next slide on hover/click
function Screen({ position, rotation, variant = 0, size = [5, 2.8] }) {
  const { tex, redraw } = useDrawnTexture(512, 288, (ctx, w, h, i = 0) => drawAd(ctx, w, h, SLIDES[i % 3], (variant + i) % 3), [variant]);
  const mat = useRef(), hover = useRef(false), idx = useRef(0), last = useRef(0);
  const next = () => { idx.current++; redraw(idx.current); };
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (t - last.current > 2.4) { last.current = t; next(); }
    if (mat.current) mat.current.emissiveIntensity += ((hover.current ? 1.25 : 0.6) - mat.current.emissiveIntensity) * 0.1;
  });
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.06]}><boxGeometry args={[size[0] + 0.4, size[1] + 0.4, 0.12]} /><meshStandardMaterial color={C.black} flatShading /></mesh>
      <mesh onPointerOver={() => { hover.current = true; next(); }} onPointerOut={() => { hover.current = false; }} onClick={next}>
        <planeGeometry args={size} />
        <meshStandardMaterial ref={mat} map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

// venues along the street: [name, z, side, height, accent color]
const VENUES = [['Cafe Screens', 8, -1, 6, C.red], ['Restaurant Screens', -6, 1, 7, C.black], ['Hotel Lobby', -20, -1, 10, C.red], ['Bus Stop', -34, 1, 0, C.black], ['Corporate Towers', -48, -1, 26, C.grey]];

export default function Scene() {
  const gapsL = VENUES.filter((v) => v[2] === -1).map((v) => [v[1] + 6, v[1] - 6]);
  const gapsR = VENUES.filter((v) => v[2] === 1).map((v) => [v[1] + 6, v[1] - 6]);
  const items = useMemo(() => {
    const base = [...cityBuildings(21, 32, -74, -1, gapsL), ...cityBuildings(22, 32, -74, 1, gapsR), ...poles(32, -74)];
    VENUES.forEach(([, z, side, h, acc], i) => {
      if (!h) { // bus shelter
        base.push({ p: [6.2, 3.1, z], s: [4.4, 0.2, 2.4], c: acc }, { p: [4.2, 1.5, z - 1], s: [0.15, 3, 0.15], c: C.black }, { p: [4.2, 1.5, z + 1], s: [0.15, 3, 0.15], c: C.black }, { p: [6.2, 0.5, z + 0.9], s: [3, 0.15, 0.6], c: C.grey });
        return;
      }
      const d = 9;
      base.push({ p: [side * (8.5 + d / 2), h / 2, z], s: [d, h, 11], c: i % 2 ? C.peachD : '#EFBE98' });
      base.push({ p: [side * 8.3, 5.3 + (h > 8 ? 1 : 0), z], s: [0.4, 0.5, 11], c: acc }); // fascia above screen
      base.push({ p: [side * 8.3, 0.9, z + 3.5], s: [0.3, 1.8, 1.6], c: C.white }); // door glass
    });
    return base;
  }, []); // eslint-disable-line
  return (
    <group>
      <CityGround z={-20} />
      <BoxField items={items} />
      {VENUES.map(([name, z, side, h], i) => (
        h
          ? <Screen key={name} position={[side * 8.25, 3.6, z - 0.5]} rotation={[0, -side * Math.PI / 2, 0]} variant={i} />
          : <Screen key={name} position={[4.0, 1.6, z]} rotation={[0, Math.PI / 2, 0]} variant={i} size={[1.8, 2.6]} />
      ))}
      {VENUES.map(([name, z, side], i) => {
        const t = (26 - z) / 76; // approx. camera progress when passing
        return <PopLabel key={name} id="dooh" position={[side * 6, 7.2, z]} from={Math.max(0, t - 0.18)} to={Math.min(1.1, t + 0.14)}>{name}</PopLabel>;
      })}
    </group>
  );
}

export const cameraKeys = [
  { t: 0, pos: [1.5, 1.7, 22], look: [0, 3, 0] },
  { t: 0.5, pos: [0, 1.8, -14], look: [3, 3, -30] },
  { t: 1, pos: [-1, 1.8, -52], look: [0, 4, -80] },
];
export function Overlay() {
  return <SceneOverlay id="dooh" title="Screens everywhere" text="Cafes, restaurants, hotel lobbies, bus stops and corporate towers. Hover a screen to change the ad." top />;
}
