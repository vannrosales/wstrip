import { StripTemplate, StripCompositionOptions } from './types';
import { FILTERS, STICKERS } from './templates';

/**
 * Canonical font families that match @import Google Fonts with dependable system fallbacks.
 */
export const STRIP_FONT_FAMILIES = {
  serif: "'Playfair Display', Georgia, 'Times New Roman', serif",
  mono: "'Space Mono', 'DM Mono', Menlo, Consolas, monospace",
  sans: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  script: "'Caveat', cursive, 'Playfair Display', Georgia, serif",
} as const;

type TypefaceKey = keyof typeof STRIP_FONT_FAMILIES;

/**
 * Loads an image from a data URL or blob URL.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image: ${e}`));
    img.src = src;
  });
}

/**
 * Helper to draw a rounded rectangle on Canvas 2D.
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Draws letter-spaced text centered horizontally on centerX.
 * Returns the total drawn width.
 */
function drawTrackedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  tracking: number
): number {
  if (!text) return 0;
  if (tracking <= 0) {
    ctx.textAlign = 'center';
    ctx.fillText(text, centerX, centerY);
    return ctx.measureText(text).width;
  }
  const chars = Array.from(text);
  const widths = chars.map((c) => ctx.measureText(c).width);
  const totalWidth = widths.reduce((a, b) => a + b, 0) + tracking * (chars.length - 1);
  let currentX = centerX - totalWidth / 2;
  const prevAlign = ctx.textAlign;
  ctx.textAlign = 'left';
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], currentX, centerY);
    currentX += widths[i] + tracking;
  }
  ctx.textAlign = prevAlign;
  return totalWidth;
}

/**
 * Pure function: renders photostrip photos onto canvas and exports as Blob.
 */
