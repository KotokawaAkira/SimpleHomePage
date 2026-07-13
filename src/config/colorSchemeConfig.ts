import type { ColorSchemeMode } from "../types/types";
const ColorSchemeConfig: ColorSchemeMode[] = [
  { value: 0, modeName: "跟随系统" },
  { value: 1, modeName: "浅色" },
  { value: 2, modeName: "深色" },
];
export type { ColorSchemeMode };
export default ColorSchemeConfig;
