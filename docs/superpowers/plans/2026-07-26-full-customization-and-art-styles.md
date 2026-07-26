# Full Customization + Expanded Art Styles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the user control every visual detail of the wallpaper (font, cover size/radius, Spotify Code visibility/size, palette color count, subtitle text/visibility, background mode) and pick from 8 shared art styles across both orientations (portrait keeps its original look as a 9th style, "Clássico").

**Architecture:** `config.js` gets one `ORIENTATION_LAYOUTS` table (`portrait`/`landscape` → style name → layout numbers) replacing today's `CANVAS_CONFIG` + `LANDSCAPE_LAYOUTS`. `canvas-renderer.js` keeps its existing two render paths (`renderStandardWallpaper`, `renderCinematicWallpaper`) — new styles are config-driven variations of the standard path (a `BACKGROUND: 'mosaic'` flag, a `PERFORATION` flag, a `FRAME`/`VINYL` flag on `COVER`), not new duplicate methods. User overrides (font, cover scale, code scale, palette count, subtitle, background mode) are read from `this.settings` inside the existing draw methods, the same way `accentColor`/`bgColor` already override style defaults today.

**Tech Stack:** Vanilla JS (Vite 5), Canvas 2D API. No test runner is installed in this project — "run the test" steps below mean `npm run build` (catches syntax/import errors) plus a manual visual check in the running dev server, per the project's existing practice (see spec's "Manual test checklist").

## Global Constraints

- Every existing `id` attribute referenced by JS must be preserved except the ones this plan explicitly renames (`landscapeStyle`/`landscapeStyleGroup` → `wallpaperStyle`). Breaking an id silently breaks event wiring with no error.
- No new npm dependency — everything here is plain Canvas 2D drawing.
- Cover position stays fixed per style (no free-form XY dragging) — user-controlled cover size is a **scale multiplier** on the style's own `COVER.SIZE`, anchored at the style's `COVER.X/Y` (top-left).
- Palette color count must clamp to `data.palette.length` in the renderer itself, not just the UI slider's `max`.
- `pt-BR` labels for all new UI text, matching the rest of the app.

---

### Task 1: Restructure `config.js` into `ORIENTATION_LAYOUTS`

**Files:**
- Modify: `src/js/config.js`

**Interfaces:**
- Produces: `ORIENTATION_LAYOUTS` (`{ portrait: {...}, landscape: {...} }`, each a map of style-name → layout config), `STYLE_LABELS` (`{ [styleName]: 'Pretty Label' }`), `FONT_OPTIONS` (`[{ id, label, family }]`), `FONT_CONFIG` (now `{ DEFAULT_FAMILY, TITLE_SIZE, SUBTITLE_SIZE, DURATION_SIZE }`). `LANDSCAPE_SIZE` and `COLOR_CONFIG` unchanged.
- Consumes: nothing (leaf module).

- [ ] **Step 1: Replace the contents of `src/js/config.js`**

