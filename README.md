# DNMN 3D Website (Display Nexus Media Networks)

One continuous 3D world that plays as you scroll. The camera travels through 9 scenes (hero, street, DOOH screens, transit, society, tower, India map, process, contact). The cursor tilts the camera and pulls dots like a magnet. No login, no backend.

Tagline: **Right Placement. True Engagement.** | Lucky@displaynexusmedia.com | 8103590283

---

## 1. START HERE (for every AI agent and developer)

1. Read **`docs/CONTRACT.md`** (the rules every part must follow).
2. Run **`npm run progress`** to see which parts are done and what is next.
3. Open **`progress/PART-N.md`** for the part you were given. It lists your files and checklist.
4. Build only your part's files. Do not edit shared files.
5. When finished, **update your `progress/PART-N.md`** (set `Status: DONE`, date, tick boxes, add a log line, note known issues) and run `npm run progress`.

Status values: `NOT STARTED`, `IN PROGRESS`, `DONE`, `NEEDS FIX`.

> Never edit `PROGRESS.md` by hand. It is generated from the `progress/` files, so several agents can work at once without overwriting each other.

## 2. Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in /dist
npm run progress   # show what is done and what is next
```

Testing URLs:
- `/?debug` shows FPS, scroll progress, active scene and quality tier
- `/?scene=street` jumps to a scene (ids: hero, street, dooh, transit, society, tower, map, process, contact)
- `/?debug&scene=map` combine both
- `/?lite` forces the lite (non-3D) site

## 3. The 5 parts

| Part | Owns | Scenes |
|---|---|---|
| 1 | Engine, loader, nav, cursor, camera, transitions, hero | hero |
| 2 | The city | street, dooh, transit |
| 3 | Ground activations | society, tower |
| 4 | Coverage and process | map, process |
| 5 | Finale and safety net | contact, lite site, SEO |

Part 1 is done, so Parts 2 to 5 can be built **in parallel** by different agents. Each replaces stub files in `src/scenes/` (and `src/lite`, `src/components` for Part 5).

### Combining work from different agents
Copy each agent's files into the same paths in this project. Do not copy `package.json`, `PROGRESS.md` or anything Part 1 owns. Copy each agent's `progress/PART-N.md` too. Then:

```bash
npm install && npm run build && npm run progress
```

Once all 5 parts are DONE, run one **final polish pass** with a single agent: match lighting, materials and scale across scenes, tune the camera timing, and test on a real phone.

## 4. How it works

- `ScrollDriver` reads the page scroll into `scrollState.progress` (0..1) and a local 0..1 for each scene (ranges in `src/config/siteConfig.js`). The page is a 1100vh spacer, the 3D canvas is fixed behind it.
- `WorldCanvas` holds ONE canvas. Each scene sits at `[0, 0, -index * 100]` and is mounted only when it is the active scene or its neighbour.
- `CameraRig` merges every scene's `cameraKeys` into one path and moves the camera along it with smoothing. Between scenes the camera flies across and `TransitionWipe` (halftone dots to squares) covers it.
- `Overlay` components are plain HTML text layered above the canvas (good for SEO and accessibility).
- `sceneRegistry` auto-loads every file in `src/scenes/`, so adding a scene needs no wiring.
- Quality: `detectQuality` sets `scrollState.quality` to `low` on phones and weak devices, and a runtime `PerformanceMonitor` drops it to `low` if the frame rate falls. Reduced-motion users and devices without WebGL get `LiteSite`.

## 5. Folder map

```
src/
  App.jsx                 assembles everything (Part 1)
  index.css               global styles (Part 1)
  config/siteConfig.js    colors, contact, scenes, city lists (SHARED)
  state/scrollState.js    live scroll and pointer values (SHARED)
  utils/sceneMath.js      clamp, lerp, smoothstep, fadeWindow (SHARED)
  engine/                 scroll, canvas, camera, wipe, quality (Part 1)
  ui/                     Loader, Cursor, Nav, DebugHud (Part 1)
  scenes/                 one file per scene (Hero is real, others are stubs until built)
  lite/LiteSite.jsx       non-3D fallback (Part 5)
  components/SeoHead.jsx  meta tags and JSON-LD (Part 5)
progress/PART-1..5.md     status of each part (agents update these)
docs/CONTRACT.md          rules for all parts
scripts/progress.mjs      builds PROGRESS.md
```

## 6. Editing content

- Contact details, colors, city lists, scene ranges: `src/config/siteConfig.js`
- Form endpoint: set `CONTACT.formEndpoint` to your Formspree URL (create a free form at formspree.io)
- Real campaign photos later: load them with `useTexture` from drei inside a scene and swap them onto the placeholder ad panels. Keep files small (WebP, under 200 KB each).

## 7. Deploy

Static site. On Vercel or Netlify: build command `npm run build`, output directory `dist`. Set your real domain in `public/sitemap.xml` and `SeoHead` (Part 5).

## 8. Troubleshooting

- **Blank screen:** open the browser console. A scene file is probably missing an export (`default`, `cameraKeys` or `Overlay`).
- **Lags on phone:** check `?debug` for FPS. Lower particle counts and instance counts in the `low` quality branch of the slow scene.
- **Hero text looks like a different font:** Google Fonts are loading slowly. Refresh once.
- **Scene text never appears:** the overlay is driven by `fadeWindow(scrollState.scenes[id])`, confirm the id matches the scene id exactly.
