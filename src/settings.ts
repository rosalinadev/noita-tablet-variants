import { MOD_ID } from "$mod";
import {
  defineTablets,
  defineValues,
  MyModSetting,
  makeSettingHue,
  HUE,
  Tablet,
} from "./settings_utils";

const VARIANT_ID = "tablet";
const PARTICLES_ID = "particles";

declare global {
  interface SettingsShape {
    tablet: (typeof unfilteredTablets)[number]["id"];
    tablet_hue: number;
    particles: (typeof particles)[number][0];
    particles_hue: number;
  }
}

const unfilteredTablets = defineTablets([
  { id: "default", name: "Default" },
  {
    id: "recolor",
    name: "Recolored",
    settings: [
      makeSettingHue({
        id: "tablet_hue",
        ui_name: "",
        ui_description: "Hue to apply to the tablet when recoloring.",
        value_default: 144,
        value_min: HUE.MIN,
        value_max: HUE.MAX,
        value_display_formatting: " $0deg",
        scope: ModSettingScope.Restart,
        preview_s: 0.4,
        preview_v: 0.8,
      }),
    ],
  },
  { id: "rainbow", name: "Rainbow" },
  { id: "trans", name: "Trans", credit: "kabby's Trans Pride Tablet mod" },
] as const satisfies readonly Tablet[]);

const particles = defineValues([
  ["default", "Default"],
  ["recolor", "Recolored"],
  ["rainbow", "Rainbow"],
  ["trans", "Trans"],
] as const satisfies readonly (readonly [string, string])[]);

const tablets = unfilteredTablets.filter(variant => {
  if (variant.credit) variant.altText = `Credit: ${variant.credit}`;
  return true;
});

const particlesHueSetting = makeSettingHue({
  id: "particles_hue",
  ui_name: "",
  ui_description: "Hue to apply to the particles when recoloring.",
  value_default: 94,
  value_min: HUE.MIN,
  value_max: HUE.MAX,
  value_display_formatting: " $0deg",
  scope: ModSettingScope.Restart,
  hidden: ModSettingGetNextValue(`${MOD_ID}.${PARTICLES_ID}`) !== "recolor",
  preview_s: 0.73,
});

const settings = [
  {
    id: VARIANT_ID,
    ui_name: "Tablet",
    ui_description: "Which tablet variant to use.",
    value_default: "default",
    values: tablets.map(({ id, name }) => [id, name]),
    scope: ModSettingScope.Restart,
    onchange({ old_value, new_value }) {
      const oldTablet = tablets.find(t => t.id === old_value);
      const newTablet = tablets.find(t => t.id === new_value);

      const setHidden = (tablet: Tablet | undefined, hidden: boolean) => {
        if (tablet?.altTextLabel) tablet.altTextLabel.hidden = hidden;
        tablet?.settings?.forEach(setting => (setting.hidden = hidden));
      };
      setHidden(oldTablet, true);
      setHidden(newTablet, false);
    },
  },

  ...tablets.flatMap(({ id, settings }) => {
    if (!settings) return [];
    return settings.map(setting => {
      setting.hidden = ModSettingGetNextValue(`${MOD_ID}.${VARIANT_ID}`) !== id;
      return setting;
    });
  }),

  ...tablets.flatMap(tablet => {
    const { altText, id } = tablet;
    if (!altText) return [];
    return (tablet.altTextLabel = {
      not_setting: true,
      ui_name: altText,
      hidden: ModSettingGetNextValue(`${MOD_ID}.${VARIANT_ID}`) !== id,
    });
  }),

  {
    id: PARTICLES_ID,
    ui_name: "Particles",
    ui_description: "Which alternate particles to use. (changes the emitted material)",
    value_default: "default",
    values: particles,
    scope: ModSettingScope.Restart,
    onchange({ new_value }) {
      particlesHueSetting.hidden = new_value !== "recolor";
    },
  },
  particlesHueSetting,
] as const satisfies MyModSetting[];
export default settings;