```js
export const SPOTIFY_CONFIG = {
    CLIENT_ID: import.meta.env.VITE_CLIENT_ID || '43f8be46cbcd48b5899f8e893274bd22',
    REDIRECT_URI: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
    SCOPES: import.meta.env.VITE_SCOPES || 'user-read-private',
    API_BASE_URL: 'https://api.spotify.com/v1',
    AUTH_URL: 'https://accounts.spotify.com/authorize',
    TOKEN_URL: 'https://accounts.spotify.com/api/token'
};

export const PORTRAIT_SIZE = { WIDTH: 1080, HEIGHT: 1920 };
export const LANDSCAPE_SIZE = { WIDTH: 1920, HEIGHT: 1080 };

const PALETTE_UNIT = { COLOR_WIDTH: 48, COLOR_HEIGHT: 18, COLOR_GAP: 7 };

export const ORIENTATION_LAYOUTS = {
    portrait: {
        classic: {
            PALETTE: { START_X: 120, START_Y: 120, ...PALETTE_UNIT, COLOR_WIDTH: 56, COLOR_HEIGHT: 20, COLOR_GAP: 8 },
            DURATION: { X: 960, Y: 130, ALIGN: 'right' },
            TITLE: { X: 120, Y: 200, ALIGN: 'left' },
            TEXT_MAX_WIDTH: 840,
            COVER: { SIZE: 840, BORDER_RADIUS: 8, X: 120, Y: 460 },
            SPOTIFY_CODE: { WIDTH: 800, HEIGHT: 190, X: 140, Y: 1364 }
        },
        column: {
            PALETTE: { START_X: 120, START_Y: 130, ...PALETTE_UNIT },
            DURATION: { X: 960, Y: 140, ALIGN: 'right' },
            TITLE: { X: 120, Y: 1120, ALIGN: 'left' },
            TEXT_MAX_WIDTH: 840,
            COVER: { SIZE: 760, BORDER_RADIUS: 8, X: 160, Y: 260 },
            SPOTIFY_CODE: { WIDTH: 760, HEIGHT: 180, X: 160, Y: 1700 }
        },
        poster: {
            BACKGROUND: 'radial',
            PALETTE: { START_X: 692, START_Y: 1120, ...PALETTE_UNIT },
            DURATION: { X: 960, Y: 130, ALIGN: 'right' },
            TITLE: { X: 540, Y: 1180, ALIGN: 'center' },
            TEXT_MAX_WIDTH: 900,
            COVER: { SIZE: 620, BORDER_RADIUS: 8, X: 230, Y: 330 },
            SPOTIFY_CODE: { WIDTH: 620, HEIGHT: 147, X: 230, Y: 1560 }
        },
        editorial: {
            PALETTE: { START_X: 120, START_Y: 1500, ...PALETTE_UNIT },
            DURATION: { X: 120, Y: 130, ALIGN: 'left' },
            TITLE: { X: 120, Y: 190, ALIGN: 'left', SIZE: 64, LINE_HEIGHT: 68 },
            TEXT_MAX_WIDTH: 840,
            COVER: { SIZE: 500, BORDER_RADIUS: 8, X: 500, Y: 900 },
            SPOTIFY_CODE: { WIDTH: 600, HEIGHT: 142, X: 120, Y: 1660 }
        },
        cinematic: {
            PALETTE: { START_X: 120, START_Y: 130, ...PALETTE_UNIT },
            DURATION: { X: 960, Y: 140, ALIGN: 'right' },
            TITLE: { X: 120, Y: 1520, ALIGN: 'left' },
            TEXT_MAX_WIDTH: 840,
            COVER: { SIZE: 160, BORDER_RADIUS: 8, X: 120, Y: 1300 },
            SPOTIFY_CODE: { WIDTH: 300, HEIGHT: 71, X: 660, Y: 1780 }
        },
        grid: {
            BACKGROUND: 'mosaic',
            MOSAIC: { TILE: 120 },
            PALETTE: { START_X: 120, START_Y: 130, ...PALETTE_UNIT },
            DURATION: { X: 960, Y: 140, ALIGN: 'right' },
            TITLE: { X: 120, Y: 1560, ALIGN: 'left' },
            TEXT_MAX_WIDTH: 840,
            COVER: { SIZE: 320, BORDER_RADIUS: 8, X: 120, Y: 1200 },
            SPOTIFY_CODE: { WIDTH: 500, HEIGHT: 119, X: 460, Y: 1780 }
        },
        ticket: {
            PERFORATION: { Y: 1300 },
            PALETTE: { START_X: 120, START_Y: 1360, ...PALETTE_UNIT },
            DURATION: { X: 960, Y: 1360, ALIGN: 'right' },
            TITLE: { X: 120, Y: 140, ALIGN: 'left' },
            TEXT_MAX_WIDTH: 840,
            COVER: { SIZE: 700, BORDER_RADIUS: 8, X: 190, Y: 340 },
            SPOTIFY_CODE: { WIDTH: 780, HEIGHT: 185, X: 150, Y: 1500 }
        },
        polaroid: {
            PALETTE: { START_X: 140, START_Y: 1660, ...PALETTE_UNIT },
            DURATION: { X: 940, Y: 150, ALIGN: 'right' },
            TITLE: { X: 140, Y: 1420, ALIGN: 'left' },
            TEXT_MAX_WIDTH: 800,
            COVER: { SIZE: 800, BORDER_RADIUS: 4, X: 140, Y: 260, FRAME: { BORDER: 32, CAPTION_HEIGHT: 120 } },
            SPOTIFY_CODE: { WIDTH: 600, HEIGHT: 142, X: 240, Y: 1740 }
        },
        vinyl: {
            PALETTE: { START_X: 340, START_Y: 130, ...PALETTE_UNIT },
            DURATION: { X: 960, Y: 140, ALIGN: 'right' },
            TITLE: { X: 540, Y: 1660, ALIGN: 'center' },
            TEXT_MAX_WIDTH: 900,
            COVER: { SIZE: 620, BORDER_RADIUS: 0, X: 230, Y: 760, VINYL: { RING_COUNT: 5, RING_GAP: 24 } },
            SPOTIFY_CODE: { WIDTH: 520, HEIGHT: 123, X: 280, Y: 1780 }
        }
    },

    landscape: {
        column: {
            PALETTE: { START_X: 960, START_Y: 160, ...PALETTE_UNIT, COLOR_WIDTH: 56, COLOR_HEIGHT: 20, COLOR_GAP: 8 },
            DURATION: { X: 1820, Y: 170, ALIGN: 'right' },
            TITLE: { X: 960, Y: 220, ALIGN: 'left' },
            TEXT_MAX_WIDTH: 860,
            COVER: { SIZE: 760, BORDER_RADIUS: 8, X: 100, Y: 160 },
            SPOTIFY_CODE: { WIDTH: 700, HEIGHT: 166, X: 960, Y: 814 }
        },
        poster: {
            BACKGROUND: 'radial',
            PALETTE: { START_X: 804, START_Y: 560, ...PALETTE_UNIT, COLOR_WIDTH: 56, COLOR_HEIGHT: 20, COLOR_GAP: 8 },
            DURATION: { X: 1820, Y: 90, ALIGN: 'right' },
            TITLE: { X: 960, Y: 620, ALIGN: 'center' },
            TEXT_MAX_WIDTH: 1200,
            COVER: { SIZE: 460, BORDER_RADIUS: 8, X: 730, Y: 70 },
            SPOTIFY_CODE: { WIDTH: 560, HEIGHT: 133, X: 680, Y: 840 }
        },
        editorial: {
            PALETTE: { START_X: 100, START_Y: 430, ...PALETTE_UNIT, COLOR_WIDTH: 56, COLOR_HEIGHT: 20, COLOR_GAP: 8 },
            DURATION: { X: 100, Y: 140, ALIGN: 'left' },
            TITLE: { X: 100, Y: 200, ALIGN: 'left', SIZE: 64, LINE_HEIGHT: 70 },
            TEXT_MAX_WIDTH: 940,
            COVER: { SIZE: 700, BORDER_RADIUS: 8, X: 1120, Y: 190 },
            SPOTIFY_CODE: { WIDTH: 620, HEIGHT: 147, X: 100, Y: 833 }
        },
        cinematic: {
            PALETTE: { START_X: 1350, START_Y: 90, ...PALETTE_UNIT, COLOR_WIDTH: 56, COLOR_HEIGHT: 20, COLOR_GAP: 8 },
            DURATION: { X: 1820, Y: 100, ALIGN: 'right' },
            TITLE: { X: 320, Y: 855, ALIGN: 'left' },
            TEXT_MAX_WIDTH: 1300,
            COVER: { SIZE: 180, BORDER_RADIUS: 8, X: 100, Y: 800 },
            SPOTIFY_CODE: { WIDTH: 260, HEIGHT: 62, X: 1560, Y: 918 }
        },
        grid: {
            BACKGROUND: 'mosaic',
            MOSAIC: { TILE: 160 },
            PALETTE: { START_X: 100, START_Y: 100, ...PALETTE_UNIT },
            DURATION: { X: 1820, Y: 110, ALIGN: 'right' },
            TITLE: { X: 100, Y: 860, ALIGN: 'left' },
            TEXT_MAX_WIDTH: 900,
            COVER: { SIZE: 360, BORDER_RADIUS: 8, X: 1460, Y: 660 },
            SPOTIFY_CODE: { WIDTH: 460, HEIGHT: 109, X: 100, Y: 940 }
        },
        ticket: {
            PERFORATION: { Y: 540 },
            PALETTE: { START_X: 100, START_Y: 600, ...PALETTE_UNIT },
            DURATION: { X: 1820, Y: 600, ALIGN: 'right' },
            TITLE: { X: 100, Y: 100, ALIGN: 'left' },
            TEXT_MAX_WIDTH: 900,
            COVER: { SIZE: 380, BORDER_RADIUS: 8, X: 1460, Y: 340 },
            SPOTIFY_CODE: { WIDTH: 900, HEIGHT: 214, X: 100, Y: 700 }
        },
        polaroid: {
            PALETTE: { START_X: 1360, START_Y: 780, ...PALETTE_UNIT },
            DURATION: { X: 1820, Y: 100, ALIGN: 'right' },
            TITLE: { X: 1360, Y: 560, ALIGN: 'left' },
            TEXT_MAX_WIDTH: 480,
            COVER: { SIZE: 560, BORDER_RADIUS: 4, X: 560, Y: 260, FRAME: { BORDER: 28, CAPTION_HEIGHT: 100 } },
            SPOTIFY_CODE: { WIDTH: 420, HEIGHT: 100, X: 1360, Y: 900 }
        },
        vinyl: {
            PALETTE: { START_X: 100, START_Y: 100, ...PALETTE_UNIT },
            DURATION: { X: 1820, Y: 110, ALIGN: 'right' },
            TITLE: { X: 960, Y: 940, ALIGN: 'center' },
            TEXT_MAX_WIDTH: 1100,
            COVER: { SIZE: 560, BORDER_RADIUS: 0, X: 680, Y: 140, VINYL: { RING_COUNT: 5, RING_GAP: 22 } },
            SPOTIFY_CODE: { WIDTH: 460, HEIGHT: 109, X: 730, Y: 700 }
        }
    }
};

export const STYLE_LABELS = {
    classic: 'Clássico',
    column: 'Coluna',
    poster: 'Poster',
    editorial: 'Editorial',
    cinematic: 'Cinemática',
    grid: 'Mosaico',
    ticket: 'Ticket',
    polaroid: 'Polaroid',
    vinyl: 'Vinil'
};

export const FONT_OPTIONS = [
    { id: 'grotesque', label: 'Grotesque', family: "'Bricolage Grotesque', system-ui, sans-serif" },
    { id: 'mono', label: 'Mono', family: "'JetBrains Mono', ui-monospace, monospace" },
    { id: 'serif', label: 'Serif', family: "Georgia, 'Times New Roman', serif" },
    { id: 'sans', label: 'Sans', family: "'Helvetica Neue', Arial, sans-serif" }
];

export const FONT_CONFIG = {
    DEFAULT_FAMILY: FONT_OPTIONS[0].family,
    TITLE_SIZE: 48,
    SUBTITLE_SIZE: 28,
    DURATION_SIZE: 24
};

export const COLOR_CONFIG = {
    BACKGROUND: '#000000',
    TEXT: '#ffffff',
    SPOTIFY_GREEN: '#1db954',
    SPOTIFY_GREEN_HOVER: '#1ed760'
};
```

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: build fails (canvas-renderer.js still imports the old `CANVAS_CONFIG`/`LANDSCAPE_LAYOUTS` names) — that's expected here, Task 2 fixes it. Just confirm the error is exactly about those two missing exports and nothing else (no typo elsewhere in this file).

