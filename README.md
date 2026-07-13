# SimpleHomePage

一个用于**覆盖 Chrome 浏览器新标签页**的自定义主页 Chrome 扩展（Manifest V3）。打开新标签页时展示实时时钟、可切换搜索引擎的搜索框、可拖拽排序的常用网址快捷入口，并支持自定义背景图片。

基于 **Vue 3 + TypeScript + Vite + SCSS** 构建。

---

## 功能特性

- **实时时钟**：显示当前时间（时:分:秒）、日期（年/月/日）和星期。
- **搜索框**：内置必应、谷歌、百度三种搜索引擎，可一键切换，回车或点击按钮即可搜索。
- **常用网址快捷入口**：
  - 网格布局展示常用网站，支持添加、编辑、删除。
  - 通过 `vuedraggable` 支持拖拽排序。
  - 有图标 URL 时显示图标，否则显示网站名称首字母头像。
- **自定义背景图片**：上传本地图片作为主页背景，支持一键恢复默认。
- **页面跳转模式**：可选择"直接跳转"或"打开新页面"。
- **颜色主题**：支持"跟随系统""浅色""深色"三种模式手动切换，未手动指定时通过 `prefers-color-scheme` 自动适配系统。
- **毛玻璃模糊调节**：通过滑块调整主页卡片的高斯模糊强度（0–30px，控制 `--val_blur`）。
- **背景透明度调节**：通过滑块调整卡片背景不透明度（0–1.0，步进 0.05，控制 `--bg_mainbox` 的 alpha）。
- **数据持久化**：设置项保存在浏览器本地存储中，重启后依然生效。

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3（`<script setup>` 组合式 API） |
| 语言 | TypeScript（strict 模式） |
| 构建 | Vite 8 |
| 样式 | SCSS（`sass`） |
| 拖拽 | vuedraggable v4 |
| SVG | vite-svg-loader（将 SVG 作为 Vue 组件导入） |
| 扩展 | Chrome Manifest V3（`@types/chrome`） |

---

## 目录结构

```
SimpleHomePage/
├── manifest.json              # Chrome 扩展清单（Manifest V3），位于仓库根目录
├── index.html                 # 入口 HTML
├── vite.config.ts             # Vite 配置（含 manifest.json 复制插件）
├── package.json
├── tsconfig.*.json            # TypeScript 配置
├── env.d.ts
├── public/                    # 静态资源（favicon 等）
└── src/
    ├── main.ts                # 应用入口，挂载到 #app
    ├── App.vue                # 根组件，仅渲染 MainPage
    ├── style.css              # 全局样式与 CSS 变量（明暗主题）
    ├── components/
    │   ├── MainPage.vue       # 核心单页组件：时钟、搜索、网格、设置弹窗
    │   └── Modal.vue          # 通用弹窗组件（设置 / 添加 / 编辑 / 删除确认复用）
    ├── config/
    │   ├── searchConfig.ts    # 搜索引擎配置（必应 / 谷歌 / 百度）
    │   ├── redirectModeConfig.ts  # 页面跳转模式配置
    │   └── colorSchemeConfig.ts   # 颜色主题模式配置（跟随系统 / 浅色 / 深色）
    ├── types/
    │   └── types.ts           # 全部共享 TypeScript 类型
    └── assets/                # SVG 图标与默认背景图
└── tools/                     # 纯 TS 工具模块（不属于 Vue 组件树）
    ├── useCache.ts            # 存储读写（双存储：chrome.storage.local / localStorage）
    ├── useFile.ts             # FileReader 读取图片为 base64
    └── timeTools.ts           # 时间/星期格式化
```

---

## 架构说明

### 组件层级

```
index.html → src/main.ts → App.vue → MainPage.vue
                                          └── Modal.vue（复用于 4 个弹窗）
```

- **`MainPage.vue`** 是应用的核心，集中承载了时钟、搜索框（含引擎切换下拉）、可拖拽的快捷入口网格，以及设置、添加网址、编辑网址、删除确认四个弹窗的调用逻辑。
- **`Modal.vue`** 是通用弹窗组件，通过 props 控制宽高、是否显示"确定"按钮、确定按钮是否禁用及确认回调。点击遮罩层空白处可关闭（通过 `mousedown`/`mouseup` 目标一致性判断，避免拖拽误关）。

### 数据存储（`tools/useCache.ts`）

采用**双存储策略**：

- **背景图片（base64）**：运行为扩展时使用 `chrome.storage.local`（配合 `unlimitedStorage` 权限，避免 `localStorage` 容量限制）；在普通浏览器环境下降级为 `localStorage`。
- **其他数据（webList、engine、redirectMode、colorScheme、blurValue、bgOpacity）**：始终使用 `localStorage`，通过 `addToLocalStorage` 以 JSON 形式存储。

运行环境通过 `typeof chrome !== "undefined" && !!chrome.runtime && !!chrome.runtime.id` 判断。

