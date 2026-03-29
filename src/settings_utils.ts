import * as settings from "data/scripts/lib/mod_settings.lua";
import { GUI_OPTION } from "data/scripts/lib/utilities.lua";
import { convertHSVtoRGB } from "./color_utils";

export type HideableModSetting =
  | ModSettingLabel
  | ModSettingCheckbox
  | ModSettingSlider
  | ModSettingHue
  | ModSettingEnum
  | ModSettingText;

export type MyModSetting = ModSetting | ModSettingHue;

export interface ModSettingHue extends ModSettingSlider {
  value_min: typeof HUE.MIN;
  value_max: typeof HUE.MAX;
  ui_fn: typeof mod_setting_hue;
  /** Preview HSV saturation (0 to 1, default: 1) */
  preview_s?: number;
  /** Preview HSV value (0 to 1, default: 1) */
  preview_v?: number;
}

export const HUE = {
  MIN: 0,
  MAX: 360,
} as const;

// wrapper for mod_setting_number
export function mod_setting_hue(
  mod_id: string,
  gui: GuiID,
  in_main_menu: boolean,
  im_id: number,
  setting: ModSettingHue,
) {
  const sliderWidth = 64;
  const [nameWidth] = GuiGetTextDimensions(gui, setting.ui_name);

  // gradient image behind slider
  const sliderOffset = settings.mod_setting_group_x_offset + nameWidth + 1;
  const sliderImagePath = `mods/${mod_id}/assets/hue_slider.png`;
  GuiZSetForNextWidget(gui, 1);
  GuiOptionsAddForNextWidget(gui, GUI_OPTION.Layout_NextSameLine);
  GuiImage(gui, im_id, sliderOffset, -1, sliderImagePath, 1, 1, 10);

  // get preview color
  let [h, s, v] = [
    ModSettingGetNextValue(`${mod_id}.${setting.id}`),
    setting.preview_s ?? 1,
    setting.preview_v ?? 1,
  ];
  if (typeof h != "number") h = setting.value_default ?? 0;
  const [r, g, b] = convertHSVtoRGB(h, s, v);

  // color preview next to slider
  const whiteImagePath = `mods/${mod_id}/assets/1px_white.png`;
  GuiColorSetForNextWidget(gui, r, g, b, 1);
  GuiOptionsAddForNextWidget(gui, GUI_OPTION.Layout_NextSameLine);
  GuiImage(gui, im_id, sliderOffset + sliderWidth + 3, -1, whiteImagePath, 1, 10, 10);

  // hacky way to add padding between slider and its value
  let spacePaddingWidth = 0;
  let spacePadding = "";
  while (spacePaddingWidth < 10) {
    spacePadding += " ";
    const [w] = GuiGetTextDimensions(gui, spacePadding);
    spacePaddingWidth = w;
  }

  settings.mod_setting_number(mod_id, gui, in_main_menu, im_id, {
    ...setting,
    value_display_formatting: spacePadding + (setting.value_display_formatting ?? ""),
  });
}
