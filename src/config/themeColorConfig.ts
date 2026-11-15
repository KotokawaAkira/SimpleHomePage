import type { ThemeColorMode } from "../types/types";

// 默认主题色，与 style.css 中 --color_mizuki 保持一致
const DEFAULT_THEME_COLOR = "#ddaacc";

const ThemeColorConfig: ThemeColorMode[] = [
  { value: 1, modeName: "背景图片" },
  { value: 2, modeName: "自定义" },
];

// 默认选中「自定义」，且颜色为默认主题色
const DEFAULT_THEME_COLOR_MODE: ThemeColorMode =
  ThemeColorConfig.find((item) => item.value === 2) ?? ThemeColorConfig[0];

export { DEFAULT_THEME_COLOR, DEFAULT_THEME_COLOR_MODE };
export type { ThemeColorMode };
export default ThemeColorConfig;
