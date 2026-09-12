English | [Português](README.pt.md)

# SpotiPaper

[![CI](https://github.com/obrenoalvim/spoti-paper/actions/workflows/ci.yml/badge.svg)](https://github.com/obrenoalvim/spoti-paper/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Creates 1080×1920 wallpapers from your favorite Spotify tracks and albums, using their cover art colors. The app extracts the cover's color palette, builds a minimalist layout, and lets you download it as a PNG. Works even without login (via oEmbed), with richer data when authenticated.

**Live demo:** [spotipaper.vercel.app](https://spotipaper.vercel.app)

## Features

- OAuth2 with PKCE (client-side) for Spotify Web API access
- oEmbed fallback when not authenticated (no total duration, basic metadata only)
- Color extraction with ColorThief (dominant color + 5-color palette)
- Canvas rendering (1080×1920) with gradient, palette, duration, title, artist, rounded cover art and Spotify Code
- Responsive interface with PNG download

## Requirements

- Node.js 18+ (Vite 5)
- A Spotify Developer account (for authentication and full metadata)

## Running it

1) Install dependencies
```bash
npm install
```

2) Configure environment variables (project root). Create a `.env` file with the keys below. Adjust `REDIRECT_URI` for your environment (dev and production) and add the same values to the Redirect URIs tab of your app in the Spotify Developer Dashboard.
```env
VITE_CLIENT_ID=YOUR_SPOTIFY_CLIENT_ID
VITE_REDIRECT_URI=http://localhost:5173
VITE_SCOPES=user-read-private
```

3) Dev server
```bash
npm run dev
```

4) Production build and preview
```bash
npm run build
npm run preview
```

Remember to update `VITE_REDIRECT_URI` and the Redirect URI on the Spotify dashboard after deploying to production.

## How to use

- Optional: click "Connect with Spotify" to authenticate and get full metadata (e.g. duration)
- Paste a Spotify track or album URL, for example:
  - `https://open.spotify.com/track/...`
  - `https://open.spotify.com/album/...`
- Click "Generate Wallpaper" and wait for palette extraction and rendering
- Click "Download PNG" to save the result

Without login, the app uses Spotify's oEmbed to get basic metadata (no duration). With login, it uses the Web API for full data (tracks and albums, including summed track duration for an album).

## Project structure

- Root
  - `index.html` — Vite entry point
  - `package.json` — scripts and dependencies
  - `vercel.json` — deploy config (optional)
  - `.env` — local variables (not committed)
  - `dist/` — build artifacts
- `src/`
  - `main.js` — app bootstrap
  - `styles/main.css` — UI styles
  - `js/config.js` — constants (`PORTRAIT_SIZE`, `LANDSCAPE_SIZE`, `ORIENTATION_LAYOUTS`, fonts, colors) and `SPOTIFY_CONFIG`
  - `js/app.js` — main class `SpotifyWallpaperApp`
  - `js/services/`
    - `spotify-auth.js` — OAuth2 PKCE flow (login, token)
    - `spotify-api.js` — Spotify Web API and oEmbed calls
    - `canvas-renderer.js` — Canvas drawing (wallpaper layout)
  - `js/utils/`
    - `color-utils.js` — palette extraction via ColorThief
    - `format-utils.js` — formatting (time, text wrapping)
    - `spotify-utils.js` — URL and Spotify Code parsing
    - `crypto-utils.js` — PKCE utilities (SHA-256, challenge)
    - `ui-utils.js` — loading, errors, metadata, download

Note: `dist/` holds Vite's packaged build; don't edit its files by hand.

## Technical notes

- **Auth**: PKCE (no client secret) with code_verifier/code_challenge. Token kept in sessionStorage; expiry ends the session and requires a new login.
- **oEmbed fallback**: no token required; returns cover thumbnail and title/author.
- **Canvas and ColorThief**: cover images load with `crossOrigin='anonymous'` and `referrerPolicy='no-referrer'`. Color extraction and PNG export depend on correct CORS on cover images.
- **Spotify Codes**: rendered via the public `scannables.scdn.co` URL; check Spotify Codes' terms of use before using this in production.

## Limitations and troubleshooting

- CORS on covers: if the image doesn't allow CORS, color extraction and/or canvas download may fail. Try another track/album or serve/proxy images with proper headers.
- Redirect URI: must exactly match what's configured on the Spotify Dashboard (protocol/port included). In dev, use `http://localhost:5173`.
- Expired token: on a 401, the app logs out and asks for a new login.
- oEmbed: provides limited metadata; duration may show as "—".

## Quick customization

- Dimensions/layout: `src/js/config.js` (`PORTRAIT_SIZE`, `LANDSCAPE_SIZE`, `ORIENTATION_LAYOUTS`)
- Colors and fonts: `src/js/config.js` (`COLOR_CONFIG`, `FONT_CONFIG`)
- Drawing logic: `src/js/services/canvas-renderer.js`

## Main dependencies

- Vite 5 (bundler and dev server)
- ColorThief (palette extraction)
- Spotify Web API and oEmbed

## Contributing

- Open issues/PRs describing the change clearly
- Keep the code style and the services/utils layering
- Update this README when build/run behavior changes

## Notices

- Respect Spotify's terms and policies (Web API and Spotify Codes)
- Don't commit `.env` or credentials
- Test in modern browsers (Canvas, Web Crypto, ES Modules)

## License

MIT
