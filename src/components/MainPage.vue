<template>
  <section class="home">
    <nav class="nav"></nav>
    <main class="main">
      <div class="main-box box_bg">
        <!-- 显示时间 -->
        <section class="show-time">
          <div class="time">{{ timeString }}</div>
          <div class="date">
            <div>{{ time.year }}/{{ time.month + 1 }}/{{ time.date }}</div>
            <div>{{ dayToChineseDay(time.day) }}</div>
          </div>
        </section>
        <!-- 搜索框 -->
        <section class="search">
          <div class="search-box">
            <!-- 选择搜索引擎 -->
            <div class="select">
              <div
                class="selection-box"
                title="更换搜索引擎"
                @click.stop="toggleDropdown"
              >
                <transition
                  name="show"
                  mode="out-in"
                  v-for="engine in EnginConfig"
                  :key="'A' + engine.index"
                >
                  <button
                    class="logo"
                    v-if="searchEngine.index === engine.index"
                  >
                    <component :is="engine.logo_url" />
                  </button>
                </transition>
              </div>
              <!-- 弹出选项框 -->
              <transition name="fade">
                <div v-show="isOpen" class="options-box">
                  <div
                    class="option-item"
                    v-for="engine in EnginConfig"
                    :key="'B' + engine.index"
                    @click="selectOption(engine)"
                  >
                    <component :is="engine.logo_url" />
                    <span>{{ engine.engineName }}</span>
                  </div>
                </div>
              </transition>
            </div>
            <input
              type="text"
              v-model="inputText"
              v-on:keydown="onEnterPress"
            />
            <div class="do-search" @click="doSearch">
              <button class="logo">
                <search_logo />
              </button>
            </div>
          </div>
        </section>
      </div>
      <!-- 常用URL栏 -->
      <div class="container">
        <draggable
          v-model="webList"
          item-key="id"
          class="grid-list"
          animation="300"
          ghost-class="ghost"
        >
          <template #item="{ element, index }" :key="element">
            <a :href="element.url">
              <div
                class="grid-item box_bg"
                @click.prevent="goWebsite(element.url)"
              >
                <div
                  class="icon delete_ico"
                  title="删除"
                  @click.stop.prevent="openDeleteConfirm(index)"
                >
                  <delete_ico />
                </div>
                <div
                  class="icon edit_ico"
                  title="编辑"
                  @click.stop.prevent="openEdit(element, index)"
                >
                  <menu_ico />
                </div>
                <template v-if="element.url && element.iconUrl.length > 0">
                  <img
                    :src="element.iconUrl"
                    :alt="element.webName"
                    class="avatar-img"
                  />
                </template>
                <template v-else>
                  <div class="avatar-text">
                    {{ getInitial(element.webName) }}
                  </div>
                </template>
                <div class="name-label" :title="element.webName">
                  {{ element.webName }}
                </div>
              </div>
            </a>
          </template>
        </draggable>
      </div>
    </main>
    <footer class="foot">
      <!-- 右下角图标 -->
      <div class="setting-list">
        <button
          class="add-url box_bg"
          title="添加常用URL"
          @click="showModal_add = true"
        >
          <add />
        </button>
        <button class="settings box_bg" title="设置" @click="showModal = true">
          <settings />
        </button>
      </div>
    </footer>
  </section>
  <!-- 设置 弹窗 -->
  <transition name="fade">
    <Modal
      :show="showModal"
      @close="closeModal"
      width="35%"
    >
      <div class="setBackgroundImg">
        <h1>设置背景图片</h1>
        <div class="bg-preview">
          <img
            v-if="backgroundImageBase64"
            :src="backgroundImageBase64"
            alt="当前背景图片"
            class="bg-preview-img"
          />
          <div class="bg-preview-mask">
            <label class="mask-action" title="更改背景">
              <!-- <span>更改背景</span> -->
               <images/>
              <input
                type="file"
                accept="image/png,image/jpg,image/jpeg"
                @change="uploadBackground"
              />
            </label>
            <div class="mask-divider"></div>
            <button class="mask-action" title="恢复默认" @click="restoreImg">
              <refresh/>
            </button>
          </div>
        </div>
      </div>
      <div class="page-redirect">
        <div>页面跳转:</div>
        <div
          v-for="item in RedirectModeConfig"
          class="page-redirect-option"
          @click="changeRedirectMode(item)"
        >
          <input
            type="radio"
            name="mode-redirect"
            :id="`${item.value}/${item.modeName}`"
            :value="item.value"
            v-model="redirectMode.value"
            @change="changeRedirectMode(item)"
          /><label :for="`${item.value}/${item.modeName}`">{{
            item.modeName
          }}</label>
        </div>
      </div>
      <div class="page-redirect">
        <div>颜色主题:</div>
        <div
          v-for="item in ColorSchemeConfig"
          :key="item.value"
          class="page-redirect-option"
          @click="changeColorScheme(item)"
        >
          <input
            type="radio"
            name="mode-color-scheme"
            :id="`color-${item.value}`"
            :value="item.value"
            v-model="colorSchemeMode.value"
            @change="changeColorScheme(item)"
          /><label :for="`color-${item.value}`">{{ item.modeName }}</label>
        </div>
      </div>
      <div class="page-redirect blur-setting">
        <div>高斯模糊:</div>
        <input
          type="range"
          min="0"
          max="30"
          step="1"
          v-model.number="blurValue"
          @input="changeBlur"
        />
        <span class="blur-value">{{ blurValue }}px</span>
      </div>
      <div class="page-redirect blur-setting">
        <div>背景透明:</div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          v-model.number="bgOpacity"
          @input="changeBgOpacity"
        />
        <span class="blur-value">{{ bgOpacity.toFixed(2) }}</span>
      </div>
    </Modal>
  </transition>
  <!-- 添加常用URL 弹窗 -->
  <transition name="fade">
    <Modal
      :show="showModal_add"
      :confirm="true"
      :disabled="!isAddLegal"
      width="30%"
      minHeight="300px"
      minWidth="300px"
      :doConfirm="addConfirm"
      @close="closeModalAdd"
    >
      <div class="list-container">
        <h1>添加常用URL</h1>
        <div class="list-item">
          <h2>名称 *</h2>
          <input type="text" v-model="addWebsite.webName" />
        </div>
        <div class="list-item">
          <h2>URL *</h2>
          <input type="text" v-model="addWebsite.url" />
        </div>
        <div class="list-item">
          <h2>图标URL</h2>
          <input type="text" v-model="addWebsite.iconUrl" />
        </div>
      </div>
    </Modal>
  </transition>
  <!-- 编辑 弹窗 -->
  <transition name="fade">
    <Modal
      :show="showModal_edit"
      :confirm="true"
      :disabled="!isEditLegal"
      width="30%"
      minHeight="300px"
      minWidth="300px"
      :doConfirm="editConfirm"
      @close="closeModalEdit"
    >
      <div class="edit-container">
        <div class="list-container">
          <h1>编辑</h1>
          <div class="list-item">
            <h2>名称 *</h2>
            <input type="text" v-model="editWebsite.webName" />
          </div>
          <div class="list-item">
            <h2>URL *</h2>
            <input type="text" v-model="editWebsite.url" />
          </div>
          <div class="list-item">
            <h2>图标URL</h2>
            <input type="text" v-model="editWebsite.iconUrl" />
          </div>
        </div>
      </div>
    </Modal>
  </transition>
  <!-- 删除确认 弹窗 -->
  <transition name="fade">
    <Modal
      :show="showModal_delete"
      :confirm="true"
      width="25%"
      minWidth="280px"
      minHeight="160px"
      :doConfirm="deleteConfirm"
      @close="closeModalDelete"
    >
      <div class="delete-container delete-text">
        <h1>确认删除</h1>
        <p>确定要删除吗？此操作不可撤销。</p>
      </div>
    </Modal>
  </transition>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { checkTimeLength, dayToChineseDay } from "../../tools/timeTools";
