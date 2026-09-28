import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { scrollState } from '../state/scrollState';
import { SCENES } from '../config/siteConfig';
import { clamp } from '../utils/sceneMath';

export const lenisRef = { current: null };
const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

// Smooth-scrolls the page so the camera lands at the start of a scene.
export function scrollToScene(id, opts = {}) {
  const s = SCENES.find((x) => x.id === id);
  if (!s) return;
  const y = s.start * maxScroll() + (s.index === 0 ? 0 : 2);
  if (lenisRef.current) lenisRef.current.scrollTo(y, { duration: 2.4, ...opts });
  else window.scrollTo(0, y);
}

export default function ScrollDriver() {
  useEffect(() => {
    const st = scrollState;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.stop(); // Loader calls start() once the world is ready
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    let lastY = window.scrollY;
    const update = () => {
      const y = window.scrollY;
      const p = clamp(y / maxScroll());
      st.progress = p;
      st.velocity += (clamp(Math.abs(y - lastY) / 50) - st.velocity) * 0.12;
      lastY = y;
      for (const s of SCENES) st.scenes[s.id] = clamp((p - s.start) / (s.end - s.start));
    };
    gsap.ticker.add(update);

    const onMove = (e) => { st.pointer.x = (e.clientX / innerWidth) * 2 - 1; st.pointer.y = -((e.clientY / innerHeight) * 2 - 1); };
    const onTilt = (e) => { if (e.gamma == null) return; st.pointer.x = clamp(e.gamma / 30, -1, 1); st.pointer.y = clamp(-((e.beta || 45) - 45) / 30, -1, 1); };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('deviceorientation', onTilt);

    // ?scene=<id> jumps straight to a scene (for testing)
    const q = new URLSearchParams(location.search).get('scene');
    const target = SCENES.find((s) => s.id === q);
    if (target) window.scrollTo(0, target.start * maxScroll() + 2);

    return () => {
      gsap.ticker.remove(tick); gsap.ticker.remove(update);
      window.removeEventListener('pointermove', onMove); window.removeEventListener('deviceorientation', onTilt);
      lenis.destroy(); lenisRef.current = null;
    };
  }, []);

  return <div className="scroll-spacer" aria-hidden="true" style={{ height: '1100vh' }} />;
}
