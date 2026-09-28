import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { COLORS } from '../config/siteConfig';
import { scrollState } from '../state/scrollState';
import { smoothstep, clamp } from '../utils/sceneMath';
import { scrollToScene } from '../engine/ScrollDriver';

const Y0 = 3; // headline height (local space)

function makeTex(shape) {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'); x.fillStyle = '#fff';
  if (shape === 'dot') { x.beginPath(); x.arc(32, 32, 30, 0, Math.PI * 2); x.fill(); } else x.fillRect(6, 6, 52, 52);
  return new THREE.CanvasTexture(c);
}

// Renders the tagline to a hidden canvas and returns dot positions (units of "text width").
function sampleText(aspect, step) {
  const lines = aspect < 1 ? ['RIGHT', 'PLACEMENT.', 'TRUE', 'ENGAGEMENT.'] : ['RIGHT PLACEMENT.', 'TRUE ENGAGEMENT.'];
  const fs = 120, lh = 150, font = `800 ${fs}px Syne, "Arial Black", sans-serif`;
  const c = document.createElement('canvas'), g = c.getContext('2d');
  g.font = font;
  const w = Math.ceil(Math.max(...lines.map((l) => g.measureText(l).width))) + 20, h = lh * lines.length;
  c.width = w; c.height = h;
  g.font = font; g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((l, i) => g.fillText(l, w / 2, lh * (i + 0.5)));
  const d = g.getImageData(0, 0, w, h).data, pts = [];
  for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) if (d[(y * w + x) * 4 + 3] > 128) pts.push([(x - w / 2) / w, -(y - h / 2) / w]);
  return pts;
}

