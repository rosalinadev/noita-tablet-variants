import nxml from "@noita-ts/nxml";
import { MOD_ID } from "$mod";
import { ColorFilter } from "./color_utils";

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

export type ImageInfo = { id: number; width: number; height: number };
export type ImageSource = string | ImageInfo | undefined;

export function openTexture(filename: string): ImageInfo | undefined {
  const [id, width, height] = ModImageMakeEditable(filename, 0, 0);
  if (!id) {
    log_err(`ModImageMakeEditable() failed for ${filename}`);
    return;
  }
  return { id, width, height };
}

export function filterTexture(texture: ImageSource, filter: ColorFilter) {
  if (typeof texture === "string") texture = openTexture(texture);
  if (!texture) return;
  const { id, width, height } = texture;

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

export function copyTexture(from: ImageSource, to: ImageSource) {
  if (typeof from === "string") from = openTexture(from);
  if (typeof to === "string") to = openTexture(to);
  if (!from || !to) return;
  const { id: fromID, width, height } = from;
  const { id: toID, width: toWidth, height: toHeight } = to;
  if (width !== toWidth || height !== toHeight) {
    log_err(`copyTexture mismatch: from: ${width}x${height}, to: ${toWidth}x${toHeight})`);
    return;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const px = ModImageGetPixel(fromID, x, y);
      ModImageSetPixel(toID, x, y, px);
    }
  }
}
