declare global {
  interface SettingsShape extends ExtractSettings<typeof import("./settings")> {}
}

export default [
  {
    id: "tablet",
    ui_name: "Tablet",
    ui_description:
      "Which tablet variant to use.\nVariant 'Recolor' is configured using the 'Hue Shift' setting.",
    value_default: "default",
    values: [
      ["default", "Default"],
      ["recolor", "Recolored"],
      ["burger", "Burger"],
      ["pride", "Pride"],
      ["trans", "Trans"],
    ],
    scope: ModSettingScope.Restart,
  },
  {
    id: "hue_shift",
    ui_name: "Hue Shift",
    ui_description: "Hue shift to apply to the tablet when recoloring.",
    value_default: 170,
    value_min: 0,
    value_max: 360,
    value_display_formatting: " $0deg",
    scope: ModSettingScope.Restart,
  },
  {
    id: "particles",
    ui_name: "Particles",
    ui_description: "Which alternate particles to use. (changes the emitted material)",
    value_default: "default",
    values: [
      ["default", "Default"],
      ["material_rainbow", GameTextGet("$mat_rainbow")],
      ["trans", "Trans"],
    ],
    scope: ModSettingScope.Restart,
    // hidden: false as boolean,
  },
] as const satisfies ModSetting[];
