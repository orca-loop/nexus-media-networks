import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Custom red "magnet ring" cursor. Desktop/fine pointer only.
export default function Cursor() {
  const ring = useRef(), dot = useRef();
  useEffect(() => {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    document.documentElement.classList.add('has-cursor');
    gsap.set([ring.current, dot.current], { xPercent: -50, yPercent: -50, opacity: 0 });
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.35, ease: 'power3' });
    const ry = gsap.quickTo(ring.current, 'y', { duration: 0.35, ease: 'power3' });
    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.08 });
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.08 });
    const move = (e) => { gsap.set([ring.current, dot.current], { opacity: 1 }); rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY); };
    const over = (e) => {
      const hit = e.target.closest && e.target.closest('a,button,input,select,textarea,[data-cursor]');
      gsap.to(ring.current, { scale: hit ? 1.9 : 1, duration: 0.25 });
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', over);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerover', over); document.documentElement.classList.remove('has-cursor'); };
  }, []);
  return (<><div ref={ring} className="cursor-ring" /><div ref={dot} className="cursor-dot" /></>);
}
