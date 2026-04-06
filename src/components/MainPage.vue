<template>
  <section class="home">
    <nav class="nav"></nav>
    <main class="main">
      <div class="main-box">
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
                <transition name="show" mode="out-in">
                  <button class="logo" v-if="searchEngine === 0">
                    <bing_logo />
                  </button>
                </transition>
                <transition name="show" mode="out-in">
                  <button class="logo" v-if="searchEngine === 1">
                    <google_logo />
                  </button>
                </transition>
                <transition name="show" mode="out-in">
                  <button class="logo" v-if="searchEngine === 2">
                    <baidu_logo />
                  </button>
                </transition>
              </div>
              <transition name="fade">
                <div v-show="isOpen" class="options-box">
                  <div class="option-item" @click="selectOption(0)">
                    <bing_logo />
                    <span>必应</span>
                  </div>
                  <div class="option-item" @click="selectOption(1)">
                    <google_logo />
                    <span>谷歌</span>
                  </div>
                  <div class="option-item" @click="selectOption(2)">
                    <baidu_logo />
                    <span>百度</span>
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
      <div class="container">
        <draggable
          v-model="webList"
          item-key="id"
          class="grid-list"
          animation="300"
          ghost-class="ghost"
        >
          <template #item="{ element, index }" :key="element">
            <div class="grid-item box_bg" @click="goWebsite(element.url)">
              <div
                class="icon delete_ico"
                title="删除"
                @click.stop="confirmDeleteWeblistItem(index)"
              >
                <delete_ico />
              </div>
              <div
                class="icon edit_ico"
                title="编辑"
                @click.stop="openEdit(element, index)"
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
              <div class="name-label">{{ element.webName }}</div>
            </div>
          </template>
        </draggable>
      </div>
    </main>
    <footer class="foot">
      <button class="settings box_bg" title="设置" @click="showModal = true">
        <settings />
      </button>
      <button
        class="add-url box_bg"
        title="添加常用URL"
        @click="showModal_add = true"
      >
        <add />
      </button>
    </footer>
  </section>
  <transition name="fade">
    <Modal :show="showModal" @close="closeModal">
      <h1>设置背景图片</h1>
      <input
        type="file"
        accept="image/png,image/jpg,image/jpeg"
        @change="uploadBackground"
      />
    </Modal>
  </transition>
  <transition name="fade">
    <Modal
      :show="showModal_add"
      :confirm="true"
      :disabled="!isAddLegal"
      width="30%"
      height="25%"
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
  <transition name="fade">
    <Modal
      :show="showModal_edit"
      :confirm="true"
      :disabled="!isEditLegal"
      width="30%"
      height="25%"
      minHeight="300px"
      minWidth="300px"
      :doConfirm="editConfirm"
      @close="closeModalEdit"
    >
      <div class="edit-container">
        <div class="list-container">
          <h1>修改</h1>
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
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { checkTimeLength, dayToChineseDay } from "../../tools/timeTools";
import draggable from "vuedraggable";
import baidu_logo from "../assets/baidu-color.svg";
import google_logo from "../assets/google-color.svg";
import bing_logo from "../assets/bing-color.svg";
import search_logo from "../assets/magnifier-search.svg";
import settings from "../assets/settings.svg";
import add from "../assets/add.svg";
import delete_ico from "../assets/delete.svg";
import menu_ico from "../assets/menu.svg";
import type { FrequentWebsite, MyDate, SelectedWebsite } from "../types/types";
import {
  getFromLocalStorage,
  addToLocalStorage,
  doGetImgBase64,
  doSaveImgBase64,
  setEngine,
} from "../../tools/useCache";
import Modal from "./Modal.vue";

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
// 当前选中搜索引擎
const searchEngine = ref(0);
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
const selectOption = (num: number) => {
  searchEngine.value = num;
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
watch(
  webList,
  () => {
    addToLocalStorage<FrequentWebsite[]>("webList", webList.value);
  },
  { deep: true },
);
function doSearch() {
  switch (searchEngine.value) {
    case 0:
      window.open(`https://cn.bing.com/search?q=${inputText.value}`);
      break;
    case 1:
      window.open(`https://www.google.com/search?q=${inputText.value}`);
      break;
    case 2:
      window.open(`https://www.baidu.com/s?wd=${inputText.value}`);
      break;
  }
}
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
  const searchEngineCache = getFromLocalStorage("engine");
  if (searchEngineCache) searchEngine.value = parseInt(searchEngineCache);
  else {
    searchEngine.value = 0;
    setCache();
  }
  doGetImgBase64((result) => {
    if (result) backgroundImageBase64.value = result;
  });
}
// 选择图片
const uploadBackground = (e: Event) => {
  const fileElement = e.target as HTMLInputElement;
  const file = fileElement.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const result = reader.result as string;
    // 永久保存到本地
    doSaveImgBase64(result);
    backgroundImageBase64.value = result;
  };
  reader.readAsDataURL(file); // 转为 Base64
};
// 获取首字母并转大写的逻辑
const getInitial = (name: string) => {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
};
// 打开页面
function goWebsite(url: string) {
  window.open(url);
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
// 删除置顶网页
function confirmDeleteWeblistItem(index: number) {
  webList.value.splice(index, 1);
}
// 打开修改界面
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
</script>
<style lang="scss">
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
      gap: 5rem;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 2rem;
      background: (var(--bg_mainbox));
      backdrop-filter: blur(6px);

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
            position: relative;
            .selection-box {
              position: relative;
              button {
                position: absolute;
              }
            }
          }
          input[type="text"] {
            padding: 0 1rem 0 1rem;
            flex: 8;
            background: none;
            border: none;
            outline: none;
            font-size: 3rem;
            color: var(--text);
          }
          .do-search {
            flex: 1;
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
// 选项框样式
.dropdown-container {
  position: relative;
  display: inline-block;
  width: 100%;
}

.trigger-btn {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.options-box {
  position: absolute;
  top: calc(100% + 8px); /* 距离按钮下方 8px */
  left: 0;
  width: 100%;
  z-index: 100;
  color: var(--text);

  /* 核心样式 */
  border-radius: 6px; /* 圆角 6px */
  background: var(--bg_selection); /* 半透明背景 */

  border: 1px solid rgba(255, 255, 255, 0.3); /* 让毛玻璃边缘更精致 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.option-item {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 6px 2px;
  cursor: pointer;
  font-size: clamp(1rem, 1vw, 3rem);
  transition: background 0.2s;
  height: clamp(2rem, 2.5vh, 5rem);
}

.option-item:hover {
  background: var(--bg_selection_hover); /* 悬停微调 */
}

/* 简单的进入/离开动画 */
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
.box_bg {
  border-radius: 2rem;
  background: (var(--bg_mainbox));
  backdrop-filter: blur(6px);
}
.settings {
  position: fixed;
  height: 5rem;
  width: 5rem;
  left: 3vw;
  bottom: 5vh;
  padding: 1rem;
  box-sizing: border-box;
  cursor: pointer;
  svg {
    fill: var(--search_logo);
  }
  &:active svg {
    transition: all 0.3s ease;
    transform: scale(0.9);
  }
}
.add-url {
  position: fixed;
  height: 5rem;
  width: 5rem;
  right: 3vw;
  bottom: 5vh;
  padding: 1rem;
  box-sizing: border-box;
  cursor: pointer;
  svg {
    fill: var(--search_logo);
  }
  &:active svg {
    transition: all 0.3s ease;
    transform: scale(0.9);
  }
}
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
    outline: none;
    border: 1px solid var(--text-h);
    padding: 0 1rem 0 1rem;
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
// 排序样式
.container {
  border-radius: 2rem;
  box-sizing: border-box;
  width: 80%;
  min-width: 820px;
  max-height: 300px;
  overflow-y: scroll;
  padding: 0 5px;
  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--bg_search);
    border-radius: 2rem;
  }
}

/* 核心 Grid 布局 */
.grid-list {
  display: grid;
  /* 关键：auto-fill 自动填充，minmax 保证最小 120px，最大平分剩余空间 */
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
    bottom: 30%;
    right: 5%;
  }
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
.grid-item:active {
  cursor: grabbing;
}

.avatar-img {
  width: 60%;
  height: 60%;
  object-fit: cover;
  border-radius: 50%;
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

/* 拖拽时的样式（幽灵效果） */
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>