- [ ] **Step 3: Commit**

```bash
git add src/js/config.js
git commit -m "feat: restructure layout config into ORIENTATION_LAYOUTS with 8 shared styles"
```

---

### Task 2: Update `canvas-renderer.js` — dispatch, overrides, new style mechanics

**Files:**
- Modify: `src/js/services/canvas-renderer.js`

**Interfaces:**
- Consumes: `ORIENTATION_LAYOUTS`, `PORTRAIT_SIZE`, `LANDSCAPE_SIZE`, `FONT_CONFIG` from `../config.js` (Task 1).
- Produces: `CanvasRenderer.renderWallpaper(data, settings)` unchanged signature; `settings` now additionally reads `wallpaperStyle`, `fontFamily`, `titleFontSize`, `coverScale`, `coverRadius`, `showSpotifyCode`, `spotifyCodeScale`, `paletteCount`, `subtitleOverride`, `showSubtitle`, `backgroundMode`.

- [ ] **Step 1: Update the import line**

```js
import { PORTRAIT_SIZE, LANDSCAPE_SIZE, ORIENTATION_LAYOUTS, FONT_CONFIG, COLOR_CONFIG } from '../config.js';
import { wrapText } from '../utils/format-utils.js';
```

- [ ] **Step 2: Replace `renderWallpaper` dispatch**

