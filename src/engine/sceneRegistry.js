import { SCENES } from '../config/siteConfig';

// Auto-collects every scene file. Other parts only replace files in src/scenes/ (same names, same exports).
const mods = import.meta.glob('../scenes/*.jsx', { eager: true });
const FILE = { hero:'Hero', street:'Street', dooh:'Dooh', transit:'Transit', society:'Society', tower:'Tower', map:'IndiaMap', process:'Process', contact:'Contact' };

export const registry = SCENES.map((s) => {
  const m = mods[`../scenes/${FILE[s.id]}.jsx`];
  if (!m) throw new Error(`Missing scene file src/scenes/${FILE[s.id]}.jsx`);
  return { ...s, Scene: m.default, Overlay: m.Overlay || (() => null), cameraKeys: m.cameraKeys || [], fog: m.fog };
});