export async function composeStrip(
  photos: string[],
  template: StripTemplate,
  options: StripCompositionOptions = {}
): Promise<Blob> {
  // Wait for webfonts to be fully ready before drawing on canvas
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Gracefully continue if font loading is non-blocking
    }
  }

  const scale = 2; // 2x for retina sharpness
  const canvasWidth = template.size.width * scale;
  const canvasHeight = template.size.height * scale;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is not supported');
  }

  // High quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Draw Background
  if (template.background.type === 'gradient' && template.background.secondary) {
    const grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    grad.addColorStop(0, template.background.value);
    grad.addColorStop(1, template.background.secondary);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = template.background.value;
  }
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 2. Draw subtle border around canvas if configured
  if (template.borderWidth && template.borderColor) {
    ctx.strokeStyle = template.borderColor;
    ctx.lineWidth = template.borderWidth * scale;
    ctx.strokeRect(
      (template.borderWidth * scale) / 2,
      (template.borderWidth * scale) / 2,
      canvasWidth - template.borderWidth * scale,
      canvasHeight - template.borderWidth * scale
    );
  }

  // Resolve active typeface
  const tfKey: TypefaceKey =
    template.typeface && template.typeface in STRIP_FONT_FAMILIES
      ? (template.typeface as TypefaceKey)
      : 'sans';
  const fontFace = STRIP_FONT_FAMILIES[tfKey];
  const monoFace = STRIP_FONT_FAMILIES.mono;

  // 3. Draw Header if present
  if (template.header && template.header.text) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const headerColor = template.header.color || '#888888';
    const headerSize = Math.max(11, template.header.fontSize || 13) * scale;
    const centerX = canvasWidth / 2;

    // Center vertically in the top margin before slot 0
    const firstSlotY = template.slots[0]?.y ?? 80;
    const headerCenterY = (firstSlotY * scale) / 2;

    let fontSpec = `600 ${headerSize}px ${fontFace}`;
    if (tfKey === 'mono') fontSpec = `700 ${headerSize}px ${monoFace}`;
    else if (tfKey === 'sans') fontSpec = `800 ${headerSize}px ${fontFace}`;
    else if (tfKey === 'script') fontSpec = `700 ${headerSize * 1.3}px ${fontFace}`;

    ctx.font = fontSpec;
    ctx.fillStyle = headerColor;

    const headerText = template.header.text.toUpperCase();
    const tracking = headerSize * 0.22;
    const drawnWidth = drawTrackedText(ctx, headerText, centerX, headerCenterY, tracking);

    // Subtle side accents
    const sideGap = 16 * scale;
    const sideLen = 30 * scale;
    if (centerX - drawnWidth / 2 - sideGap - sideLen > 25 * scale) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = headerColor;
      ctx.fillRect(
        centerX - drawnWidth / 2 - sideGap - sideLen,
        headerCenterY - 0.5 * scale,
        sideLen,
        1 * scale
      );
      ctx.fillRect(
        centerX + drawnWidth / 2 + sideGap,
        headerCenterY - 0.5 * scale,
        sideLen,
        1 * scale
      );
      ctx.restore();
    }

    ctx.restore();
  }

  // 4. Resolve Active Filter
  let activeCssFilter = template.filter || 'none';
  if (options.filterId && options.filterId !== 'original') {
    const found = FILTERS.find((f) => f.id === options.filterId);
    if (found) {
      activeCssFilter = found.cssFilter;
    }
  }

  // 5. Draw Photos in Slots
  const loadedImages = await Promise.all(
    photos.slice(0, template.slots.length).map((src) => loadImage(src))
  );

  for (let i = 0; i < loadedImages.length; i++) {
    const slot = template.slots[i];
    const img = loadedImages[i];
    if (!slot || !img) continue;

    const sx = slot.x * scale;
    const sy = slot.y * scale;
    const sw = slot.w * scale;
    const sh = slot.h * scale;
    const radius = (slot.borderRadius || 0) * scale;

    ctx.save();

    // Clip to rounded rectangle slot
    if (radius > 0) {
      roundRect(ctx, sx, sy, sw, sh, radius);
      ctx.clip();
    } else {
      ctx.beginPath();
      ctx.rect(sx, sy, sw, sh);
      ctx.clip();
    }

    // Apply Filter
    if (activeCssFilter && activeCssFilter !== 'none') {
      try {
        ctx.filter = activeCssFilter;
      } catch {
        // Fallback for older browsers
      }
    }

    // Mirroring if specified or needed
    if (options.mirrored) {
      ctx.translate(sx + sw, sy);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(sx, sy);
    }

    // Object-fit: cover calculation
    const imgAspect = img.width / img.height;
    const slotAspect = sw / sh;
    let renderW: number;
    let renderH: number;
    let offsetX: number;
    let offsetY: number;

    if (imgAspect > slotAspect) {
      // Image is wider than slot: crop sides
      renderH = sh;
      renderW = sh * imgAspect;
      offsetX = (sw - renderW) / 2;
      offsetY = 0;
    } else {
      // Image is taller than slot: crop top/bottom
      renderW = sw;
      renderH = sw / imgAspect;
      offsetX = 0;
      offsetY = (sh - renderH) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);

    ctx.restore();

    // Draw slot stroke/inner border if template has borderColor
    if (template.borderColor) {
      ctx.save();
      ctx.strokeStyle = template.borderColor;
      ctx.lineWidth = 1.5 * scale;
      if (radius > 0) {
        roundRect(ctx, sx, sy, sw, sh, radius);
        ctx.stroke();
      } else {
        ctx.strokeRect(sx, sy, sw, sh);
      }
      ctx.restore();
    }
  }

  // 6. Draw Footer Text & Date
  if (template.footer) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const footerColor = template.footer.color || '#ffffff';
    const rawCaption = options.customCaption?.trim() || template.footer.text;
    const centerX = canvasWidth / 2;

    // Optical centering in the remaining bottom margin
    const lastSlot = template.slots[template.slots.length - 1];
    const bottomSpaceTop = lastSlot ? (lastSlot.y + lastSlot.h) * scale : canvasHeight - 160 * scale;
    const bottomSpaceHeight = canvasHeight - bottomSpaceTop;
    const footerCenterY = bottomSpaceTop + bottomSpaceHeight * 0.42;

    // Caption typography styling
    let baseFontSize = 26 * scale;
    let fontStyle = '';
    let fontWeight = '700';

    if (tfKey === 'serif') {
      baseFontSize = 30 * scale;
      fontStyle = 'italic ';
      fontWeight = '600';
    } else if (tfKey === 'script') {
      baseFontSize = 34 * scale;
      fontWeight = '700';
    } else if (tfKey === 'mono') {
      baseFontSize = 22 * scale;
      fontWeight = '700';
    } else if (tfKey === 'sans') {
      baseFontSize = 24 * scale;
      fontWeight = '800';
    }

    // Auto-scale font down if user enters a long caption
    const maxCaptionWidth = canvasWidth - 90 * scale;
    let actualSize = baseFontSize;

    while (actualSize > 14 * scale) {
      ctx.font = `${fontStyle}${fontWeight} ${actualSize}px ${fontFace}`;
      if (ctx.measureText(rawCaption).width <= maxCaptionWidth) {
        break;
      }
      actualSize -= 1 * scale;
    }

    // Draw Caption
    ctx.fillStyle = footerColor;
    ctx.font = `${fontStyle}${fontWeight} ${actualSize}px ${fontFace}`;
    ctx.fillText(rawCaption, centerX, footerCenterY);

    // Meta line (Subtext and Date)
    const showDate = options.showDate !== false && template.footer.showDate;
    const metaParts: string[] = [];

    if (template.footer.subtext) {
      metaParts.push(template.footer.subtext.toUpperCase());
    }

    if (showDate) {
      const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      metaParts.push(today.toUpperCase());
    }

    if (metaParts.length > 0) {
      const metaY = footerCenterY + actualSize * 0.75 + 10 * scale;
      const metaFontSize = 10 * scale;
      ctx.font = `600 ${metaFontSize}px ${monoFace}`;
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = footerColor;
      drawTrackedText(ctx, metaParts.join(' • '), centerX, metaY, metaFontSize * 0.18);
      ctx.globalAlpha = 1.0;
    }

    // Discreet brand mark at the bottom edge
    const brandY = canvasHeight - 16 * scale;
    ctx.font = `800 ${8 * scale}px ${STRIP_FONT_FAMILIES.sans}`;
    ctx.fillStyle = footerColor;
    ctx.globalAlpha = 0.25;
    drawTrackedText(ctx, 'W S T R I P', centerX, brandY, 3 * scale);

    ctx.restore();
  }

  // 7. Draw Placed Stickers
  if (options.stickers && options.stickers.length > 0) {
    for (const sticker of options.stickers) {
      const def = STICKERS.find((s) => s.id === sticker.stickerId);
      if (!def) continue;
      ctx.save();
      const xPos = (sticker.x / 100) * canvasWidth;
      const yPos = (sticker.y / 100) * canvasHeight;
      const k = (sticker.size * scale) / 24; // paths are authored on a 24x24 grid
      ctx.translate(xPos, yPos);
      ctx.scale(k, k);
      ctx.translate(-12, -12);
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 4 * scale;
      ctx.fillStyle = def.color;
      ctx.fill(new Path2D(def.path), def.evenodd ? 'evenodd' : 'nonzero');
      ctx.restore();
    }
  }

  // Export to Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create canvas blob'));
        }
      },
      'image/png',
      1.0
    );
  });
}