export default function Scene() {
  const N = scrollState.quality === 'low' ? 1800 : 5000;
  const mat = useRef();
  const tex = useMemo(() => ({ dot: makeTex('dot'), sq: makeTex('sq') }), []);

  // simulation buffers
  const sim = useMemo(() => {
    const aspect = window.innerWidth / window.innerHeight;
    const hw = clamp(aspect * 9, 6, 18) + 2;
    const home = new Float32Array(N * 3), pos = new Float32Array(N * 3), target = new Float32Array(N * 3);
    const vel = new Float32Array(N * 3), ph = new Float32Array(N), hasT = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      home[i * 3] = (Math.random() * 2 - 1) * hw; home[i * 3 + 1] = Y0 + (Math.random() * 2 - 1) * 8; home[i * 3 + 2] = -6 + Math.random() * 10;
      pos.set(home.subarray(i * 3, i * 3 + 3), i * 3); ph[i] = Math.random() * 6.28;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return { home, pos, target, vel, ph, hasT, geo, aspect };
  }, [N]);

  // once the font is ready, assign text targets to a random subset of particles
  useEffect(() => {
    let dead = false;
    const go = () => {
      if (dead) return;
      const { aspect, target, hasT } = sim;
      const worldW = clamp(aspect * 14, 7, 20);
      let pts = sampleText(aspect, scrollState.quality === 'low' ? 8 : 6);
      const max = Math.floor(N * 0.8);
      if (pts.length > max) { pts.sort(() => Math.random() - 0.5); pts = pts.slice(0, max); }
      const idx = Array.from({ length: N }, (_, i) => i).sort(() => Math.random() - 0.5);
      pts.forEach((p, k) => { const i = idx[k]; target[i * 3] = p[0] * worldW; target[i * 3 + 1] = Y0 + p[1] * worldW; target[i * 3 + 2] = 0; hasT[i] = 1; });
    };
    (document.fonts && document.fonts.load ? document.fonts.load('800 100px Syne') : Promise.resolve()).catch(() => {}).then(go);
    return () => { dead = true; };
  }, [sim, N]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05), t = state.clock.elapsedTime, h = scrollState.scenes.hero;
    const since = window.__dnmnRevealed ? (performance.now() - window.__dnmnRevealed) / 1000 : 0;
    const form = smoothstep(0.5, 2.6, since) * (1 - smoothstep(0.3, 0.85, h)); // 0 = floating, 1 = headline
    const vp = state.viewport.getCurrentViewport(state.camera, [0, Y0, 0]);
    const cx = scrollState.pointer.x * vp.width * 0.5, cy = Y0 + scrollState.pointer.y * vp.height * 0.5;
    const { home, pos, vel, target, ph, hasT, geo } = sim;
    const k = form > 0.5 ? 9 : 4, R = 3.2, dm = Math.exp(-4 * dt);
    for (let i = 0; i < N; i++) {
      const a = i * 3;
      const hx = home[a] + Math.sin(t * 0.35 + ph[i]) * 0.5, hy = home[a + 1] + Math.cos(t * 0.3 + ph[i] * 1.3) * 0.5, hz = home[a + 2];
      const dx = hasT[i] ? hx + (target[a] - hx) * form : hx, dy = hasT[i] ? hy + (target[a + 1] - hy) * form : hy, dz = hasT[i] ? hz + (target[a + 2] - hz) * form : hz;
      vel[a] += (dx - pos[a]) * k * dt; vel[a + 1] += (dy - pos[a + 1]) * k * dt; vel[a + 2] += (dz - pos[a + 2]) * k * dt;
      const ox = pos[a] - cx, oy = pos[a + 1] - cy, d2 = ox * ox + oy * oy;
      if (d2 < R * R) { // magnet: pulls dots in while floating, pushes them aside once they form the headline
        const d = Math.sqrt(d2) + 1e-4, f = 1 - d / R, s = form < 0.4 ? -16 : 34;
        vel[a] += (ox / d) * f * s * dt; vel[a + 1] += (oy / d) * f * s * dt;
      }
      vel[a] *= dm; vel[a + 1] *= dm; vel[a + 2] *= dm;
      pos[a] += vel[a] * dt; pos[a + 1] += vel[a + 1] * dt; pos[a + 2] += vel[a + 2] * dt;
    }
    geo.attributes.position.needsUpdate = true;
    if (mat.current) { // halftone dots -> pixel squares as you leave the hero
      const want = h > 0.22 ? tex.sq : tex.dot;
      if (mat.current.map !== want) { mat.current.map = want; mat.current.needsUpdate = true; }
    }
  });

  return (
    <points geometry={sim.geo} frustumCulled={false}>
      <pointsMaterial ref={mat} color={COLORS.red} size={scrollState.quality === 'low' ? 0.11 : 0.09} map={tex.dot} alphaTest={0.5} transparent depthWrite={false} sizeAttenuation />
    </points>
  );
}

export const cameraKeys = [
  { t: 0, pos: [0, Y0, 17], look: [0, Y0, 0] },
  { t: 0.6, pos: [0, Y0, 14], look: [0, Y0, 0] },
  { t: 1, pos: [0, 2.5, 10], look: [0, 2.5, -30] },
];

export function Overlay() {
  const root = useRef();
  useEffect(() => {
    const f = () => {
      const el = root.current; if (!el) return;
      const o = 1 - smoothstep(0.35, 0.75, scrollState.scenes.hero);
      el.style.opacity = o; el.style.visibility = o < 0.02 ? 'hidden' : 'visible';
    };
    gsap.ticker.add(f);
    return () => gsap.ticker.remove(f);
  }, []);
  return (
    <div ref={root} className="ov">
      <h1 className="sr-only">Right Placement. True Engagement. Display Nexus Media Networks</h1>
      <div className="hero-bottom">
        <p className="hero-pitch">Offline branding and activations that put your brand where India actually lives.</p>
        <button className="btn" data-cursor onClick={() => scrollToScene('contact')}>Plan a Campaign</button>
        <span className="scroll-cue">Scroll to enter</span>
      </div>
    </div>
  );
}
