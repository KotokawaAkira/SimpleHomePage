type MyDate = {
  year: number;
  day: number;
  date: number;
  month: number;
  hours: number;
  minites: number;
  seconds: number;
};
type FrequentWebsite = {
  url: string;
  webName: string;
  iconUrl?: string;
};
type SelectedWebsite = FrequentWebsite & {
  index: number;
};
type ModalProps = {
  confirm?: boolean;
  show: boolean;
  doConfirm?: () => void;
  disabled?: boolean;
  width?: string;
  minWidth?: string;
  height?: string;
  minHeight?: string;
};
export type { MyDate, FrequentWebsite, SelectedWebsite, ModalProps };
