
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
