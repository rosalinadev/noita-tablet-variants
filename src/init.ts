import mod from "@noita-ts/base";
import nxml from "@noita-ts/nxml";
import { MOD_ID } from "$mod";
import { rotateHueRGB } from "./hueRotate";

function replaceXMLValues(filename: string, replacements: Record<string, Record<string, string>>) {
  for (const content of nxml.edit_file(filename)) {
    for (const [compName, attrs] of Object.entries(replacements)) {
      const comp = content.first_of(compName);
      if (!comp) continue;

      for (const [attrName, value] of Object.entries(attrs)) {
        // FIXME update xnml when this is fixed:
        (comp as unknown as nxml.XMLElement).set(attrName, value);
      }
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

function replaceTextures(variant: string): Record<string, Record<string, string>> {
  // TODO keep original hitbox no matter what
  if (variant === "default") return {};
  const pathPrefix = `mods/${MOD_ID}/tablets/${variant}`;
  const replacements: Record<string, Record<string, string>> = {
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
  for (const comp of Object.values(replacements)) {
    for (const [attrName, path] of Object.entries(comp)) {
      if (!ModDoesFileExist(path)) {
        delete comp[attrName];
      }
    }
  }
  return replacements;
}

function replaceParticles(material: string): Record<string, Record<string, string>> {
  if (material === "default") return {};
  const pathPrefix = `mods/${MOD_ID}/materials`;
  if (ModDoesFileExist(`${pathPrefix}/${material}.png`)) {
    for (const content of nxml.edit_file(`${pathPrefix}/material.xml`)) {
      const cellDataComp = content.first_of("CellDataChild") as unknown as nxml.XMLElement;
      (cellDataComp.first_of("Graphics") as unknown as nxml.XMLElement).set(
        "texture_file",
        `${pathPrefix}/${material}.png`,
      );
      material = `${MOD_ID}_${material}`;
      cellDataComp.set("name", material);
    }
    ModMaterialsFileAdd(`${pathPrefix}/material.xml`);
  }
  return {
    ParticleEmitterComponent: {
      emitted_material_name: material,
    },
  };
}

mod.on("ModInit", () => {
  if (mod.settings.tablet === "recolor") {
    doRecolorTablet(mod.settings.hue_shift);
  }

  replaceXMLValues("data/entities/items/books/base_book.xml", {
    ...replaceTextures(mod.settings.tablet),
    ...replaceParticles(mod.settings.particles),
  });
});

mod.on("PlayerSpawned", () => {
  GamePrint(`Tablet variant: ${mod.settings.tablet}`);
});
