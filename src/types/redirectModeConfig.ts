type RedirectMode = {
  value: number;
  modeName: string;
};
const RedirectModeConfig: RedirectMode[] = [
  { value: 0, modeName: "直接跳转" },
  { value: 1, modeName: "打开新页面" },
];
export type { RedirectMode };
export default RedirectModeConfig;
