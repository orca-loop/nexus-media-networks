import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { registry } from './sceneRegistry';
import { scrollState } from '../state/scrollState';
import { SCENE_SPACING } from '../config/siteConfig';

// Catmull-Rom on one component
const cr = (a, b, c, d, t) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
const ss = (t) => t * t * (3 - 2 * t);

// Merge every scene's local cameraKeys into ONE global path in world coordinates.
function buildPath() {
  const ks = [];
  registry.forEach((s) => (s.cameraKeys || []).forEach((k) => {
    const z = s.index * SCENE_SPACING;
    ks.push({ p: s.start + (s.end - s.start) * k.t, s: s.index,
      pos: [k.pos[0], k.pos[1], k.pos[2] - z], look: [k.look[0], k.look[1], k.look[2] - z] });
  }));
  return ks.sort((a, b) => a.p - b.p);
}

function sample(ks, p, field, out) {
  if (!ks.length) return out.set(0, 3, 14);
  let i = -1;
  for (let j = 0; j < ks.length - 1; j++) if (p >= ks[j].p && p < ks[j + 1].p) { i = j; break; }
  if (i < 0) { const k = p < ks[0].p ? ks[0] : ks[ks.length - 1]; return out.set(...k[field]); }
  const a = ks[i], b = ks[i + 1];
  const u = (p - a.p) / (b.p - a.p);
  if (a.s !== b.s) { // gap between two scenes: gentle ease
    const e = ss(u);
    return out.set(a[field][0] + (b[field][0] - a[field][0]) * e, a[field][1] + (b[field][1] - a[field][1]) * e, a[field][2] + (b[field][2] - a[field][2]) * e);
  }
  const p0 = ks[i - 1] && ks[i - 1].s === a.s ? ks[i - 1] : a; // never borrow tangents from another scene
  const p3 = ks[i + 2] && ks[i + 2].s === b.s ? ks[i + 2] : b;
  return out.set(cr(p0[field][0], a[field][0], b[field][0], p3[field][0], u), cr(p0[field][1], a[field][1], b[field][1], p3[field][1], u), cr(p0[field][2], a[field][2], b[field][2], p3[field][2], u));
}

export default function CameraRig() {
  const keys = useMemo(buildPath, []);
  const tp = useRef(new THREE.Vector3()), tl = useRef(new THREE.Vector3());
  const cur = useRef(null), look = useRef(new THREE.Vector3());

  useFrame(({ camera }, delta) => {
    const dt = Math.min(delta, 0.05);
    sample(keys, scrollState.progress, 'pos', tp.current);
    sample(keys, scrollState.progress, 'look', tl.current);
    if (!cur.current) { cur.current = tp.current.clone(); look.current.copy(tl.current); }
    const D = THREE.MathUtils.damp, L = 5; // damping smooths jumps between scenes into a fly-through
    cur.current.set(D(cur.current.x, tp.current.x, L, dt), D(cur.current.y, tp.current.y, L, dt), D(cur.current.z, tp.current.z, L, dt));
    look.current.set(D(look.current.x, tl.current.x, L, dt), D(look.current.y, tl.current.y, L, dt), D(look.current.z, tl.current.z, L, dt));
    const { x, y } = scrollState.pointer;
    camera.position.set(cur.current.x + x * 0.6, cur.current.y + y * 0.35, cur.current.z);
    camera.lookAt(look.current);
  });
  return null;
}
