# Contract for every part (read before writing code)

Five agents build one site. Files get copied into one folder, so follow this EXACTLY.

## Rules
- Stack only: react, react-dom, vite, three, @react-three/fiber, @react-three/drei, gsap, lenis, zustand. Plain JavaScript (.jsx). Do NOT add packages.
- No external models, images or audio. Build from primitives, drei helpers and canvas textures.
- Only edit the files your part owns (listed in `progress/PART-N.md`). Never edit shared files: `src/state/scrollState.js`, `src/utils/sceneMath.js`, `src/config/siteConfig.js`, `src/engine/*`, `src/ui/*`, `src/App.jsx`, `src/index.css`, `package.json`.
- Need a CSS rule? Use inline styles or a style object inside your own file (never touch index.css). Shared classes you may use: `.ov` (overlay root), `.btn`, `.sr-only`.

## Style
- Colors: peach #F8DEC5, red #E01E26, black #111111, white, plus tints #F2C9A6, #B8151B, #2A2A2A.
- Flat low-poly look (`meshStandardMaterial flatShading`). No gradients, no realism.
- Fonts: headings `Syne` (weight 800), labels `Space Mono` (already loaded).
- Placeholder ads: red/black/peach panel that says "YOUR BRAND HERE" with a halftone dot pattern.

## Scene file (src/scenes/<Name>.jsx)
1. `export default function Scene()`: R3F content in LOCAL coordinates around [0,0,0] (keep inside x -40..40, y -5..60, z 20..-70). No Canvas, camera, global lights or fog. Max 2 local lights.
2. `export const cameraKeys = [{t:0,pos:[x,y,z],look:[x,y,z]}, ...]` LOCAL coordinates, 3+ keys, t from 0 to 1. Street eye height is about 1.7.
3. `export function Overlay()`: DOM for the scene. Root is `position:fixed; inset:0; pointer-events:none` (class `ov`). Children that need clicks get `pointer-events:auto`. Drive opacity every frame with `gsap.ticker.add` inside `useEffect` (remove on cleanup) using `fadeWindow(scrollState.scenes[id])`; set `visibility:hidden` near 0. Real HTML text, short and punchy.
4. Optional `export const fog = {near:20, far:90}`.
5. Read scroll with `scrollState.scenes[id]` (local 0..1), `scrollState.pointer` (-1..1), `scrollState.velocity`, `scrollState.quality`. Never write to scrollState.
6. `quality === 'low'` means about 25% of the particles/instances and simpler geometry.
7. Use instancing for repeated objects. Mid-range Indian phones are the target.
8. Scenes are mounted only near the active one, so no manual disposal, no localStorage, no timers that outlive the scene.

## Scene ids, files and order
hero (Hero.jsx) - street (Street.jsx) - dooh (Dooh.jsx) - transit (Transit.jsx) - society (Society.jsx) - tower (Tower.jsx) - map (IndiaMap.jsx) - process (Process.jsx) - contact (Contact.jsx)
World position of a scene = [0, 0, -index * 100]. The camera flies between scenes automatically.

## Testing your scene
`npm run dev` then open `http://localhost:5173/?debug&scene=street` (use your scene id). `?lite` forces the lite site.

## When you finish (MANDATORY)
1. `npm run build` must pass.
2. Open `progress/PART-N.md` (your part): set `Status: DONE` (or `NEEDS FIX` if something is broken), set `Updated:` to today's date, tick every finished checkbox `[x]`, append a log line, fill in Known issues and Notes for the next agent.
3. Remove the `// STUB` comment from files you replaced.
4. Run `npm run progress` and confirm your part shows correctly.