```js
async renderWallpaper(data, settings = null) {
    this.settings = settings || {};

    const orientation = this.settings.orientation === 'landscape' ? 'landscape' : 'portrait';
    const size = orientation === 'landscape' ? LANDSCAPE_SIZE : PORTRAIT_SIZE;
    this.canvas.width = size.WIDTH;
    this.canvas.height = size.HEIGHT;

    const styles = ORIENTATION_LAYOUTS[orientation];
    const fallbackStyle = orientation === 'portrait' ? 'classic' : 'column';
    const styleName = styles[this.settings.wallpaperStyle] ? this.settings.wallpaperStyle : fallbackStyle;
    const cfg = { ...styles[styleName], WIDTH: size.WIDTH, HEIGHT: size.HEIGHT };

    if (styleName === 'cinematic') {
        await this.renderCinematicWallpaper(data, cfg);
    } else {
        await this.renderStandardWallpaper(data, cfg);
    }
}
```

- [ ] **Step 3: Add the perforation call and subtitle override to `renderStandardWallpaper`**

Find the existing method and replace it with:

```js
async renderStandardWallpaper(data, cfg) {
    const { WIDTH, HEIGHT } = cfg;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const baseBg = this.settings.bgColor || COLOR_CONFIG.BACKGROUND;
    this.ctx.fillStyle = baseBg;
    this.ctx.fillRect(0, 0, WIDTH, HEIGHT);

    this.renderBackground(data, cfg);
    this.renderVignette(cfg);
    if (cfg.PERFORATION) this.renderPerforation(cfg);

    if (this.settings.showPalette !== false) {
        this.renderColorPalette(data.palette || [], cfg.PALETTE);
    }

    if (data.durationText && data.durationText !== '—' && data.durationText !== '0 MIN 00 S') {
        this.renderDuration(data.durationText, cfg.DURATION);
    }

    const titleOverride = (this.settings.titleOverride || '').trim();
    const titleBottomY = this.renderTitle(titleOverride || data.trackTitle || '', cfg.TITLE, cfg.TEXT_MAX_WIDTH);

    if (this.settings.showSubtitle !== false) {
        const subtitleText = (this.settings.subtitleOverride || '').trim() || data.subtitleText || '';
        this.renderSubtitle(subtitleText, { X: cfg.TITLE.X, Y: titleBottomY, ALIGN: cfg.TITLE.ALIGN }, cfg.TEXT_MAX_WIDTH);
    }

    await this.renderAlbumCover(data.albumCover, cfg.COVER);
    await this.renderSpotifyCode(data.spotifyCodeImageUrl, cfg.SPOTIFY_CODE);
}
```

Apply the same `showSubtitle`/`subtitleOverride` change to `renderCinematicWallpaper` (same three lines, same place it currently calls `this.renderSubtitle(...)` unconditionally).

- [ ] **Step 4: Add a font-building helper and use it in title/subtitle/duration**

Add this method anywhere in the class:

```js
buildFont(weight, size, familyOverride) {
    const family = familyOverride || this.settings.fontFamily || FONT_CONFIG.DEFAULT_FAMILY;
    return `${weight} ${size}px ${family}`;
}
```

Update `renderDuration`, `renderTitle`, `renderSubtitle` to use it instead of `FONT_CONFIG.DURATION`/`FONT_CONFIG.TITLE`/`FONT_CONFIG.SUBTITLE` (which no longer exist as font-string constants after Task 1):

```js
renderDuration(durationText, pos) {
    this.ctx.fillStyle = this.getTextColor();
    this.ctx.font = this.buildFont('bold', FONT_CONFIG.DURATION_SIZE);
    this.ctx.textAlign = pos.ALIGN || 'right';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(durationText, pos.X, pos.Y);
}

renderTitle(title, pos, maxWidth) {
    const lineHeight = pos.LINE_HEIGHT || 55;
    const size = this.settings.titleFontSize || pos.SIZE || FONT_CONFIG.TITLE_SIZE;

    this.ctx.fillStyle = this.getTextColor();
    this.ctx.font = this.buildFont('bold', size);
    this.ctx.textAlign = pos.ALIGN || 'left';
    this.ctx.textBaseline = 'top';

    const titleText = (title || '').toUpperCase();
    const titleLines = wrapText(this.ctx, titleText, maxWidth);

    titleLines.forEach((line, index) => {
        this.ctx.fillText(line, pos.X, pos.Y + (index * lineHeight));
    });

    return pos.Y + (titleLines.length * lineHeight) + 10;
}

renderSubtitle(subtitle, pos, maxWidth) {
    const lineHeight = pos.LINE_HEIGHT || 32;

    this.ctx.fillStyle = this.getTextColor();
    this.ctx.font = this.buildFont('normal', pos.SIZE || FONT_CONFIG.SUBTITLE_SIZE);
    this.ctx.textAlign = pos.ALIGN || 'left';
    this.ctx.textBaseline = 'top';

    const subtitleText = (subtitle || '').toUpperCase();
    const subtitleLines = wrapText(this.ctx, subtitleText, maxWidth);

    subtitleLines.forEach((line, index) => {
        this.ctx.fillText(line, pos.X, pos.Y + (index * lineHeight));
    });
}
```