import draggable from "vuedraggable";
import search_logo from "../assets/magnifier-search.svg";
import settings from "../assets/settings.svg";
import add from "../assets/add.svg";
import delete_ico from "../assets/delete.svg";
import menu_ico from "../assets/menu.svg";
import defaultImg from "../assets/1.png";
import images from "../assets/images.svg";
import refresh from "../assets/refresh.svg";
import { type SearchEngine, EnginConfig } from "../config/searchConfig";
import type { FrequentWebsite, MyDate, SelectedWebsite } from "../types/types";
import {
  getFromLocalStorage,
  addToLocalStorage,
  doGetImgBase64,
  doSaveImgBase64,
  setEngine,
  removeImgStorage,
} from "../../tools/useCache";
import Modal from "./Modal.vue";
import { readImgToBase64 } from "../../tools/useFile";
import type { RedirectMode } from "../config/redirectModeConfig";
import RedirectModeConfig from "../config/redirectModeConfig";
import type { ColorSchemeMode } from "../config/colorSchemeConfig";
import ColorSchemeConfig from "../config/colorSchemeConfig";
let appNode: HTMLDivElement | undefined;
const nowDate = new Date();
// 响应式时间数据
const time = reactive<MyDate>({
  year: nowDate.getFullYear(),
  day: nowDate.getDay(),
  date: nowDate.getDate(),
  month: nowDate.getMonth(),
  hours: nowDate.getHours(),
  minites: nowDate.getMinutes(),
  seconds: nowDate.getSeconds(),
});
const showModal = ref(false);
const showModal_add = ref(false);
const showModal_edit = ref(false);
const showModal_delete = ref(false);
const deleteTargetIndex = ref(-1);
// 当前选中搜索引擎
const searchEngine = ref<SearchEngine>(EnginConfig[0]);
// 响应式计算时间
const timeString = computed(
  () =>
    `${checkTimeLength(time.hours)}:${checkTimeLength(time.minites)}:${checkTimeLength(time.seconds)}`,
);
// 响应输入数据
const inputText = ref("");
// 背景图片base64
const backgroundImageBase64 = ref<string | null>("");
const addWebsite = reactive<FrequentWebsite>({
  url: "",
  webName: "",
  iconUrl: "",
});
const editWebsite = reactive<SelectedWebsite>({
  index: -1,
  url: "",
  webName: "",
  iconUrl: "",
});
// 页面跳转模式
const redirectMode = ref<RedirectMode>({ value: 0, modeName: "直接跳转" });
// 颜色主题模式
const colorSchemeMode = ref<ColorSchemeMode>({ value: 0, modeName: "跟随系统" });
// 高斯模糊数值(px)
const blurValue = ref(6);
// 背景不透明度(0-1)
const bgOpacity = ref(0.5);
// 判断是否合法输入
const isAddLegal = computed(() => {
  return (
    addWebsite.url !== undefined &&
    addWebsite.webName !== undefined &&
    addWebsite.url.length > 0 &&
    addWebsite.webName.length > 0
  );
});
const isEditLegal = computed(() => {
  return (
    editWebsite.url !== undefined &&
    editWebsite.webName !== undefined &&
    editWebsite.url.length > 0 &&
    editWebsite.webName.length > 0
  );
});
let webList = ref<FrequentWebsite[]>([]);
// 读取主页添加的网站
const browserWebList = getFromLocalStorage("webList");
if (browserWebList) {
  const list = JSON.parse(browserWebList) as FrequentWebsite[];
  webList.value = list;
}
// 更新时间数据
setInterval(() => {
  const newTime = new Date();
  time.year = newTime.getFullYear();
  time.day = nowDate.getDay();
  time.date = nowDate.getDate();
  time.hours = newTime.getHours();
  time.minites = newTime.getMinutes();
  time.seconds = newTime.getSeconds();
}, 1000);
// 选项框弹窗
const isOpen = ref(false);
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};
const selectOption = (engine: SearchEngine) => {
  searchEngine.value = engine;
  isOpen.value = false;
};
// 点击外部自动关闭
const closeDropdown = () => {
  isOpen.value = false;
  setCache();
};

