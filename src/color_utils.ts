export type Color = { r: number; g: number; b: number; a: number };
export type ColorFilter = (color: Color) => Color | undefined;

export function colorToNoitaHex({ r, g, b, a }: Color) {
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return toHex(a) + toHex(r) + toHex(g) + toHex(b);
}

/**
 * Rotate the hue of an RGB color by `deg` degrees.
 */
// hella vibecoded
export function rotateHueRGB(
  r: number,
  g: number,
  b: number,
  deg: number,
): { r: number; g: number; b: number } {
  // convert RGB to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number = 0,
    s: number = 0,
    l: number = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  // rotate hue
  h = (h * 360 + deg) % 360;
  if (h < 0) h += 360;
  h /= 360;

  // convert HSL back to RGB
  let r2: number, g2: number, b2: number;

  if (s === 0) {
    r2 = g2 = b2 = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r2 = hue2rgb(p, q, h + 1 / 3);
    g2 = hue2rgb(p, q, h);
    b2 = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: Math.round(r2 * 255), g: Math.round(g2 * 255), b: Math.round(b2 * 255) };
}

/**
 * Convert HSV to RGB
 * @param {number} h Hue in degrees
 * @param {number} [s = 1] Saturation (0-1)
 * @param {number} [v = 1] Value (0-1)
 * @returns RGB values as an array [r, g, b] where each component is in the range 0-255
 * @see {@link https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_RGB_alternative|Algorithm on Wikipedia}
 */
export function convertHSVtoRGB(h: number, s: number = 1, v: number = 1): [number, number, number] {
  h %= 360;
  const f = (n: number): number => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return [f(5), f(3), f(1)];
}
