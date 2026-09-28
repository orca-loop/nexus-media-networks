import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { scrollState } from '../state/scrollState';
import { SCENES } from '../config/siteConfig';
import { getActiveIndex } from '../engine/activeScene';

// Only visible with ?debug in the URL. Also: ?scene=<id> jumps to a scene.
export default function DebugHud() {
  const el = useRef();
  const on = new URLSearchParams(location.search).has('debug');
  useEffect(() => {
    if (!on) return;
    let frames = 0, last = performance.now(), fps = 0;
    const f = () => {
      frames++; const n = performance.now();
      if (n - last > 500) { fps = Math.round((frames * 1000) / (n - last)); frames = 0; last = n; }
      if (el.current) el.current.textContent = `FPS ${fps} | p ${scrollState.progress.toFixed(3)} | scene ${SCENES[getActiveIndex()].id} | quality ${scrollState.quality}`;
    };
    gsap.ticker.add(f);
    return () => gsap.ticker.remove(f);
  }, [on]);
  return on ? <div ref={el} className="debug-hud" /> : null;
}
