
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

function loadLayoutPrefs() {
    try {
        return JSON.parse(localStorage.getItem(LAYOUT_PREFS_KEY)) || {};
    } catch (_) {
        return {};
    }
}

function saveLayoutPrefs(prefs) {
    try {
        localStorage.setItem(LAYOUT_PREFS_KEY, JSON.stringify(prefs));
    } catch (_) {  }
}

function populateWallpaperStyleOptions(orientation) {
    const select = document.getElementById('wallpaperStyle');
    if (!select) return;

    const previous = select.value;
    const keys = Object.keys(ORIENTATION_LAYOUTS[orientation] || ORIENTATION_LAYOUTS.portrait);
    select.innerHTML = keys.map((key) => `<option value="${key}">${STYLE_LABELS[key] || key}</option>`).join('');
    select.value = keys.includes(previous) ? previous : keys[0];
}

export class SpotifyWallpaperApp {
    constructor() {
        this.auth = new SpotifyAuth();
        this.api = new SpotifyAPI(this.auth);
        this.renderer = new CanvasRenderer('canvas');
        this.currentTrackData = null;
        
        this.init();
    }

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

        init() {
                this.auth.handleAuthCallback();

                this.applySavedLayoutPrefs();

                this.setupEventListeners();

                this.simulateInitialRender();
    }

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

        setupEventListeners() {
                document.getElementById('authBtn').addEventListener('click', () => {
            this.auth.authenticate();
        });

                document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateWallpaper(true);
        });

                document.getElementById('downloadBtn').addEventListener('click', () => {
            downloadWallpaper(this.currentTrackData);
        });

                const urlInput = document.getElementById('spotifyUrl');
        urlInput.addEventListener('input', () => {
            const value = urlInput.value.trim();
            const valid = !!parseSpotifyUrl(value);
            urlInput.classList.toggle('is-valid', valid);
            urlInput.classList.toggle('is-invalid', value.length > 0 && !valid);            urlInput.setAttribute('aria-invalid', String(!valid && value.length > 0));
        });

                urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !document.getElementById('generateBtn').disabled) {
                this.generateWallpaper(true);
            }
        });
                const customIds = [
            'wallpaperStyle', 'titleOverride', 'subtitleOverride', 'showSubtitle',
            'bgColor', 'accentColor', 'backgroundMode', 'gradientStrength', 'gradientDirection', 'textColor',
            'vignetteIntensity', 'showPalette', 'paletteCount',
            'fontFamily', 'titleFontSize', 'coverScale', 'coverRadius',
            'showSpotifyCode', 'spotifyCodeScale'
        ];
        customIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => this.rerenderWithCurrentSettings());
                el.addEventListener('change', () => this.rerenderWithCurrentSettings());
            }
        });

                const orientationEl = document.getElementById('orientation');
        orientationEl.addEventListener('change', () => {
            populateWallpaperStyleOptions(orientationEl.value);
            this.rerenderWithCurrentSettings();
        });

    }

        async rerenderWithCurrentSettings() {
        if (!this.currentTrackData) return;
        const settings = this.getCustomizationSettings();
        saveLayoutPrefs({ orientation: settings.orientation, style: settings.wallpaperStyle });
        await this.renderer.renderWallpaper(this.currentTrackData, settings);
    }
        async generateWallpaper(reset = false) {
        const url = document.getElementById('spotifyUrl').value.trim();
        
        if (!url) {
            showError('Por favor, insira uma URL do Spotify');
            return;
        }

        const parsed = parseSpotifyUrl(url);
        if (!parsed) {
            showError('URL do Spotify inválida');
            return;
        }

        showLoading(true);
        hideError();

        try {
            if (reset) {
                                this.resetCustomizationToDefaults();
                                await this.renderer.reset();
            }

            let trackData;

            if (this.auth.isAuthenticated()) {
                if (parsed.type === 'track') {
                    trackData = await this.api.getTrackData(parsed.id);
                } else if (parsed.type === 'album') {
                    trackData = await this.api.getAlbumData(parsed.id);
                }
            } else {
                const oembedData = await this.api.getOEmbedData(url);
                trackData = {
                    type: parsed.type,
                    id: parsed.id,
                    trackTitle: oembedData.title || 'Título Desconhecido',
                    subtitleText: (oembedData.author_name || 'Artista Desconhecido').replace(/^by\s+/i, ''),
                    durationMs: 0,
                    albumCover: oembedData.thumbnail_url,
                    spotifyUrl: url
                };
            }

            if (!trackData.albumCover) {
                throw new Error('Capa do álbum não encontrada');
            }

                        const colorData = await extractPalette(trackData.albumCover);

                        this.currentTrackData = {
                ...trackData,
                ...colorData,
                durationText: trackData.durationMs ? msToText(trackData.durationMs) : '—',
                spotifyCodeImageUrl: generateSpotifyCodeUrl(trackData.spotifyUrl)
            };

                        if (reset && this.currentTrackData?.dominant) {
                const accentEl = document.getElementById('accentColor');
                if (accentEl) accentEl.value = this.currentTrackData.dominant;
            }

                        if (reset) {
                const titleEl = document.getElementById('titleOverride');
                if (titleEl) titleEl.value = this.currentTrackData?.trackTitle || '';
            }

                        await this.renderer.renderWallpaper(this.currentTrackData, this.getCustomizationSettings());
            
                        updateMetadata(this.currentTrackData);
            
                        document.getElementById('downloadBtn').disabled = false;

        } catch (error) {
            showError('Erro ao gerar wallpaper: ' + error.message);
        } finally {
            showLoading(false);
        }
    }

        async simulateInitialRender() {
        try {
            const exampleUrl = 'https://open.spotify.com/album/3JfSxDfmwS5OeHPwLSkrfr?si=5ppfaL38QRCkd7ZrHbT8fg';
            const input = document.getElementById('spotifyUrl');
            input.value = exampleUrl;

                        const oembedData = await this.api.getOEmbedData(exampleUrl);
            const parsed = parseSpotifyUrl(exampleUrl);

            const demoData = {
                type: 'album',
                id: parsed?.id || 'unknown',
                trackTitle: oembedData.title || 'Album',
                subtitleText: (oembedData.author_name || 'Spotify').replace(/^by\s+/i, ''),
                durationMs: 0,
                albumCover: oembedData.thumbnail_url,
                spotifyUrl: exampleUrl
            };


            const colorData = await extractPalette(demoData.albumCover);

            this.currentTrackData = {
                ...demoData,
                ...colorData,
                durationText: demoData.durationMs ? msToText(demoData.durationMs) : '—',
                spotifyCodeImageUrl: generateSpotifyCodeUrl(demoData.spotifyUrl)
            };

            const accentEl = document.getElementById('accentColor');
            if (accentEl && this.currentTrackData?.dominant) accentEl.value = this.currentTrackData.dominant;

            const titleEl = document.getElementById('titleOverride');
            if (titleEl) titleEl.value = this.currentTrackData?.trackTitle || '';

            await this.renderer.renderWallpaper(this.currentTrackData, this.getCustomizationSettings());
            updateMetadata(this.currentTrackData);
            document.getElementById('downloadBtn').disabled = false;
        } catch (e) {
            console.warn('Simulação inicial falhou:', e);
        }
    }
}