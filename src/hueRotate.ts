// hella vibecoded

/**
 * Rotate the hue of an RGB color by `deg` degrees.
 */
export function rotateHueRGB(r: number, g: number, b: number, deg: number): { r: number; g: number; b: number } {
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