### 类型定义（`src/types/types.ts`）

| 类型 | 用途 |
|------|------|
| `MyDate` | 响应式时间数据结构 |
| `FrequentWebsite` | 常用网站（url、webName、可选 iconUrl） |
| `SelectedWebsite` | 编辑时的网站（含 index） |
| `ModalProps` | 弹窗组件参数 |
| `SearchEngine` | 搜索引擎配置 |
| `RedirectMode` | 页面跳转模式 |
| `ColorSchemeMode` | 颜色主题模式 |

### 样式约定

- SVG 通过 `vite-svg-loader` 作为 **Vue 组件**导入，例如 `import add from "../assets/add.svg"`，模板中以 `<component :is="add" />` 或直接 `<add />` 渲染。
- 样式使用 SCSS。`MainPage.vue` 的样式大部分为非 scoped，按功能分区块组织；`Modal.vue` 使用 `<style scoped>`。
- 明暗主题通过 `src/style.css` 中的 CSS 自定义属性实现，深色变体位于 `@media (prefers-color-scheme: dark)` 内；手动切换主题时通过 `<html data-theme="light|dark">` 覆盖对应变量。
- 毛玻璃模糊强度由 `--val_blur` 控制；卡片背景不透明度由 `--bg_mainbox_alpha` 控制（`--bg_mainbox` 拆分为 `--bg_mainbox_rgb` 与 `--bg_mainbox_alpha`，使不透明度可在明暗主题下独立调节）。

---

## 环境要求

- Node.js（建议 18+）
- npm
- Chrome 浏览器（用于加载扩展）

---

## 快速开始

### 安装依赖

```bash
npm install
```

### 本地开发（浏览器预览）

```bash
npm run dev
```

> 注意：`npm run dev` 仅在浏览器中以普通网页方式运行，**不会**作为扩展加载，此时背景图片走 `localStorage` 降级方案。

### 构建生产版本

```bash
npm run build
```

该命令会先执行 `vue-tsc -b` 进行**类型检查（类型错误会导致构建失败）**，再执行 `vite build` 打包到 `dist/`。`vite.config.ts` 中的 `copy-manifest` 插件会在打包结束后自动把 `manifest.json` 复制到 `dist/` 目录。

### 预览生产构建

```bash
npm run preview
```

---

## 作为 Chrome 扩展加载

1. 执行 `npm run build` 生成 `dist/` 目录（其中已包含 `manifest.json`）。
2. 打开 Chrome，访问 `chrome://extensions`。
3. 开启右上角的**开发者模式**。
4. 点击**加载已解压的扩展程序**，选择 `dist/` 目录。
5. 打开一个新标签页即可看到自定义主页。

### manifest.json 说明

```json
{
  "name": "SimpleHomePage",
  "version": "1.0",
  "manifest_version": 3,
  "chrome_url_overrides": { "newtab": "index.html" },
  "permissions": ["storage", "unlimitedStorage"]
}
```

- `chrome_url_overrides.newtab`：将新标签页覆盖为本扩展页面。
- `storage` / `unlimitedStorage`：用于持久化背景图片等数据，且不受默认存储配额限制。

---

## 配置扩展

### 新增搜索引擎

编辑 `src/config/searchConfig.ts`，在 `EnginConfig` 数组中追加一项，并准备好对应的 SVG 图标放入 `src/assets/`：

```ts
{
  index: 3,
  engineName: "DuckDuckGo",
  url: "https://duckduckgo.com/?q=",
  logo_url: ddg_logo, // 从 src/assets 导入的 SVG
}
```

### 修改跳转模式

编辑 `src/config/redirectModeConfig.ts`。当前提供两种模式：`直接跳转`（value 0）与 `打开新页面`（value 1）。

### 修改颜色主题选项

编辑 `src/config/colorSchemeConfig.ts`。当前提供三种模式：`跟随系统`（value 0）、`浅色`（value 1）与 `深色`（value 2）。

### 调整主题颜色

编辑 `src/style.css` 中 `:root` 与深色模式 `@media` 块内的 CSS 变量。

---

## 开发约定

- TypeScript 开启 strict 模式，同时启用 `noUnusedLocals` 与 `noUnusedParameters`，未使用的变量/参数会导致构建失败。
- 未配置 linter、formatter 或测试脚本，**所有验证需手动进行**（浏览器运行 `npm run dev` 或加载扩展）。
- `tsconfig.app.json` 覆盖 `src/**` 与 `tools/**`；`tsconfig.node.json` 仅覆盖 `vite.config.ts`。

---

## 已知问题

- **时钟日期/星期不更新**：`MainPage.vue` 中定时器（约 357 行）在更新时使用了模块作用域下陈旧的 `nowDate` 来设置 `time.day` / `time.date`，而非新建的 `newTime`，导致星期和日期在页面重新加载前不会刷新。时:分:秒 正常更新。

---

## License

私有项目（`package.json` 中标记为 `"private": true`）。
