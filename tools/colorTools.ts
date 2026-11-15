import { DEFAULT_THEME_COLOR } from "../src/config/themeColorConfig";

type Rgb = { r: number; g: number; b: number };

// 缓存上一次的计算结果，避免同一张图片重复解析
let cachedSrc = "";
let cachedColor = "";

/* ============================================================
   一、纯颜色算法（不依赖 DOM）
   ============================================================ */

// 尝试将 3 位/6 位十六进制颜色规范化为小写 #rrggbb，非法时返回 null
function tryNormalizeHex(value: string): string | null {
  const raw = (value || "").trim();
  if (/^#?[0-9a-fA-F]{6}$/.test(raw)) {
    return `#${raw.replace("#", "").toLowerCase()}`;
  }
  if (/^#?[0-9a-fA-F]{3}$/.test(raw)) {
    const c = raw.replace("#", "").toLowerCase();
    return `#${c[0]}${c[0]}${c[1]}${c[1]}${c[2]}${c[2]}`;
  }
  return null;
}

// 将 3 位/6 位十六进制颜色规范化为小写 #rrggbb，非法时返回默认主题色
function normalizeHex(value: string): string {
  return tryNormalizeHex(value) ?? DEFAULT_THEME_COLOR;
}

function rgbToHsl({ r, g, b }: Rgb): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case rn:
      h = (gn - bn) / d + (gn < bn ? 6 : 0);
      break;
    case gn:
      h = (bn - rn) / d + 2;
      break;
    default:
      h = (rn - gn) / d + 4;
      break;
  }
  return [h * 60, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let rgb: [number, number, number] = [0, 0, 0];
  if (hp >= 0 && hp < 1) rgb = [c, x, 0];
  else if (hp < 2) rgb = [x, c, 0];
  else if (hp < 3) rgb = [0, c, x];
  else if (hp < 4) rgb = [0, x, c];
  else if (hp < 5) rgb = [x, 0, c];
  else rgb = [c, 0, x];

  const m = l - c / 2;
  const toHex = (v: number) =>
    Math.round(Math.min(1, Math.max(0, v + m)) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`;
}

// 保证取到的颜色饱和度/明度适中，避免主题色过灰或过暗导致看不清
function normalizeColor({ r, g, b }: Rgb): string {
  let [h, s, l] = rgbToHsl({ r, g, b });
  s = Math.min(1, Math.max(s, 0.38));
  l = Math.min(0.78, Math.max(l, 0.36));
  return hslToHex(h, s, l);
}

/**
 * 图片主题色算法：从 RGBA 像素数据中计算主色。
 * 按颜色分桶统计，饱和度高的颜色权重更大，避免选中大面积灰/白背景。
 */
function calculateImageThemeColor(pixels: Uint8ClampedArray): string {
  const buckets = new Map<
    number,
    { r: number; g: number; b: number; weight: number }
  >();

  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 128) continue;

    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const brightness = max / 255;
    if (brightness < 0.06) continue;

    const saturation = max === 0 ? 0 : (max - min) / max;
    const weight = 0.1 + saturation * (1 - Math.abs(brightness - 0.6) * 0.8);
    if (weight <= 0) continue;

    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.r += r * weight;
      bucket.g += g * weight;
      bucket.b += b * weight;
      bucket.weight += weight;
    } else {
      buckets.set(key, {
        r: r * weight,
        g: g * weight,
        b: b * weight,
        weight,
      });
    }
  }

  let best: { r: number; g: number; b: number; weight: number } | null = null;
  for (const bucket of buckets.values()) {
    if (!best || bucket.weight > best.weight) best = bucket;
  }
  if (!best || best.weight === 0) return DEFAULT_THEME_COLOR;

  return normalizeColor({
    r: best.r / best.weight,
    g: best.g / best.weight,
    b: best.b / best.weight,
  });
}

/* ============================================================
   二、图片读取（DOM / Canvas）
   ============================================================ */

// 将图片缩略绘制到画布并取出像素数据
function readImagePixels(
  img: HTMLImageElement,
  size = 48,
): Uint8ClampedArray | null {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(img, 0, 0, size, size);

  try {
    return ctx.getImageData(0, 0, size, size).data;
  } catch {
    // 跨域图片无法读取像素
    return null;
  }
}

/* ============================================================
   三、对外接口
   ============================================================ */

// 从图片（base64 / url）中提取主题色
function extractImageThemeColor(src: string): Promise<string> {
  if (!src) return Promise.resolve(DEFAULT_THEME_COLOR);
  if (src === cachedSrc) return Promise.resolve(cachedColor);

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const pixels = readImagePixels(img);
      const color = pixels
        ? calculateImageThemeColor(pixels)
        : DEFAULT_THEME_COLOR;
      cachedSrc = src;
      cachedColor = color;
      resolve(color);
    };
    img.onerror = () => resolve(DEFAULT_THEME_COLOR);
    img.src = src;
  });
}

export {
  extractImageThemeColor,
  calculateImageThemeColor,
  normalizeHex,
  tryNormalizeHex,
  DEFAULT_THEME_COLOR,
};
