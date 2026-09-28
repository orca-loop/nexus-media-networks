# Final polish pass (do this once, after Parts 2-5 are copied in)

The site is functionally complete: all 9 scenes exist and `npm run build` passes. It has NOT been visually tested in a browser yet (no GUI browser was available in the environment that built it), so before you call it done:

1. `npm install && npm run dev`, open the site and scroll all the way through once.
2. Check each scene individually with `/?debug&scene=<id>` for: hero, street, dooh, transit, society, tower, map, process, contact.
3. Look for: objects clipping through the ground or each other, text overlays that don't fade in/out cleanly, materials that look too dark or too bright, camera moves that feel too fast/slow or clip through geometry.
4. Test on a real phone on mobile data, not just a resized desktop window. Check `/?debug` FPS stays reasonable.
5. Test `/?lite` (the fallback) and confirm the ContactForm works there too.
6. Set your real Formspree endpoint in `src/config/siteConfig.js` (`CONTACT.formEndpoint`) and submit a real test message.
7. Fix anything visually off directly in the relevant scene file, then re-run `npm run build`.
8. Update `public/sitemap.xml` and `SeoHead.jsx` with your real domain once you have one.