// 初始化
getCache();

onMounted(() => {
  window.addEventListener("click", closeDropdown);
  // 设置背景
  appNode = document.querySelector("#app") as HTMLDivElement;
  if (backgroundImageBase64.value && backgroundImageBase64.value.length > 0)
    appNode.style.backgroundImage = `url(${backgroundImageBase64.value})`;
});
onUnmounted(() => window.removeEventListener("click", closeDropdown));
watch(
  backgroundImageBase64,
  (newUrl) => {
    if (appNode) appNode.style.backgroundImage = `url(${newUrl})`;
  },
  { immediate: true },
);
// 监听弹窗是否弹出
watch(showModal_add, () => {
  addWebsite.url = "";
  addWebsite.iconUrl = "";
  addWebsite.webName = "";
});
watch(showModal_edit, (newValue) => {
  if (!newValue) {
    editWebsite.index = -1;
    editWebsite.url = "";
    editWebsite.iconUrl = "";
    editWebsite.webName = "";
  }
});
// 监听网页列表
watch(
  webList,
  () => {
    addToLocalStorage<FrequentWebsite[]>("webList", webList.value);
  },
  { deep: true },
);
// 打开新页面
function goWebsite(url: string) {
  switch (redirectMode.value.value) {
    case 0:
      window.location.href = url;
      break;
    case 1:
      window.open(url);
      break;
  }
}
// 搜索逻辑
function doSearch() {
  goWebsite(searchEngine.value.url + inputText.value);
}
// 监听键盘enter
function onEnterPress(e: KeyboardEvent) {
  if (e.key === "Enter") {
    doSearch();
    e.preventDefault();
  }
}
// 写入本地缓存
function setCache() {
  setEngine(searchEngine.value);
}
// 读取本地缓存
function getCache() {
  // 获取搜索引擎设置
  const searchEngineCache = getFromLocalStorage("engine");
  if (searchEngineCache)
    searchEngine.value = JSON.parse(searchEngineCache) as SearchEngine;
  else {
    searchEngine.value = EnginConfig[0];
    setCache();
  }
  // 获取图片
  doGetImgBase64((result) => {
    backgroundImageBase64.value = defaultImg;
    if (result) backgroundImageBase64.value = result;
  });
  // 获取页面跳转方式
  const mode = getFromLocalStorage("redirectMode");
  if (mode) redirectMode.value = JSON.parse(mode) as RedirectMode;
  // 获取颜色主题
  const colorScheme = getFromLocalStorage("colorScheme");
  if (colorScheme) colorSchemeMode.value = JSON.parse(colorScheme) as ColorSchemeMode;
  applyColorScheme();
  // 获取高斯模糊数值
  const blur = getFromLocalStorage("blurValue");
  if (blur !== null) blurValue.value = JSON.parse(blur) as number;
  applyBlur();
  // 获取背景不透明度
  const opacity = getFromLocalStorage("bgOpacity");
  if (opacity !== null) bgOpacity.value = JSON.parse(opacity) as number;
  applyBgOpacity();
}
// 选择图片
function uploadBackground(e: Event) {
  const fileElement = e.target as HTMLInputElement;
  const file = fileElement.files?.[0];
  if (!file) return;
  readImgToBase64(file, (result) => {
    // 写入浏览器存储
    doSaveImgBase64(result);
    // 设置图片
    backgroundImageBase64.value = result;
  });
}
// 获取首字母并转大写
function getInitial(name: string) {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
}
// 添加到主页
function addToHome(item: FrequentWebsite) {
  webList.value.push({
    webName: item.webName,
    url: item.url,
    iconUrl: item.iconUrl,
  });
  addToLocalStorage<FrequentWebsite[]>("webList", webList.value);
  showModal_add.value = false;
}
// 确认添加到主页
function addConfirm() {
  addToHome(addWebsite);
}
// 关闭弹窗
function closeModal() {
  showModal.value = false;
}
function closeModalAdd() {
  showModal_add.value = false;
}
function closeModalEdit() {
  showModal_edit.value = false;
}
// 删除确认
function openDeleteConfirm(index: number) {
  deleteTargetIndex.value = index;
  showModal_delete.value = true;
}
function deleteConfirm() {
  webList.value.splice(deleteTargetIndex.value, 1);
}
function closeModalDelete() {
  showModal_delete.value = false;
}
function openEdit(website: FrequentWebsite, index: number) {
  showModal_edit.value = true;
  editWebsite.index = index;
  editWebsite.iconUrl = website.iconUrl;
  editWebsite.url = website.url;
  editWebsite.webName = website.webName;
}
// 确认修改
function editConfirm() {
  webList.value[editWebsite.index].url = editWebsite.url;
  webList.value[editWebsite.index].iconUrl = editWebsite.iconUrl;
  webList.value[editWebsite.index].webName = editWebsite.webName;
}
// 恢复默认图片
function restoreImg() {
  removeImgStorage();
  backgroundImageBase64.value = defaultImg;
}
// 修改页面跳转模式
function changeRedirectMode(mode: RedirectMode) {
  redirectMode.value = mode;
  addToLocalStorage<RedirectMode>("redirectMode", mode);
}
// 应用颜色主题
function applyColorScheme() {
  const html = document.documentElement;
  switch (colorSchemeMode.value.value) {
    case 1:
      html.setAttribute("data-theme", "light");
      break;
    case 2:
      html.setAttribute("data-theme", "dark");
      break;
    default:
      html.removeAttribute("data-theme");
      break;
  }
}
// 修改颜色主题
function changeColorScheme(mode: ColorSchemeMode) {
  colorSchemeMode.value = mode;
  addToLocalStorage<ColorSchemeMode>("colorScheme", mode);
  applyColorScheme();
}
// 应用高斯模糊
function applyBlur() {
  document.documentElement.style.setProperty(
    "--val_blur",
    `${blurValue.value}px`,
  );
}
// 修改高斯模糊
function changeBlur() {
  applyBlur();
  addToLocalStorage<number>("blurValue", blurValue.value);
}
// 应用背景不透明度
function applyBgOpacity() {
  document.documentElement.style.setProperty(
    "--bg_mainbox_alpha",
    `${bgOpacity.value}`,
  );
}
// 修改背景不透明度
function changeBgOpacity() {
  applyBgOpacity();
  addToLocalStorage<number>("bgOpacity", bgOpacity.value);
}
</script>
<style lang="scss">
/* ============================================================
   1. 页面布局（导航 / 主区 / 时间 / 搜索 / 页脚）
   ============================================================ */
