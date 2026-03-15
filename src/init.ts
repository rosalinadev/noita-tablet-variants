import mod from "@noita-ts/base";
import nxml from "@noita-ts/nxml";
import { MOD_ID, DEV } from "$mod";
import { ColorFilter, filterTexture, replaceXMLValues } from "./utils";
import { rotateHueRGB } from "./hueRotate";

function doRecolorTablet(hue: number) {
  const paths = [
    "data/items_gfx/emerald_tablet.png",
    "data/ui_gfx/items/emerald_tablet.png",
    "data/items_gfx/in_hand/emerald_tablet_in_hand.png",
  ];
  const hueFilter: ColorFilter = color => {
    if (!color.a) return;
    return {
      ...color,
      ...rotateHueRGB(color.r, color.g, color.b, hue),
    };
  };
  for (const path of paths) {
    filterTexture(path, hueFilter);
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
  const materialTexturePath = `${pathPrefix}/${material}.png`;
  if (ModDoesFileExist(materialTexturePath)) {
    for (const content of nxml.edit_file(`${pathPrefix}/material.xml`)) {
      const [cellDataComp] = content.first_of("CellDataChild");
      const [graphicsComp] = cellDataComp!.first_of("Graphics");
      graphicsComp!.set("texture_file", materialTexturePath);
      filterTexture(materialTexturePath, color => {
        return {
          ...color,
          a: 127,
        };
      });
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