(Default parameters that referenced `CANVAS_CONFIG.*` are dropped — every call site in this file always passes an explicit `cfg.*` argument, so the defaults were dead code.)

- [ ] **Step 5: Generalize `renderBackground` with the background-mode override + mosaic**

```js
renderBackground(data, cfg) {
    const mode = this.settings.backgroundMode || cfg.BACKGROUND || 'linear';

    if (mode === 'radial') { this.renderBackgroundRadial(data, cfg); return; }
    if (mode === 'solid') { this.renderBackgroundSolid(cfg); return; }
    if (mode === 'mosaic') { this.renderBackgroundMosaic(data, cfg); return; }

    const { WIDTH, HEIGHT } = cfg;
    const gradientStrength = typeof this.settings.gradientStrength === 'number' ? this.settings.gradientStrength : 1;
    const accent = this.settings.accentColor || data.dominant || COLOR_CONFIG.SPOTIFY_GREEN;

    let grad;
    const direction = this.settings.gradientDirection || 'vertical';
    if (direction === 'horizontal') {
        grad = this.ctx.createLinearGradient(0, 0, WIDTH, 0);
    } else {
        grad = this.ctx.createLinearGradient(0, 0, 0, HEIGHT);
    }

    const baseBg = this.settings.bgColor || COLOR_CONFIG.BACKGROUND;
    grad.addColorStop(0, baseBg);
    grad.addColorStop(1, mixColor(baseBg, accent, Math.max(0, Math.min(1, gradientStrength))));

    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

renderBackgroundSolid(cfg) {
    const { WIDTH, HEIGHT } = cfg;
    this.ctx.fillStyle = this.settings.bgColor || COLOR_CONFIG.BACKGROUND;
    this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

renderBackgroundMosaic(data, cfg) {
    const { WIDTH, HEIGHT, MOSAIC } = cfg;
    const baseBg = this.settings.bgColor || COLOR_CONFIG.BACKGROUND;
    this.ctx.fillStyle = baseBg;
    this.ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const colors = (data.palette && data.palette.length)
        ? data.palette
        : [this.settings.accentColor || data.dominant || COLOR_CONFIG.SPOTIFY_GREEN];
    const tile = (MOSAIC && MOSAIC.TILE) || 140;

    let i = 0;
    for (let y = 0; y < HEIGHT; y += tile) {
        for (let x = 0; x < WIDTH; x += tile) {
            this.ctx.globalAlpha = 0.45;
            this.ctx.fillStyle = colors[i % colors.length];
            this.ctx.fillRect(x, y, tile, tile);
            i++;
        }
    }
    this.ctx.globalAlpha = 1;
}
```

`renderBackgroundRadial` is unchanged (already generalized via `cfg`).

- [ ] **Step 6: Add `renderPerforation`**

```js
renderPerforation(cfg) {
    const { WIDTH, PERFORATION } = cfg;
    this.ctx.save();
    this.ctx.setLineDash([10, 10]);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(40, PERFORATION.Y);
    this.ctx.lineTo(WIDTH - 40, PERFORATION.Y);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    this.ctx.restore();
}
```

- [ ] **Step 7: Clamp palette count in `renderColorPalette`**

```js
renderColorPalette(palette, paletteCfg) {
    const { START_X, START_Y, COLOR_WIDTH, COLOR_HEIGHT, COLOR_GAP } = paletteCfg;
    const available = (palette || []).length;
    const requested = this.settings.paletteCount || 5;
    const count = Math.max(1, Math.min(requested, available || requested));

    (palette || []).slice(0, count).forEach((color, index) => {
        const x = START_X + (COLOR_WIDTH + COLOR_GAP) * index;
        const y = START_Y;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, COLOR_WIDTH, COLOR_HEIGHT);
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x + 0.5, y + 0.5, COLOR_WIDTH - 1, COLOR_HEIGHT - 1);
    });
}
```

- [ ] **Step 8: Rewrite `renderAlbumCover` + `renderSpotifyCode` with scale/visibility overrides, add framed/vinyl cover helpers**