.home {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-position: center;
  background: linear-gradient(
    180deg,
    var(--bg_shadow_up),
    var(--bg_shadow_down)
  );
  .nav {
    flex: 1;
  }
  .main {
    flex: 8;
    display: flex;
    align-items: center;
    width: 100%;
    flex-direction: column;
    gap: 2rem;
    &-box {
      width: 80%;
      height: 60%;
      min-width: 820px;
      display: flex;
      gap: 3rem;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 0 0 0;
      box-sizing: border-box;
      z-index: 10;
      .show-time {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 10rem;
        width: 80%;
        box-sizing: border-box;
        padding: 2rem;

        .time {
          flex: 2;
          font-size: clamp(4rem, 6vw, 8rem);
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .date {
          height: 100%;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          div {
            height: 50%;
            flex: 1;
            display: flex;
            align-items: center;
            font-size: clamp(1.5rem, 2vw, 4rem);
          }
        }
      }
      .search {
        height: 12rem;
        width: 80%;
        padding: 1rem;
        display: flex;
        justify-content: center;
        align-items: center;
        &-box {
          padding: 0 1rem 0 1rem;
          box-sizing: border-box;
          display: flex;
          justify-content: center;
          height: 8rem;
          width: 100%;
          border-radius: 5rem;
          border: 1px solid var(--text-h);
          background-color: none;
          transition: all 0.5s ease;
          box-shadow: 1px 2px 4px rgba(0, 0, 0, 0.3);
          &:focus-within {
            background-color: var(--bg_search);
            border-color: var(--color_mizuki);
            border-width: 1px;
            box-shadow: none;
          }
          .select {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            max-width: 6rem;
            position: relative;
            .selection-box {
              position: relative;
              button {
                position: absolute;
              }
            }
          }
          input[type="text"] {
            padding: 0 0.3rem;
            flex: 8;
            background: none;
            border: none;
            outline: none;
            font-size: 3rem;
            color: var(--text);
          }
          .do-search {
            flex: 1;
            height: 100%;
            max-width: 6rem;
            .logo {
              padding: 0;
              svg {
                fill: var(--search_logo);
              }
            }
          }
        }
      }
    }
  }
  .logo {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
    &:active {
      transform: scale(0.9);
    }
    svg {
      height: 5rem;
      width: 5rem;
    }
  }
  .foot {
    flex: 2;
  }
}

/* ============================================================
   2. 搜索引擎选项框
   ============================================================ */
.options-box {
  position: absolute;
  top: calc(100% + 8px); /* 距离按钮下方 8px */
  left: 0;
  width: 100%;
  z-index: 100;
  color: var(--text);
  border-radius: 6px;
  background: var(--bg_selection);
  border: 1px solid rgba(255, 255, 255, 0.3); /* 让毛玻璃边缘更精致 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  .option-item {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    padding: 6px 4px;
    cursor: pointer;
    font-size: clamp(1rem, 0.8vw, 1.5rem);
    transition: background 0.2s;
    height: clamp(2rem, 2.5vh, 5rem);
    &:hover {
      background: var(--bg_selection_hover);
    }
  }
}

/* ============================================================
   3. 过渡动画
   ============================================================ */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0px);
}
.show-enter-active,
.show-leave-active {
  transition: all 0.3s ease;
}
.show-enter-from,
.show-leave-to {
  opacity: 0;
}
.show-enter-to,
.show-leave-from {
  opacity: 1;
}

