# Brand assets

## `Favicon.png` (in `public/`, not only this folder)

Single raster used for:

- **Browser tab** and **apple-touch-icon** — `index.html` → `/Favicon.png`
- **In-app brand row** — `CitizenOneLogo` / `AppLogo` load the same file; the word **CitizenOne** is rendered as **HTML text** (`BrandWordmark`: bold Outfit, `#1a3050` / white + `#00aeef` / cyan; `onDark` variant for dark panels).

Replace **`public/Favicon.png`** when you update the mark. Paths are case-sensitive on Linux (`Favicon.png`).

## Optional: strip a solid plate from `Favicon.png`

If your favicon export has a flat black or white background, from `frontend/`:

- **Black plate:** `npm run brand:transparent-favicon`
- **White plate:** `npm run brand:transparent-favicon:white`

Or: `node scripts/transparent-logo-bg.mjs public/Favicon.png --white`

For a sharp tab icon, a **square** PNG (e.g. 180×180) works best.
