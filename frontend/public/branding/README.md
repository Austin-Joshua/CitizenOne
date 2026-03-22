# Brand assets

Place your horizontal **CitizenOne** logo PNG here as exactly:

`citizen-one-logo.png`  

(Not `citizen-one-logo.png.png`—Windows can hide the real extension.)

The app loads `/branding/citizen-one-logo.png` in the UI. If the file is missing, an inline SVG fallback is used.

- **`Favicon.png`** — browser tab (`rel="icon"`) and **`apple-touch-icon`** only (`index.html`).
- **`citizen-one-logo.png`** — full lockup everywhere in the UI (TopBar, sidebar, landing, auth, etc.) via `CitizenOneLogo` / `AppLogo`.

For a crisp tab icon, use a square **`Favicon.png`** (e.g. 180×180 or 512×512). Wide images still work but look small in the tab.

**Use a transparent background** so light/dark theme toggles show the real page chrome behind the mark.

- **Dark / black plate:** `npm run brand:transparent-logo` (or `node scripts/transparent-logo-bg.mjs <file.png> [out.png]`).
- **White / light plate:** `npm run brand:transparent-logo:white` (adds `--white`; tune `WHITE_CUTOFF` in `scripts/transparent-logo-bg.mjs` if light cyan edges look chipped).

You can also import in one step:  
`node scripts/transparent-logo-bg.mjs path/to/download.png public/branding/citizen-one-logo.png --white`

Recommended: **transparent** PNG, ~3:2 or ~3:1 width:height, at least **640×180** px for crisp headers.