/* ============================================================
   4. 通用工具类 & 右下角按钮
   ============================================================ */
.box_bg {
  border-radius: 2rem;
  background: (var(--bg_mainbox));
  backdrop-filter: blur(var(--val_blur));
}
.setting-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: fixed;
  right: 3vw;
  bottom: 5vh;
  gap: 1rem;
  svg {
    fill: var(--search_logo);
  }
  .settings,
  .add-url {
    height: 5rem;
    width: 5rem;
    padding: 1rem;
    box-sizing: border-box;
    cursor: pointer;
    &:active svg {
      transition: all 0.3s ease;
      transform: scale(0.9);
    }
  }
}

/* ============================================================
   5. 弹窗内容（表单 / 背景设置 / 页面跳转 / 删除确认）
   ============================================================ */
.list-item {
  h2 {
    font-size: clamp(1.5rem, 1.5vw, 2rem);
    transition: all 0.3s ease;
  }
  &:has(input[type="text"]:focus) h2 {
    color: var(--color_mizuki);
  }
}
.list-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  h1 {
    font-size: clamp(2rem, 2vw, 4rem);
  }
  input[type="text"] {
    box-sizing: border-box;
    border-radius: 3px;
    height: 3rem;
    width: 100%;
    border: 1px solid var(--text-h);
    padding: 0 0.5rem;
    flex: 8;
    background: none;
    outline: none;
    font-size: 2rem;
    color: var(--text);
    transition: all 0.3s ease;
    &:focus {
      border-color: var(--color_mizuki);
    }
  }
}
.setBackgroundImg {
  width: 100%;
  .bg-preview {
    display: block;
    position: relative;
    width: 80%;
    // max-width: 320px;
    aspect-ratio: 16 / 9;
    margin: 1rem 0;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--text-h);
    .bg-preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .bg-preview-mask {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      background-color: rgba(0, 0, 0, 0.4);
      opacity: 0;
      transition: opacity 0.3s ease;
      .mask-action {
        color: #fff;
        font-size: clamp(1.5rem, 1.5vw, 2rem);
        background: none;
        border: none;
        padding: 0.3rem 0.5rem;
        transition: all 0.3s ease;
        aspect-ratio: 1 / 1;
        width: 15%;
        min-width: 50px;
        max-width: 100px;
        cursor: pointer;
        svg {
          width: 100%;
          height: 100%;
          fill: currentColor;
        }
        &:hover {
          color: var(--color_mizuki);
        }
        &:active {
          transform: scale(0.95);
        }
      }
      .mask-divider {
        width: 1px;
        align-self: stretch;
        margin: 20% 0;
        background-color: rgba(255, 255, 255, 0.5);
      }
      input[type="file"] {
        display: none;
      }
    }
    &:hover .bg-preview-mask {
      opacity: 1;
    }
  }
}
/* ============================================================
   6. 常用 URL 网格（可拖拽排序）
   ============================================================ */