```js
async renderAlbumCover(albumCoverUrl, coverCfg) {
    const scale = this.settings.coverScale || 1;
    const size = coverCfg.SIZE * scale;
    const radius = this.settings.coverRadius ?? coverCfg.BORDER_RADIUS;

    if (coverCfg.VINYL) {
        await this.drawVinylCover(albumCoverUrl, coverCfg.X, coverCfg.Y, size, coverCfg.VINYL);
        return;
    }
    if (coverCfg.FRAME) {
        await this.drawFramedCover(albumCoverUrl, coverCfg.X, coverCfg.Y, size, coverCfg.FRAME, radius);
        return;
    }
    await this.drawRoundedImage(albumCoverUrl, coverCfg.X, coverCfg.Y, size, size, radius);
}

async renderSpotifyCode(spotifyCodeUrl, codeCfg) {
    if (this.settings.showSpotifyCode === false) return;
    const scale = this.settings.spotifyCodeScale || 1;
    const width = codeCfg.WIDTH * scale;
    const height = codeCfg.HEIGHT * scale;

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'screen';
    await this.drawImage(spotifyCodeUrl, codeCfg.X, codeCfg.Y, width, height);
    this.ctx.restore();
}

async drawFramedCover(src, x, y, size, frameCfg, radius) {
    const border = frameCfg.BORDER || 24;
    const captionHeight = frameCfg.CAPTION_HEIGHT || 90;
    this.ctx.fillStyle = '#f5f2e8';
    this.ctx.fillRect(x - border, y - border, size + border * 2, size + border * 2 + captionHeight);
    await this.drawRoundedImage(src, x, y, size, size, radius);
}

async drawVinylCover(src, x, y, size, ringCfg) {
    const radius = size / 2;
    const cx = x + radius;
    const cy = y + radius;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    this.ctx.clip();
    await this.drawImageCover(src, x, y, size, size);
    this.ctx.restore();

    const ringCount = ringCfg.RING_COUNT || 4;
    const ringGap = ringCfg.RING_GAP || 26;
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    this.ctx.lineWidth = 1.5;
    for (let i = 1; i <= ringCount; i++) {
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, radius + i * ringGap, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    this.ctx.restore();

    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius * 0.12, 0, Math.PI * 2);
    this.ctx.fill();
}

async drawImageCover(src, x, y, w, h) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.referrerPolicy = 'no-referrer';

        img.onload = () => {
            const targetRatio = w / h;
            const srcRatio = img.width / img.height;
            let sx = 0, sy = 0, sw = img.width, sh = img.height;

            if (srcRatio > targetRatio) {
                sw = img.height * targetRatio;
                sx = (img.width - sw) / 2;
            } else {
                sh = img.width / targetRatio;
                sy = (img.height - sh) / 2;
            }

            this.ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
            resolve();
        };

        img.onerror = () => reject(new Error('Erro ao carregar capa'));
        img.src = src;
    });
}
```

- [ ] **Step 9: Verify**

