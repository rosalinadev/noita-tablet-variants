import { MOD_ID } from "$mod";

declare global {
  interface SettingsShape {
    tablet: "default" | "recolor" | "burger" | "pride" | "trans";
    tablet_hue: number;
    particles: "default" | "rainbow" | "trans";
    particles_hue: number;
  }
}

interface HideableModSettingLabel extends ModSettingLabel {
  hidden?: boolean;
}
type HideableModSetting =
  | HideableModSettingLabel
  | ModSettingCheckbox
  | ModSettingSlider
  | ModSettingEnum
  | ModSettingText;

interface Tablet {
  id: string;
  name: string;
  settings?: HideableModSetting[];
  credit?: string;
  creditSetting?: HideableModSettingLabel;
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
        ui_name: "Tablet Hue",
        ui_description: "Hue to apply to the tablet when recoloring.",
        value_default: 170,
        value_min: 0,
        value_max: 360,
        value_display_formatting: " $0deg",
        scope: ModSettingScope.Restart,
      },
    ],
  },
  { id: "burger", name: "Burger", credit: "LeDankSquid's Burger Tablets mod" },
  { id: "pride", name: "Pride", credit: "Dudeguy Broman's Pride Tablet mod" },
  { id: "trans", name: "Trans", credit: "kabby's Trans Pride Tablet mod" },
];

const particlesId = "particles";
const particlesHueSetting = {
  id: "particles_hue",
  ui_name: "Particles Hue",
  ui_description: "Hue to apply to the particles when recoloring.",
  value_default: 170,
  value_min: 0,
  value_max: 360,
  value_display_formatting: " $0deg",
  scope: ModSettingScope.Restart,
  hidden: ModSettingGetNextValue(`${MOD_ID}.${particlesId}`) !== "recolor",
};

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
      ["pride", "Pride"],
      ["trans", "Trans"],
    ],
    scope: ModSettingScope.Restart,
    onchange({ new_value }) {
      particlesHueSetting.hidden = new_value !== "recolor";
    },
  },
  particlesHueSetting,
] as const satisfies ModSetting[];
export default settings;
