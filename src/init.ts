import mod from "@noita-ts/base";
import nxml from "@noita-ts/nxml";
import { MOD_ID, DEV } from "$mod";
import { rotateHueRGB } from "./hueRotate";

function replaceXMLValues(element: nxml.XMLElement, replacements: nxml.XmlHints) {
  for (const [compName, attrs] of Object.entries(replacements)) {
    const [comp] = element.first_of(compName);
    if (!comp) continue;

    for (const [attrName, value] of Object.entries(attrs)) {
      comp.set(attrName, value);
    }
  }
}

function recolorTexture(filename: string, hue: number) {
  const [id, width, height] = ModImageMakeEditable(filename, 0, 0);
  if (!id) {
    print_error(`ModImageMakeEditable() failed for ${filename}`);
    return;
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pxRaw = ModImageGetPixel(id, x, y);
      if (!((pxRaw >> 24) & 0xff)) continue;
      let color = {
        r: pxRaw & 0xff,
        g: (pxRaw >> 8) & 0xff,
        b: (pxRaw >> 16) & 0xff,
        a: pxRaw >> 24,
      };
      color = {
        ...color,
        ...rotateHueRGB(color.r, color.g, color.b, hue),
      };
      const newVal = color.r | (color.g << 8) | (color.b << 16) | (color.a << 24);
      ModImageSetPixel(id, x, y, newVal);
    }
  }
}

function doRecolorTablet(hue: number) {
  const paths = [
    "data/items_gfx/emerald_tablet.png",
    "data/ui_gfx/items/emerald_tablet.png",
    "data/items_gfx/in_hand/emerald_tablet_in_hand.png",
  ];
  for (const path of paths) {
    recolorTexture(path, hue);
  }
}

function replaceTextures(bookBase: nxml.XMLElement, variant: string) {
  // TODO keep original hitbox no matter what
  if (variant === "default") return;
  const pathPrefix = `mods/${MOD_ID}/tablets/${variant}`;
  const pathReplacements: nxml.XmlHints = {
    PhysicsImageShapeComponent: {
      image_file: `${pathPrefix}/in_world.png`,
    },
    ItemComponent: {
      ui_sprite: `${pathPrefix}/in_ui.png`,
    },
    SpriteComponent: {
      image_file: `${pathPrefix}/in_hand.png`,
    },
  };
  for (const comp of Object.values(pathReplacements)) {
    for (const [attrName, path] of Object.entries(comp)) {
      if (!ModDoesFileExist(path as string)) {
        delete comp[attrName];
      }
    }
  }
  replaceXMLValues(bookBase, pathReplacements);
}

function replaceParticles(bookBase: nxml.XMLElement, material: string) {
  if (material === "default") return;
  const pathPrefix = `mods/${MOD_ID}/materials`;
  if (ModDoesFileExist(`${pathPrefix}/${material}.png`)) {
    for (const content of nxml.edit_file(`${pathPrefix}/material.xml`)) {
      const [cellDataComp] = content.first_of("CellDataChild");
      const [graphicsComp] = cellDataComp!.first_of("Graphics");
      graphicsComp!.set("texture_file", `${pathPrefix}/${material}.png`);
      material = `${MOD_ID}_${material}`;
      cellDataComp!.set("name", material);
    }
    ModMaterialsFileAdd(`${pathPrefix}/material.xml`);
  }
  replaceXMLValues(bookBase, {
    ParticleEmitterComponent: {
      emitted_material_name: material,
    },
  });
}

mod.on("ModInit", () => {
  if (mod.settings.tablet === "recolor") {
    doRecolorTablet(mod.settings.hue_shift);
  }

  for (const bookBase of nxml.edit_file("data/entities/items/books/base_book.xml")) {
    replaceTextures(bookBase, mod.settings.tablet);
    replaceParticles(bookBase, mod.settings.particles);
  }
});

mod.on("PlayerSpawned", () => {
  if (DEV) GamePrint(`Tablet variant: ${mod.settings.tablet}`);
});
