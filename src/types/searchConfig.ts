// 导入搜索引擎SVG
import baidu_logo from "../assets/baidu-color.svg";
import google_logo from "../assets/google-color.svg";
import bing_logo from "../assets/bing-color.svg";
// 搜索引擎类型
type SearchEngine = {
  index: number;
  engineName: string;
  url: string;
  logo_url: string;
};
// 搜索引擎配置
const EnginConfig: SearchEngine[] = [
  {
    index: 0,
    engineName: "必应",
    url: "https://cn.bing.com/search?q=",
    logo_url: bing_logo,
  },
  {
    index: 1,
    engineName: "谷歌",
    url: "https://www.google.com/search?q=",
    logo_url: google_logo,
  },
  {
    index: 2,
    engineName: "百度",
    url: "https://www.baidu.com/s?wd=",
    logo_url: baidu_logo,
  },
];
export type { SearchEngine };
export { EnginConfig };
