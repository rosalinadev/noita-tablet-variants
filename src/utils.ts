import nxml from "@noita-ts/nxml";
import { MOD_ID } from "$mod";

export function log(...args: any[]) {
  print(`[${MOD_ID}]`, ...args);
}
export function log_err(...args: any[]) {
  print_error(`[${MOD_ID}|!]`, ...args);
}

export function replaceXMLValues(element: nxml.XMLElement, replacements: nxml.XmlHints) {
  for (const [compName, attrs] of Object.entries(replacements)) {
    const [comp] = element.first_of(compName);
    if (!comp) continue;

    for (const [attrName, value] of Object.entries(attrs)) {
      comp.set(attrName, value);
    }
  }
}

export type Color = { r: number; g: number; b: number; a: number };
export type ColorFilter = (color: Color) => Color | undefined;
export function filterTexture(filename: string, filter: ColorFilter) {
  const [id, width, height] = ModImageMakeEditable(filename, 0, 0);
  if (!id) {
    log_err(`ModImageMakeEditable() failed for ${filename}`);
    return;
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pxRaw = ModImageGetPixel(id, x, y);
      let color = filter({
        r: pxRaw & 0xff,
        g: (pxRaw >> 8) & 0xff,
        b: (pxRaw >> 16) & 0xff,
        a: pxRaw >> 24,
      });
      if (!color) continue;
      ModImageSetPixel(id, x, y, (color.a << 24) | (color.b << 16) | (color.g << 8) | color.r);
    }
  }
}
