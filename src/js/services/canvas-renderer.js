
import { PORTRAIT_SIZE, LANDSCAPE_SIZE, ORIENTATION_LAYOUTS, FONT_CONFIG, COLOR_CONFIG } from '../config.js';
import { wrapText } from '../utils/format-utils.js';

function mixColor(c1, c2, t) {
    const toRgb = (hex) => hex.replace('#','').match(/.{2}/g).map(n => parseInt(n,16));
    const [r1,g1,b1] = toRgb(c1);
    const [r2,g2,b2] = toRgb(c2);
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    return `rgb(${r}, ${g}, ${b})`;
}

export class CanvasRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.settings = {};
    }

    async reset() {
        this.settings = {};
        try {
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        } catch (_) {  }
    }

    getTextColor() {
        return (!this.settings || this.settings.textColor === 'light') ? '#ffffff' : '#000000';
    }

    buildFont(weight, size, familyOverride) {
        const family = familyOverride || this.settings.fontFamily || FONT_CONFIG.DEFAULT_FAMILY;
        return `${weight} ${size}px ${family}`;
    }

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

    async renderCinematicWallpaper(data, cfg) {
        const { WIDTH, HEIGHT } = cfg;

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        this.ctx.clearRect(0, 0, WIDTH, HEIGHT);

        this.ctx.fillStyle = this.settings.bgColor || COLOR_CONFIG.BACKGROUND;
        this.ctx.fillRect(0, 0, WIDTH, HEIGHT);

        await this.drawCoverBackdrop(data.albumCover, WIDTH, HEIGHT);
        this.renderCinematicScrim(cfg);
        this.renderVignette(cfg);

        if (this.settings.showPalette !== false) {
            this.renderColorPalette(data.palette || [], cfg.PALETTE);
        }

        if (data.durationText && data.durationText !== '—' && data.durationText !== '0 MIN 00 S') {
            this.renderDuration(data.durationText, cfg.DURATION);
        }

        await this.renderAlbumCover(data.albumCover, cfg.COVER);

        const titleOverride = (this.settings.titleOverride || '').trim();
        const titleBottomY = this.renderTitle(titleOverride || data.trackTitle || '', cfg.TITLE, cfg.TEXT_MAX_WIDTH);

        if (this.settings.showSubtitle !== false) {
            const subtitleText = (this.settings.subtitleOverride || '').trim() || data.subtitleText || '';
            this.renderSubtitle(subtitleText, { X: cfg.TITLE.X, Y: titleBottomY, ALIGN: cfg.TITLE.ALIGN }, cfg.TEXT_MAX_WIDTH);
        }

        await this.renderSpotifyCode(data.spotifyCodeImageUrl, cfg.SPOTIFY_CODE);
    }

    renderCinematicScrim(cfg) {
        const { WIDTH, HEIGHT } = cfg;
        const grad = this.ctx.createLinearGradient(0, HEIGHT, 0, 0);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.88)');
        grad.addColorStop(0.42, 'rgba(0, 0, 0, 0.35)');
        grad.addColorStop(0.68, 'rgba(0, 0, 0, 0.12)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }

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

    renderBackgroundRadial(data, cfg) {
        const { WIDTH, HEIGHT } = cfg;
        const gradientStrength = typeof this.settings.gradientStrength === 'number' ? this.settings.gradientStrength : 1;
        const accent = this.settings.accentColor || data.dominant || COLOR_CONFIG.SPOTIFY_GREEN;
        const baseBg = this.settings.bgColor || COLOR_CONFIG.BACKGROUND;

        const grad = this.ctx.createRadialGradient(WIDTH / 2, HEIGHT * 0.35, 0, WIDTH / 2, HEIGHT * 0.35, WIDTH * 0.65);
        grad.addColorStop(0, mixColor(baseBg, accent, Math.max(0, Math.min(1, gradientStrength))));
        grad.addColorStop(1, baseBg);

        this.ctx.fillStyle = grad;
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

    renderVignette(cfg) {
        if (this.settings && this.settings.vignette === false) return;
        const intensity = typeof this.settings.vignetteIntensity === 'number' ? this.settings.vignetteIntensity : 0.4;
        const { WIDTH, HEIGHT } = cfg;

        const vignetteGradient = this.ctx.createRadialGradient(
            WIDTH/2, HEIGHT/2, 0,
            WIDTH/2, HEIGHT/2, WIDTH * 0.8
        );
        vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignetteGradient.addColorStop(1, `rgba(0, 0, 0, ${Math.max(0, Math.min(1, intensity))})`);
        this.ctx.fillStyle = vignetteGradient;
        this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }

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

    async drawRoundedImage(src, x, y, width, height, radius) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.referrerPolicy = 'no-referrer';

            img.onload = () => {
                this.ctx.beginPath();
                this.ctx.moveTo(x + radius, y);
                this.ctx.lineTo(x + width - radius, y);
                this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
                this.ctx.lineTo(x + width, y + height - radius);
                this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                this.ctx.lineTo(x + radius, y + height);
                this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
                this.ctx.lineTo(x, y + radius);
                this.ctx.quadraticCurveTo(x, y, x + radius, y);
                this.ctx.closePath();

                this.ctx.save();
                this.ctx.clip();
                this.ctx.drawImage(img, x, y, width, height);
                this.ctx.restore();

                resolve();
            };

            img.onerror = () => reject(new Error('Erro ao carregar capa'));
            img.src = src;
        });
    }

    async drawImage(src, x, y, width, height) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.referrerPolicy = 'no-referrer';
            img.crossOrigin = 'anonymous';

            img.onload = () => {
                this.ctx.drawImage(img, x, y, width, height);
                resolve();
            };

            img.onerror = () => {
                console.warn('Não foi possível carregar Spotify Code');
                resolve();
            };

            img.src = src;
        });
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

    async drawCoverBackdrop(src, targetW, targetH) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.referrerPolicy = 'no-referrer';

            img.onload = () => {
                const targetRatio = targetW / targetH;
                const srcRatio = img.width / img.height;
                let sx = 0, sy = 0, sw = img.width, sh = img.height;

                if (srcRatio > targetRatio) {
                    sw = img.height * targetRatio;
                    sx = (img.width - sw) / 2;
                } else {
                    sh = img.width / targetRatio;
                    sy = (img.height - sh) / 2;
                }

                this.ctx.save();
                this.ctx.filter = 'blur(6px) saturate(0.9) brightness(0.75)';
                this.ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
                this.ctx.restore();

                resolve();
            };

            img.onerror = () => reject(new Error('Erro ao carregar capa'));
            img.src = src;
        });
    }
}
