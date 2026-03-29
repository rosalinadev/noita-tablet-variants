import mod from "@noita-ts/base";
import nxml from "@noita-ts/nxml";
import { MOD_ID, DEV } from "$mod";
import { copyTexture, filterTexture, replaceXMLValues } from "./utils";
import { colorToNoitaHex, rotateHueRGB } from "./color_utils";

const tabletTextures = Object.entries({
  in_world: "data/items_gfx/emerald_tablet.png",
  in_ui: "data/ui_gfx/items/emerald_tablet.png",
  in_hand: "data/items_gfx/in_hand/emerald_tablet_in_hand.png",
}).map(([replacementTexture, targetPath]) => ({
  game: targetPath,
  replacement: (variant: string) => `mods/${MOD_ID}/tablets/${variant}/${replacementTexture}.png`,
}));

function doRecolorTablet(hue: number) {
  const vanillaTabletHue = 144;
  for (const { game: path } of tabletTextures) {
    filterTexture(path, color => {
      const { r, g, b, a } = color;
      if (!a) return;
      return {
        ...rotateHueRGB(r, g, b, hue - vanillaTabletHue),
        a,
      };
    });
  }
}

function replaceTextures(variant: string) {
  if (variant === "default") return;

  for (const { game, replacement } of tabletTextures) {
    const replacementPath = replacement(variant);
    if (!ModDoesFileExist(replacementPath)) continue;
    copyTexture(replacementPath, game);
  }
}

function replaceParticles(bookBase: nxml.XMLElement, variant: string) {
  const material = `${MOD_ID}_spark_tablet`;
  const pathPrefix = `mods/${MOD_ID}/materials`;
  let materialTexturePath = `${pathPrefix}/${variant}.png`;

  for (const content of nxml.edit_file(`${pathPrefix}/material.xml`)) {
    const [cellDataComp] = content.first_of("CellDataChild");
    if (!cellDataComp) return;
    cellDataComp.set("name", material);

    const [graphicsComp] = cellDataComp.first_of("Graphics");
    if (!graphicsComp) return;
    if (ModDoesFileExist(materialTexturePath)) {
      filterTexture(materialTexturePath, color => {
        return {
          ...color,
          a: 127,
        };
      });
    } else materialTexturePath = "";
    graphicsComp.set("texture_file", materialTexturePath);

    if (variant === "recolor") {
      const [r, g, b] = [150, 255, 70];
      const vanillaSparkHue = 94; // spark_green #96FF46

      const sparkColor = rotateHueRGB(r, g, b, mod.settings.tablet_hue - vanillaSparkHue);
      const sparkColorHex = colorToNoitaHex({ ...sparkColor, a: 127 });

      graphicsComp.set("color", sparkColorHex);
    }
  }
  ModMaterialsFileAdd(`${pathPrefix}/material.xml`);

  replaceXMLValues(bookBase, {
    ParticleEmitterComponent: {
      emitted_material_name: material,
    },
  });
}

mod.on("ModInit", () => {
  if (mod.settings.tablet === "recolor") {
    doRecolorTablet(mod.settings.tablet_hue);
  }

  replaceTextures(mod.settings.tablet);
  for (const bookBase of nxml.edit_file("data/entities/items/books/base_book.xml")) {
    replaceParticles(bookBase, mod.settings.particles);
  }
});

mod.on("PlayerSpawned", () => {
  if (DEV) GamePrint(`Tablet variant: ${mod.settings.tablet}`);
});