.container {
  border-radius: 2rem;
  box-sizing: border-box;
  width: 80%;
  min-width: 820px;
  max-height: 300px;
  overflow-y: scroll;
  padding: 0 5px 0 0;
  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-track {
    background: var(--scrollbar_track);
  }
  &::-webkit-scrollbar-thumb {
    background: var(--scrollbar_thumb);
    border-radius: 2rem;
    &:hover {
      background: var(--color_mizuki);
    }
  }
}

/* 核心 Grid 布局：auto-fill 自动填充，minmax 保证最小 120px */
.grid-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.grid-item {
  position: relative;
  aspect-ratio: 1 / 1; /* 保持正方形 */
  border-radius: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  overflow: hidden;
  gap: 0.5rem;
  &:active {
    cursor: grabbing;
  }
  &:hover .icon {
    opacity: 1;
  }
  .delete_ico {
    opacity: 0;
    top: 5%;
    right: 5%;
  }
  .edit_ico {
    opacity: 0;
    top: 5%;
    left: 5%;
  }
  .icon {
    height: 18%;
    width: 18%;
    position: absolute;
    border-radius: 0.5rem;
    padding: 0.5rem;
    box-sizing: border-box;
    transition: all 0.3s ease;
    &:hover {
      background-color: var(--bg_modal);
    }
    svg {
      fill: var(--search_logo);
    }
  }
  .avatar-img {
    width: 60%;
    height: 60%;
    object-fit: contain;
  }
  .avatar-text {
    width: 60%;
    height: 60%;
    background-color: var(--color_mizuki);
    color: var(--code-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: bold;
    border-radius: 50%;
  }
  .name-label {
    font-size: 1.5rem;
    width: 90%;
    text-align: center;
    box-sizing: border-box;
    padding: 1rem 0.5rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

/* 拖拽时的幽灵效果 */
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
  border-radius: 2rem;
}

/* ============================================================
   7. 弹窗补充样式（页面跳转 / 删除确认）
   ============================================================ */
.page-redirect {
  margin: 2rem 0;
  height: fit-content;
  font-size: clamp(1.5rem, 1.5vw, 2rem);
  display: flex;
  align-items: center;
  gap: 1rem;
  &-option {
    width: fit-content;
    height: fit-content;
    padding: 0.5rem;
    input[type="radio"] {
      cursor: pointer;
    }
    input[type="radio"]:checked {
      accent-color: var(--color_mizuki);
    }
    label {
      cursor: pointer;
    }
  }
}
.delete-text {
  h1 {
    font-size: clamp(2rem, 2vw, 4rem);
  }
  p {
    margin-top: 3rem;
    font-size: clamp(1.5rem, 1.5vw, 2rem);
  }
}
.blur-setting {
  input[type="range"] {
    flex: 1;
    cursor: pointer;
    accent-color: var(--color_mizuki);
  }
  .blur-value {
    min-width: 4rem;
    text-align: right;
  }
}
</style>