Run: `npm run build`
Expected: build succeeds with no errors (this task's changes are self-contained — `ORIENTATION_LAYOUTS`/`PORTRAIT_SIZE` now exist per Task 1, and nothing else in the codebase references the old `CANVAS_CONFIG`/`LANDSCAPE_LAYOUTS` names yet except `app.js`/`index.html`, which Tasks 3-4 fix).

- [ ] **Step 10: Commit**

```bash
git add src/js/services/canvas-renderer.js
git commit -m "feat: config-driven style dispatch + full render overrides (font, cover scale/radius, code, palette count, subtitle, background mode)"
```

---

### Task 3: Expand the UI — universal style picker + new controls

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: nothing (static markup; `wallpaperStyle`'s `<option>`s are populated by JS in Task 4).
- Produces: new element ids consumed by Task 4's `app.js` changes: `wallpaperStyle`, `backgroundMode`, `fontFamily`, `titleFontSize`, `coverScale`, `coverRadius`, `showSpotifyCode`, `spotifyCodeScale`, `paletteCount`, `subtitleOverride`, `showSubtitle`.

- [ ] **Step 1: Replace the landscape-style block inside `#panelBasico`**

Find:

```html
                        <div class="input-group" id="landscapeStyleGroup" style="display: none;">
                            <label for="landscapeStyle">Estilo da paisagem</label>
                            <select id="landscapeStyle">
                                <option value="column" selected>Coluna</option>
                                <option value="poster">Poster</option>
                                <option value="editorial">Editorial</option>
                                <option value="cinematic">Cinemática</option>
                            </select>
                        </div>
```

Replace with:

```html
                        <div class="input-group">
                            <label for="wallpaperStyle">Estilo da arte</label>
                            <select id="wallpaperStyle"></select>
                        </div>
```

- [ ] **Step 2: Add new fields to `#panelEstilo`, right after the closing `</div>` of the `textColor` field and before the closing `</div></div>` of `.grid-2`/`section`**

```html
                            <div class="input-group">
                                <label for="backgroundMode">Fundo</label>
                                <select id="backgroundMode">
                                    <option value="" selected>Automático (do estilo)</option>
                                    <option value="solid">Sólido</option>
                                    <option value="linear">Gradiente linear</option>
                                    <option value="radial">Gradiente radial</option>
                                </select>
                            </div>
                            <div class="input-group">
                                <label for="fontFamily">Fonte</label>
                                <select id="fontFamily">
                                    <option value="grotesque" selected>Grotesque</option>
                                    <option value="mono">Mono</option>
                                    <option value="serif">Serif</option>
                                    <option value="sans">Sans</option>
                                </select>
                            </div>
                            <div class="input-group">
                                <label for="titleFontSize">Tamanho do título</label>
                                <input type="range" id="titleFontSize" min="24" max="96" step="2" value="48" />
                            </div>
```

- [ ] **Step 3: Add new fields to `#panelAvancado`, before the `<details class="how-it-works">` block**

```html
                        <div class="input-group">
                            <label for="coverScale">Tamanho da capa</label>
                            <input type="range" id="coverScale" min="0.5" max="1.5" step="0.05" value="1" />
                        </div>
                        <div class="input-group">
                            <label for="coverRadius">Raio da borda da capa</label>
                            <input type="range" id="coverRadius" min="0" max="60" step="1" value="8" />
                        </div>
                        <div class="input-group">
                            <label for="showSpotifyCode">Mostrar Spotify Code</label>
                            <select id="showSpotifyCode">
                                <option value="true" selected>Sim</option>
                                <option value="false">Não</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label for="spotifyCodeScale">Tamanho do Spotify Code</label>
                            <input type="range" id="spotifyCodeScale" min="0.5" max="1.5" step="0.05" value="1" />
                        </div>
                        <div class="input-group">
                            <label for="paletteCount">Qtd. de cores na paleta</label>
                            <input type="range" id="paletteCount" min="1" max="8" step="1" value="5" />
                        </div>
                        <div class="input-group">
                            <label for="subtitleOverride">Subtítulo</label>
                            <input type="text" id="subtitleOverride" maxlength="80" placeholder="Nome do artista" />
                        </div>
                        <div class="input-group">
                            <label for="showSubtitle">Mostrar subtítulo</label>
                            <select id="showSubtitle">
                                <option value="true" selected>Sim</option>
                                <option value="false">Não</option>
                            </select>
                        </div>
```

- [ ] **Step 4: Verify**

Run: `npm run build`
Expected: succeeds (this is static HTML — nothing references these ids yet, no runtime error possible from this file alone). Open the dev server and confirm the new fields render inside their tabs without breaking layout (visual only, functionality lands in Task 4).

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat(ui): universal style picker + font/cover/code/palette/subtitle/background controls"
```

---

### Task 4: Wire `app.js` — settings collection, defaults, style-option population, persistence

**Files:**
- Modify: `src/js/app.js`

**Interfaces:**
- Consumes: `ORIENTATION_LAYOUTS`, `STYLE_LABELS`, `FONT_OPTIONS` from `../config.js` (new imports); all element ids from Task 3.
- Produces: `getCustomizationSettings()` return shape now includes `wallpaperStyle`, `subtitleOverride`, `showSubtitle`, `backgroundMode`, `paletteCount`, `fontFamily` (a CSS font-family string, translated from the select's `id`), `titleFontSize`, `coverScale`, `coverRadius`, `showSpotifyCode`, `spotifyCodeScale` — this is what Task 2's `CanvasRenderer.renderWallpaper(data, settings)` reads.

- [ ] **Step 1: Update the import block**

```js
import { SpotifyAuth } from './services/spotify-auth.js';
import { SpotifyAPI } from './services/spotify-api.js';
import { CanvasRenderer } from './services/canvas-renderer.js';
import { parseSpotifyUrl, generateSpotifyCodeUrl } from './utils/spotify-utils.js';
import { msToText } from './utils/format-utils.js';
import { extractPalette } from './utils/color-utils.js';
import { ORIENTATION_LAYOUTS, STYLE_LABELS, FONT_OPTIONS } from './config.js';
import {
    showLoading,
    showError,
    hideError,
    updateMetadata,
    downloadWallpaper,
    copyPromptToClipboard
} from './utils/ui-utils.js';

const LAYOUT_PREFS_KEY = 'spotipaper:layoutPrefs';
const FONT_FAMILY_BY_ID = Object.fromEntries(FONT_OPTIONS.map((f) => [f.id, f.family]));
```

- [ ] **Step 2: Add `populateWallpaperStyleOptions` (module-level function, next to `loadLayoutPrefs`/`saveLayoutPrefs`)**

```js
function populateWallpaperStyleOptions(orientation) {
    const select = document.getElementById('wallpaperStyle');
    if (!select) return;

    const previous = select.value;
    const keys = Object.keys(ORIENTATION_LAYOUTS[orientation] || ORIENTATION_LAYOUTS.portrait);
    select.innerHTML = keys.map((key) => `<option value="${key}">${STYLE_LABELS[key] || key}</option>`).join('');
    select.value = keys.includes(previous) ? previous : keys[0];
}
```

- [ ] **Step 3: Replace `resetCustomizationToDefaults`**

```js
resetCustomizationToDefaults() {
    const defaults = {
        titleOverride: '',
        subtitleOverride: '',
        showSubtitle: 'true',
        bgColor: '#000000',
        accentColor: '#1db954',
        backgroundMode: '',
        gradientStrength: '1',
        gradientDirection: 'vertical',
        textColor: 'light',
        vignetteIntensity: '0.4',
        showPalette: 'true',
        paletteCount: '5',
        fontFamily: FONT_OPTIONS[0].id,
        titleFontSize: '48',
        coverScale: '1',
        coverRadius: '8',
        showSpotifyCode: 'true',
        spotifyCodeScale: '1'
    };

    Object.entries(defaults).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
    });
}
```

- [ ] **Step 4: Replace `getCustomizationSettings`**

```js
getCustomizationSettings() {
    return {
        orientation: document.getElementById('orientation')?.value || 'portrait',
        wallpaperStyle: document.getElementById('wallpaperStyle')?.value || 'classic',
        titleOverride: document.getElementById('titleOverride')?.value || undefined,
        subtitleOverride: document.getElementById('subtitleOverride')?.value || undefined,
        showSubtitle: (document.getElementById('showSubtitle')?.value || 'true') === 'true',
        bgColor: document.getElementById('bgColor')?.value || undefined,
        accentColor: document.getElementById('accentColor')?.value || undefined,
        backgroundMode: document.getElementById('backgroundMode')?.value || '',
        gradientStrength: parseFloat(document.getElementById('gradientStrength')?.value || '1'),
        gradientDirection: document.getElementById('gradientDirection')?.value || 'vertical',
        textColor: document.getElementById('textColor')?.value || 'light',
        vignetteIntensity: parseFloat(document.getElementById('vignetteIntensity')?.value || '0.4'),
        vignette: true,
        showPalette: (document.getElementById('showPalette')?.value || 'true') === 'true',
        paletteCount: parseInt(document.getElementById('paletteCount')?.value || '5', 10),
        fontFamily: FONT_FAMILY_BY_ID[document.getElementById('fontFamily')?.value] || undefined,
        titleFontSize: parseInt(document.getElementById('titleFontSize')?.value || '48', 10),
        coverScale: parseFloat(document.getElementById('coverScale')?.value || '1'),
        coverRadius: parseInt(document.getElementById('coverRadius')?.value || '8', 10),
        showSpotifyCode: (document.getElementById('showSpotifyCode')?.value || 'true') === 'true',
        spotifyCodeScale: parseFloat(document.getElementById('spotifyCodeScale')?.value || '1')
    };
}
```

- [ ] **Step 5: Replace `applySavedLayoutPrefs`**

```js
applySavedLayoutPrefs() {
    const prefs = loadLayoutPrefs();
    const orientationEl = document.getElementById('orientation');

    if (prefs.orientation && orientationEl) orientationEl.value = prefs.orientation;

    populateWallpaperStyleOptions(orientationEl?.value || 'portrait');

    const styleEl = document.getElementById('wallpaperStyle');
    if (prefs.style && styleEl && Array.from(styleEl.options).some((o) => o.value === prefs.style)) {
        styleEl.value = prefs.style;
    }
}
```

Delete `syncLandscapeStyleVisibility` entirely (no `landscapeStyleGroup` element exists anymore after Task 3) and remove its call at the end of `applySavedLayoutPrefs` / inside `generateWallpaper`'s `if (reset)` block.

- [ ] **Step 6: Update `setupEventListeners`**

Replace the `customIds` array:

```js
const customIds = [
    'wallpaperStyle', 'titleOverride', 'subtitleOverride', 'showSubtitle',
    'bgColor', 'accentColor', 'backgroundMode', 'gradientStrength', 'gradientDirection', 'textColor',
    'vignetteIntensity', 'showPalette', 'paletteCount',
    'fontFamily', 'titleFontSize', 'coverScale', 'coverRadius',
    'showSpotifyCode', 'spotifyCodeScale'
];
```

Replace the orientation-change listener (previously calling `syncLandscapeStyleVisibility`):

```js
const orientationEl = document.getElementById('orientation');
orientationEl.addEventListener('change', () => {
    populateWallpaperStyleOptions(orientationEl.value);
    this.rerenderWithCurrentSettings();
});
```

- [ ] **Step 7: Update `rerenderWithCurrentSettings` persistence call**

```js
async rerenderWithCurrentSettings() {
    if (!this.currentTrackData) return;
    const settings = this.getCustomizationSettings();
    saveLayoutPrefs({ orientation: settings.orientation, style: settings.wallpaperStyle });
    await this.renderer.renderWallpaper(this.currentTrackData, settings);
}
```

- [ ] **Step 8: Verify**

Run: `npm run build`
Expected: succeeds with no errors.

Then, with the dev server running (`npm run dev`):
1. Paste a track or album URL, click "Gerar Wallpaper".
2. Open the "Básico" tab — the "Estilo da arte" dropdown shows 9 options in portrait.
3. Switch orientation to "Paisagem" — the dropdown repopulates to 8 options, previous selection carries over if shared (everything except "Clássico").
4. Pick each of the 8 shared styles in both orientations (16 checks) — canvas re-renders each time with no console errors, no element drawn off-canvas.
5. In "Estilo", change Fundo/Fonte/Tamanho do título — canvas updates live.
6. In "Avançado", drag Tamanho da capa / Raio da borda / Tamanho do Spotify Code / Qtd. de cores — canvas updates live; toggle "Mostrar Spotify Code" and "Mostrar subtítulo" off — those elements disappear.
7. Set "Qtd. de cores na paleta" to 8 on a cover that only yields 2-3 dominant colors — no crash, no blank swatches drawn.
8. Reload the page — orientation and style choice persist from `localStorage`.

- [ ] **Step 9: Commit**

```bash
git add src/js/app.js
git commit -m "feat: wire full customization settings + universal style selection to the renderer"
```

---

### Task 5: Final polish pass

**Files:**
- Modify: whichever of `src/js/config.js` / `src/js/services/canvas-renderer.js` need pixel-offset fixes found during manual review.

- [ ] **Step 1: Run the full manual checklist from Task 4 Step 8 one more time end-to-end**, this time actually reading each of the 16 style/orientation renders for visual breakage (text overlapping the cover, Spotify Code drawn off-canvas, vinyl rings clipped, polaroid caption overlapping title, ticket perforation crossing the cover).

- [ ] **Step 2: Fix any coordinate issues found directly in `ORIENTATION_LAYOUTS`** (adjust `X`/`Y`/`SIZE` numbers — this is expected; the numbers in Task 1 are a real starting point, not a guarantee of pixel-perfect fit for every album-cover aspect ratio).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "fix: visual polish pass on new art style layouts"
```
