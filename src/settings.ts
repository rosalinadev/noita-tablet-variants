import { MOD_ID } from "$mod";
import {
  HideableModSetting,
  MyModSetting,
  ModSettingHue,
  mod_setting_hue,
  HUE,
} from "./settings_utils";

declare global {
  interface SettingsShape {
    tablet: "default" | "recolor" | "rainbow" | "trans";
    tablet_hue: number;
    particles: "default" | "recolor" | "rainbow" | "trans";
    particles_hue: number;
  }
}

interface Tablet {
  id: string;
  name: string;
  settings?: HideableModSetting[];
  credit?: string;
  creditSetting?: ModSettingLabel;
}

const variantId = "tablet";
const tablets: Tablet[] = [
  { id: "default", name: "Default" },
  {
    id: "recolor",
    name: "Recolored",
    settings: [
      {
        id: "tablet_hue",
        ui_name: "",
        ui_description: "Hue to apply to the tablet when recoloring.",
        value_default: 144,
        value_min: HUE.MIN,
        value_max: HUE.MAX,
        value_display_formatting: " $0deg",
        scope: ModSettingScope.Restart,
        draw: mod_setting_hue,
        preview_s: 0.4,
        preview_v: 0.8,
      },
    ],
  },
  { id: "rainbow", name: "Rainbow" },
  { id: "trans", name: "Trans", credit: "kabby's Trans Pride Tablet mod" },
];

const particlesId = "particles";
const particlesHueSetting = {
  id: "particles_hue",
  ui_name: "",
  ui_description: "Hue to apply to the particles when recoloring.",
  value_default: 94,
  value_min: HUE.MIN,
  value_max: HUE.MAX,
  value_display_formatting: " $0deg",
  scope: ModSettingScope.Restart,
  hidden: ModSettingGetNextValue(`${MOD_ID}.${particlesId}`) !== "recolor",
  draw: mod_setting_hue,
  preview_s: 0.73,
} satisfies ModSettingHue;

const settings = [
  {
    id: variantId,
    ui_name: "Tablet",
    ui_description: "Which tablet variant to use.",
    value_default: "default",
    values: tablets.map(({ id, name }) => [id, name]),
    scope: ModSettingScope.Restart,
    onchange({ old_value, new_value }) {
      function setHidden(tablet: string, hidden: boolean) {
        const tabletInfo = tablets.find(t => t.id === tablet);
        if (!tabletInfo) return;
        if (tabletInfo.creditSetting) tabletInfo.creditSetting.hidden = hidden;
        tabletInfo.settings?.forEach(setting => (setting.hidden = hidden));
      }
      setHidden(old_value, true);
      setHidden(new_value, false);
    },
  },

  ...tablets.flatMap(({ id, settings }) => {
    if (!settings) return [];
    return settings.map(setting => {
      setting.hidden = ModSettingGetNextValue(`${MOD_ID}.${variantId}`) !== id;
      return setting;
    });
  }),

  ...tablets.flatMap(tablet => {
    const { credit, id } = tablet;
    if (!credit) return [];
    return (tablet.creditSetting = {
      not_setting: true,
      ui_name: `Tablet credit: ${credit}`,
      hidden: ModSettingGetNextValue(`${MOD_ID}.${variantId}`) !== id,
    });
  }),

  {
    id: particlesId,
    ui_name: "Particles",
    ui_description: "Which alternate particles to use. (changes the emitted material)",
    value_default: "default",
    values: [
      ["default", "Default"],
      ["recolor", "Recolored"],
      ["rainbow", "Rainbow"],
      ["trans", "Trans"],
    ],
    scope: ModSettingScope.Restart,
    onchange({ new_value }) {
      particlesHueSetting.hidden = new_value !== "recolor";
    },
  },
  particlesHueSetting,
] as const satisfies MyModSetting[];
export default settings;
