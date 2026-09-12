# TODO IMPROVEMENTS

> Last updated: 2026-09-12

## Pending Changes

### Add automatic retry/backoff for Spotify 429 responses
- **Category:** Bug
- **What:** `apiCall` in `src/js/services/spotify-api.js` now surfaces a clearer message on HTTP 429, but it still fails the whole generation instead of honoring Spotify's `Retry-After` header and retrying once. A short backoff-and-retry would make the app resilient to brief rate-limit spikes (e.g. long albums that paginate track pages).
- **Where:** `src/js/services/spotify-api.js` (`apiCall`, `getAlbumData` pagination loop)
- **Why:** Spotify enforces per-app rate limits; a busy period currently surfaces as a hard error to the user with no automatic recovery.
- **Risk:** Low-medium — needs care to avoid infinite retry loops and to keep the UI responsive.
- **Effort:** Low

### No `.env.example` committed
- **Category:** UI-UX (DX/onboarding)
- **What:** README instructs contributors to "Create a `.env` file with the keys below", but there's no `.env.example` to copy from. Local tooling blocked writing one directly (env-file deny rule), so it needs to be added by hand:
  ```env
  VITE_CLIENT_ID=YOUR_SPOTIFY_CLIENT_ID
  VITE_REDIRECT_URI=http://localhost:5173
  VITE_SCOPES=user-read-private
  ```
- **Where:** repo root (new file `.env.example`)
- **Why:** Faster, less error-prone onboarding for new contributors.
- **Risk:** None.
- **Effort:** Low

### No test runner / tests for shipped logic
- **Category:** Test
- **What:** `package.json` has no test script or test framework. Pure-logic modules like `src/js/utils/spotify-utils.js` (`parseSpotifyUrl`, `toSpotifyUri`, `generateSpotifyCodeUrl`), `src/js/utils/format-utils.js` (`msToText`, `wrapText`) and `src/js/utils/crypto-utils.js` are good candidates for unit tests once a runner is chosen, but adding a new dependency was out of scope for this pass.
- **Where:** `src/js/utils/*.js`
- **Why:** These are shipped, user-facing code paths (URL parsing feeds directly into whether "Generate Wallpaper" works) with zero automated coverage today.
- **Risk:** None to queue; adding a framework is a dependency decision for the maintainer.
- **Effort:** Medium

### Repo-wide Prettier formatting drift
- **Category:** Refactor
- **What:** `npx prettier --check .` currently flags 20 files (nearly the whole tree, including `index.html`, all of `src/`, and the READMEs) as not matching `.prettierrc`. This looks like formatting has drifted since a past `git blame`/`format:write` was last run, rather than being one file's fault.
- **Where:** repo-wide
- **Why:** Left unformatted, the drift compounds with every new PR since the CI has no `format:check` gate.
- **Risk:** Low functionally, but a full-repo reformat is a large diff that should land in its own commit for a clean review, so it wasn't applied here.
- **Effort:** Low (run `npm run format`), but recommend also adding `npm run format:check` to `ci.yml` afterward to prevent regression.

### Landscape orientation has no "classic" wallpaper style
- **Category:** UI-UX
- **What:** `ORIENTATION_LAYOUTS.portrait` defines a `classic` style, but `ORIENTATION_LAYOUTS.landscape` does not — so the style dropdown silently offers one fewer option in landscape mode. Unclear if intentional (landscape's `column` may be the designed equivalent) or an oversight from when landscape layouts were added.
- **Where:** `src/js/config.js` (`ORIENTATION_LAYOUTS.landscape`)
- **Why:** Confirm with design intent before adding — could be a deliberate curation, not a bug.
- **Risk:** None to queue.
- **Effort:** Low if a landscape "classic" layout is wanted.

## Applied
- Fixed `README.md`/`README.pt.md` "Quick customization" and "Project structure" sections referencing a non-existent `CANVAS_CONFIG` export — updated to the real exports (`PORTRAIT_SIZE`, `LANDSCAPE_SIZE`, `ORIENTATION_LAYOUTS`).
- Removed a leftover `console.log('data', data)` debug statement from `SpotifyAPI.getTrackData`.
- Added missing HTTP-status handling (401 token-expiry logout, non-OK abort) to the `getAlbumData` pagination loop in `spotify-api.js`, which previously fetched follow-up track pages with no error handling at all and would throw an opaque `TypeError` on failure.
- Added a distinct, user-facing error message for HTTP 429 (rate limit) responses in `apiCall`, instead of the generic "Erro da API: 429".
- Removed dead code: `copyPromptToClipboard` in `src/js/utils/ui-utils.js` was exported and imported in `app.js` but never called, and referenced DOM elements (`promptTextarea`, `copyPromptBtn`) that don't exist in `index.html`.
