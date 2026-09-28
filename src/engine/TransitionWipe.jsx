import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useActiveScene } from './activeScene';
import { COLORS } from '../config/siteConfig';
import { clamp } from '../utils/sceneMath';

// Halftone dots -> squares wipe fired whenever the active scene changes.
export default function TransitionWipe() {
  const ref = useRef();
  const active = useActiveScene();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const c = ref.current, ctx = c.getContext('2d');
    c.width = innerWidth; c.height = innerHeight;
    const cell = innerWidth < 700 ? 28 : 40;
    const cols = Math.ceil(c.width / cell) + 1, rows = Math.ceil(c.height / cell) + 1;
    const cx = c.width / 2, cy = c.height / 2, maxD = Math.hypot(cx, cy);
    const o = { v: 0 };
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const x = i * cell, y = j * cell;
        const k = clamp(o.v * 1.7 - (Math.hypot(x - cx, y - cy) / maxD) * 0.7);
        if (k <= 0) continue;
        const r = cell * 0.72 * k, round = r * (1 - clamp((k - 0.5) * 2));
        ctx.fillStyle = (i + j) % 5 === 0 ? COLORS.black : COLORS.red;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x - r, y - r, r * 2, r * 2, round); else ctx.rect(x - r, y - r, r * 2, r * 2);
        ctx.fill();
      }
    };
    const tl = gsap.timeline({ onUpdate: draw, onComplete: () => ctx.clearRect(0, 0, c.width, c.height) });
    tl.to(o, { v: 1, duration: 0.35, ease: 'power2.in' }).to(o, { v: 0, duration: 0.5, ease: 'power2.out' });
    return () => { tl.kill(); ctx.clearRect(0, 0, c.width, c.height); };
  }, [active]);

  return <canvas ref={ref} className="wipe" />;
}
