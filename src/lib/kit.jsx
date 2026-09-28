// Shared helpers for all scenes (materials, ad panels, instancing, labels, overlay).
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { scrollState } from '../state/scrollState';
import { fadeWindow, smoothstep } from '../utils/sceneMath';

export const C = { peach: '#F8DEC5', peachD: '#F2C9A6', red: '#E01E26', redD: '#B8151B', black: '#111111', grey: '#2A2A2A', white: '#FFFFFF' };
export const isLow = () => scrollState.quality === 'low';
export const rng = (seed) => { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

/* ---------- canvas textures ---------- */
export function useDrawnTexture(w, h, draw, deps = []) {
  const o = useMemo(() => {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const redraw = (...a) => { draw(ctx, w, h, ...a); tex.needsUpdate = true; };
    redraw();
    return { tex, redraw };
  }, deps); // eslint-disable-line
  useEffect(() => {
    let dead = false;
    (document.fonts && document.fonts.load ? document.fonts.load('800 40px Syne') : Promise.resolve()).then(() => { if (!dead) o.redraw(); }).catch(() => {});
    return () => { dead = true; };
  }, [o]);
  return o;
}

// Placeholder ad: halftone dots turning into squares + "YOUR BRAND HERE"
export function drawAd(ctx, w, h, label = 'YOUR BRAND HERE', v = 0) {
  const bg = [C.red, C.black, C.peach][v % 3], dot = [C.redD, C.red, C.red][v % 3], fg = [C.peach, C.peach, C.black][v % 3];
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  const step = 16; ctx.fillStyle = dot;
  for (let y = step / 2; y < h; y += step) for (let x = step / 2; x < w; x += step) {
    const r = (x / w) * step * 0.42; ctx.beginPath();
    if (x > w * 0.6) ctx.rect(x - r, y - r, r * 2, r * 2); else ctx.arc(x, y, r, 0, 6.283);
    ctx.fill();
  }
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `800 ${Math.round(h * 0.15)}px Syne, "Arial Black", sans-serif`; ctx.fillText(label, w / 2, h / 2);
  ctx.font = `700 ${Math.round(h * 0.05)}px "Space Mono", monospace`; ctx.fillText('DISPLAY NEXUS MEDIA', w / 2, h * 0.78);
}

export function AdPanel({ position = [0, 0, 0], rotation = [0, 0, 0], size = [4, 2.25], variant = 0, label, glow = 0, frame = true, matRef }) {
  const { tex } = useDrawnTexture(512, 288, (ctx, w, h) => drawAd(ctx, w, h, label, variant), [label, variant]);
  return (
    <group position={position} rotation={rotation}>
      {frame && <mesh position={[0, 0, -0.06]}><boxGeometry args={[size[0] + 0.3, size[1] + 0.3, 0.1]} /><meshStandardMaterial color={C.black} flatShading /></mesh>}
      <mesh><planeGeometry args={size} /><meshStandardMaterial ref={matRef} map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={glow} /></mesh>
    </group>
  );
}

/* ---------- instancing ---------- */
// items: [{p:[x,y,z] (center), s:[w,h,d], c:'#hex'}] - keep the array stable (useMemo)
export function BoxField({ items }) {
  const ref = useRef();
  useLayoutEffect(() => {
    const m = ref.current, o = new THREE.Object3D(), col = new THREE.Color();
    items.forEach((it, i) => { o.position.set(...it.p); o.scale.set(...it.s); o.updateMatrix(); m.setMatrixAt(i, o.matrix); m.setColorAt(i, col.set(it.c || C.peachD)); });
    m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [items]);
  return (
    <instancedMesh ref={ref} args={[null, null, Math.max(1, items.length)]} frustumCulled={false}>
      <boxGeometry /><meshStandardMaterial flatShading />
    </instancedMesh>
  );
}

/* ---------- the shared Indian street look ---------- */
// side: -1 left / +1 right of a road running along z. gaps: [[zHigh,zLow],...] to leave empty
export function cityBuildings(seed, zStart, zEnd, side, gaps = []) {
  const r = rng(seed), out = [], xEdge = side * 8.5, low = isLow();
  let z = zStart;
  while (z > zEnd) {
    const w = 6 + r() * 4, h = 6 + r() * (low ? 9 : 15), d = 8 + r() * 4, zc = z - w / 2;
    const skip = gaps.some(([a, b]) => z > b && z - w < a);
    if (!skip) {
      const cx = xEdge + (side * d) / 2, col = [C.peachD, '#EFBE98', C.grey, C.peach][Math.floor(r() * 4)];
      out.push({ p: [cx, h / 2, zc], s: [d, h, w], c: col });
      out.push({ p: [xEdge - side * 0.15, 2.7, zc], s: [0.5, 1.1, w * 0.85], c: r() > 0.5 ? C.red : C.black });
      out.push({ p: [xEdge - side * 0.05, 1.1, zc], s: [0.3, 2.2, w * 0.5], c: C.grey });
      if (r() > 0.6) out.push({ p: [cx, h + 0.7, zc], s: [1.6, 1.4, 1.6], c: C.black });
    }
    z -= w + 0.4;
  }
  return out;
}
export function poles(zStart, zEnd, gap = 12) {
  const out = []; let n = 0;
  for (let z = zStart; z > zEnd; z -= gap, n++) for (const s of [-1, 1]) {
    out.push({ p: [s * 6.6, 3.5, z], s: [0.18, 7, 0.18], c: C.black });
    out.push({ p: [s * 6.6, 6.6, z], s: [1.8, 0.15, 0.15], c: C.black });
    if (n % 2 === 0) out.push({ p: [s * 6.0, 5.2, z], s: [0.05, 1.5, 0.8], c: C.red });
  }
  return out;
}
export function CityGround({ z = -20, length = 170 }) {
  const dashes = useMemo(() => { const o = []; for (let d = length / 2; d > -length / 2; d -= 6) o.push({ p: [0, 0.04, z + d], s: [0.25, 0.02, 2.4], c: C.white }); return o; }, [z, length]);
  const walks = useMemo(() => [-1, 1].map((s) => ({ p: [s * 6.2, 0.08, z], s: [3.6, 0.16, length], c: C.peach })), [z, length]);
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, z]}><planeGeometry args={[220, length + 40]} /><meshStandardMaterial color={C.peachD} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, z]}><planeGeometry args={[9, length]} /><meshStandardMaterial color={C.grey} /></mesh>
      <BoxField items={walks} /><BoxField items={dashes} />
    </group>
  );
}

