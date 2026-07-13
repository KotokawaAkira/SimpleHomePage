// 自定义日期类型
type MyDate = {
  year: number;
  day: number;
  date: number;
  month: number;
  hours: number;
  minites: number;
  seconds: number;
};
// 常用页面类型
type FrequentWebsite = {
  url: string;
  webName: string;
  iconUrl?: string;
};
type SelectedWebsite = FrequentWebsite & {
  index: number;
};
// 弹窗参数
type ModalProps = {
  confirm?: boolean;
  show: boolean;
  doConfirm?: () => void;
  disabled?: boolean;
  contentOverflow?: boolean;
  width?: string;
  minWidth?: string;
  height?: string;
  minHeight?: string;
};
// 搜索引擎类型
type SearchEngine = {
  index: number;
  engineName: string;
  url: string;
  logo_url: string;
};
// 页面重定向类型
type RedirectMode = {
  value: number;
  modeName: string;
};
// 颜色主题类型
type ColorSchemeMode = {
  value: number;
  modeName: string;
};
export type {
  MyDate,
  FrequentWebsite,
  SelectedWebsite,
  ModalProps,
  SearchEngine,
  RedirectMode,
  ColorSchemeMode,
};
