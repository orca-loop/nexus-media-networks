import { scrollState } from '../state/scrollState';

// Decides quality tier and whether to serve the lite (non-WebGL) site.
export function detectQuality() {
  const ua = navigator.userAgent || '';
  const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || window.innerWidth < 768 || matchMedia('(pointer:coarse)').matches;
  const weak = (navigator.deviceMemory || 8) <= 3 || (navigator.hardwareConcurrency || 8) <= 3;
  scrollState.isMobile = mobile;
  scrollState.quality = mobile || weak ? 'low' : 'high';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let webgl = false;
  try { const c = document.createElement('canvas'); webgl = !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) {}
  const forceLite = new URLSearchParams(location.search).has('lite');
  return { lite: reduce || !webgl || forceLite };
}