/* ---------- labels + overlay ---------- */
// 3D-anchored label that pops in for a window of the scene's local progress
export function PopLabel({ id, position, children, from = 0, to = 1 }) {
  const el = useRef();
  useFrame(() => {
    if (!el.current) return;
    const p = scrollState.scenes[id];
    const v = smoothstep(from, from + 0.06, p) * (1 - smoothstep(to - 0.06, to, p));
    el.current.style.opacity = v; el.current.style.transform = `scale(${0.6 + 0.4 * v})`;
  });
  return (
    <Html position={position} center pointerEvents="none" zIndexRange={[10, 0]}>
      <div ref={el} className="pop-label">{children}</div>
    </Html>
  );
}

export function SceneOverlay({ id, title, text, top = false, compact = false, children }) {
  const root = useRef();
  useEffect(() => {
    const f = () => {
      const el = root.current; if (!el) return;
      const o = fadeWindow(scrollState.scenes[id], 0.14, 0.86);
      el.style.opacity = o; el.style.visibility = o < 0.02 ? 'hidden' : 'visible';
    };
    gsap.ticker.add(f); f();
    return () => gsap.ticker.remove(f);
  }, [id]);
  return (
    <div ref={root} className="ov" style={{ visibility: 'hidden' }}>
      <div className={`ov-copy${top ? ' top' : ''}${compact ? ' compact' : ''}`}><h2>{title}</h2><p>{text}</p>{children}</div>
    </div>
  );
}
