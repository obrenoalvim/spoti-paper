# Full customization + expanded art styles — design

Date: 2026-07-26

## Goal

Two things, built together:

1. Give the user control over every visual detail of the wallpaper (font, cover
   size/radius, Spotify Code visibility/size, palette color count, subtitle
   text/visibility, background mode) instead of the current fixed subset
   (bg/accent/gradient/vignette/text color/title only).
2. Expand the art-style catalog from 4 (landscape only) to 8, mirrored across
   both orientations — portrait goes from 1 implicit style to 9 (its original
   look, kept as "Clássico", plus the 8 shared styles), landscape goes from 4
   to 8.

## Non-goals

- No free-form drag positioning for the cover (size + border radius only —
  position stays fixed per style template; drag-and-drop is a much larger
  feature on its own).
- No playlist / batch generation (explored and dropped in an earlier session).
- No new persisted prefs beyond what's already saved (`orientation`,
  `landscapeStyle`) — new settings reset to defaults on reload like the rest
  of the customization panel already does.

## New art styles

Existing 4 (already landscape-only, get a portrait variant too):
`column`, `poster`, `editorial`, `cinematic`.

Portrait's current one-and-only layout becomes a named style: `classic`.

4 new styles, built for both orientations:

- `grid` — palette color blocks tiled as background texture, small cover in a
  corner.
- `ticket` — concert-ticket / boarding-pass look: dashed perforation border,
  monospace metadata rows, Spotify Code rendered large like a barcode stub.
- `polaroid` — cover framed with a thick off-white/tinted border like an
  instant photo, title sits in the "caption" strip below the frame.
- `vinyl` — cover masked into a circle with groove rings drawn around it,
  centered composition.

Portrait style set (9): `classic, column, poster, editorial, cinematic, grid,
ticket, polaroid, vinyl`.
Landscape style set (8): `column, poster, editorial, cinematic, grid, ticket,
polaroid, vinyl`.

## Architecture

`config.js`: replace `CANVAS_CONFIG` (portrait-only) + `LANDSCAPE_LAYOUTS`
with one table:

```js
ORIENTATION_LAYOUTS = {
  portrait: { classic: {...}, column: {...}, poster: {...}, ... },
  landscape: { column: {...}, poster: {...}, ... }
}
```

Each style entry keeps the same shape used today (`PALETTE`, `DURATION`,
`TITLE`, `COVER`, `SPOTIFY_CODE`, `TEXT_MAX_WIDTH`, optional `BACKGROUND`),
plus whatever new style needs (e.g. `grid` needs a tile size, `vinyl` needs a
ring radius/count, `ticket` needs perforation spacing).

`canvas-renderer.js`: `renderWallpaper` currently branches
`orientation !== 'landscape'` then `styleName === 'cinematic'`. Replace with a
single style-name dispatch table (`classic`/`column`/`poster` share the
existing standard renderer; `cinematic` keeps its own; `grid`, `ticket`,
`polaroid`, `vinyl` get one render method each). Cover size/radius, font
choice/size, Spotify Code visibility/size, palette count, subtitle
text/visibility, and background mode all become **settings overrides** read
the same way `accentColor`/`bgColor` already override `data.dominant` — they
sit on top of the chosen style's template numbers, they don't replace the
template system.

## New settings (UI: which tab)

- **Estilo tab**: background mode select (Sólido / Linear / Radial) —
  replaces the current implicit "layout decides" radial-only-for-poster rule;
  font family select (4 curated: Bricolage Grotesque, JetBrains Mono, a serif,
  a second sans); title font-size slider.
- **Avançado tab**: cover size slider, cover border-radius slider, Spotify
  Code visibility toggle + size slider, palette color count slider (1-8,
  clamped to however many ColorThief actually returned), subtitle text input
  (mirrors `titleOverride` pattern) + visibility toggle.
- **Básico tab**: style picker (portrait shows its 9, landscape shows its 8) —
  replaces today's landscape-only `landscapeStyle` select; visible regardless
  of orientation now.

## Edge cases

- Palette count slider can't exceed `data.palette.length` (ColorThief may
  return fewer than requested) — clamp in the renderer, not just the UI.
- Switching orientation keeps the style selection if the name exists in both
  sets (all 8 shared ones do); falls back to `classic`/`column` default when
  it doesn't (only affects `classic`, which is portrait-only).
- Subtitle hidden + title hidden simultaneously is allowed (cover-only
  wallpaper) — no minimum-content guard needed, canvas just renders emptier.

## Manual test checklist (no automated test suite in this project)

- Each of the 8 shared styles renders correctly in both orientations (16
  combinations, visual spot-check).
- Every new slider/toggle visibly changes the render.
- Palette count slider at max with a cover that only yields 2 dominant colors
  doesn't crash or draw blank swatches.
- Existing prefs persistence (orientation + landscape style) still round-trips
  through `localStorage`.
