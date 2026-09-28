import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { SCENES } from '../config/siteConfig';
import { scrollState } from '../state/scrollState';

export function getActiveIndex(p = scrollState.progress) {
  for (let i = SCENES.length - 1; i >= 0; i--) if (p >= SCENES[i].start) return i;
  return 0;
}
// React hook: index of the scene the scroll is currently in (updates only on change).
export function useActiveScene() {
  const [i, setI] = useState(0);
  useEffect(() => {
    let last = 0;
    const f = () => { const n = getActiveIndex(); if (n !== last) { last = n; setI(n); } };
    gsap.ticker.add(f);
    return () => gsap.ticker.remove(f);
  }, []);
  return i;
}
