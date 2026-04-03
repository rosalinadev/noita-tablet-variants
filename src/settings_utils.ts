import * as settings from "data/scripts/lib/mod_settings.lua";
import { GUI_OPTION } from "data/scripts/lib/utilities.lua";
import { convertHSVtoRGB } from "./color_utils";
import { MOD_ID } from "$mod";

export interface Tablet {
  id: string;
  name: string;
  settings?: HideableModSetting[];
  altText?: string;
  altTextLabel?: ModSettingLabel;
  credit?: string;
}

export function defineTablets<const T extends readonly Tablet[]>(tablets: T): Tablet[] & T {
  return tablets as Tablet[] & T;
}

export function defineValues<const T extends readonly (readonly [string, string])[]>(
  values: T,
): [string, string][] & T {
  return values as [string, string][] & T;
}

export type MyModSetting = ModSetting | ModSettingHue;

export type HideableModSetting = Exclude<MyModSetting, ModSettingCategory>;

export interface ModSettingHue extends ModSettingSlider {
  value_min: typeof HUE.MIN;
  value_max: typeof HUE.MAX;
  /** Preview HSV saturation (0 to 1, default: 1) */
  preview_s?: number;
  /** Preview HSV value (0 to 1, default: 1) */
  preview_v?: number;
}

export const HUE = {
  MIN: 0,
  MAX: 360,
} as const;

/** 2px white square */
const whiteImagePath = `data/ui_gfx/empty_white.png`;

export const makeSettingHue = (setting: ModSettingHue): ModSettingHue => ({
  ...setting,
  // wrapper for mod_setting_number
  draw: function ({ gui, in_main_menu, im_id }) {
    const sliderWidth = 64;
    const [nameWidth] = GuiGetTextDimensions(gui, this.ui_name);

    const drawSlice = ([r, g, b]: number[], x: number, width: number) => {
      GuiZSetForNextWidget(gui, 1);
      GuiColorSetForNextWidget(gui, r, g, b, 1);
      GuiOptionsAddForNextWidget(gui, GUI_OPTION.Layout_NextSameLine);
      GuiImage(gui, im_id, x, -1, whiteImagePath, 1, width / 2, 5);
    };

    // gradient behind slider
    const sliderOffset = settings.mod_setting_group_x_offset + nameWidth + 1;
    drawSlice([1, 0, 0], sliderOffset, 4);
    const hueGradientWidth = sliderWidth - 7;
    for (let i = 0; i < hueGradientWidth; i++) {
      const hue = ((HUE.MAX - HUE.MIN) * i) / (hueGradientWidth - 1) + HUE.MIN;
      const rgb = convertHSVtoRGB(hue, 1, 1);
      drawSlice(rgb, sliderOffset + 4 + i, 1);
    }
    drawSlice([1, 0, 0], sliderOffset + sliderWidth - 3, 5);

    // get preview color
    let [h, s, v] = [
      ModSettingGetNextValue(`${MOD_ID}.${this.id}`),
      this.preview_s ?? 1,
      this.preview_v ?? 1,
    ];
    if (typeof h != "number") h = this.value_default ?? 0;
    const [r, g, b] = convertHSVtoRGB(h, s, v);

    // color preview next to slider
    GuiColorSetForNextWidget(gui, r, g, b, 1);
    GuiOptionsAddForNextWidget(gui, GUI_OPTION.Layout_NextSameLine);
    GuiImage(gui, im_id, sliderOffset + sliderWidth + 3, -1, whiteImagePath, 1, 5, 5);

    // hacky way to add padding between slider and its value
    let spacePaddingWidth = 0;
    let spacePadding = "";
    while (spacePaddingWidth < 10) {
      spacePadding += " ";
      const [w] = GuiGetTextDimensions(gui, spacePadding);
      spacePaddingWidth = w;
    }

    settings.mod_setting_number(MOD_ID, gui, in_main_menu, im_id, {
      ...this,
      value_display_formatting: spacePadding + (this.value_display_formatting ?? ""),
    });
  },
});
