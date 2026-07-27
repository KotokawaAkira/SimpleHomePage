<template>
  <section class="home">
    <nav class="nav"></nav>
    <main class="main">
      <div class="main-box box_bg">
        <section class="show-time">
          <div class="time">{{ timeString }}</div>
          <div class="date">
            <div>{{ time.year }}/{{ time.month + 1 }}/{{ time.date }}</div>
            <div>{{ dayToChineseDay(time.day) }}</div>
          </div>
        </section>
        <section class="search">
          <div class="search-box">
            <DropDown v-model="isOpen" class="select">
              <template #trigger>
                <div class="selection-box" title="更换搜索引擎">
                  <transition
                    name="show"
                    mode="out-in"
                    v-for="engine in EnginConfig"
                    :key="'A' + engine.index"
                  >
                    <button
                      class="logo"
                      v-if="customization.engine.index === engine.index"
                    >
                      <component :is="engine.logo_url" />
                    </button>
                  </transition>
                </div>
              </template>
              <div class="options-box">
                <div
                  class="option-item"
                  v-for="engine in EnginConfig"
                  :key="'B' + engine.index"
                  @click="selectOption(engine, customization)"
                >
                  <component :is="engine.logo_url" />
                  <span>{{ engine.engineName }}</span>
                </div>
              </div>
            </DropDown>
            <input
              type="text"
              v-model="inputText"
              @keydown="onEnterPress($event, customization)"
              @focus="showHistory = true"
              @blur="hideHistoryDelayed"
            />
            <div class="do-search" @click="doSearch(customization)">
              <button class="logo">
                <search_logo />
              </button>
            </div>
          </div>
          <transition name="fade">
            <div
              v-show="showHistory && filteredHistory.length > 0"
              class="history-box modify-scroll-bar"
            >
              <div
                class="history-item"
                v-for="(item, index) in filteredHistory"
                :key="index"
                @mousedown.prevent="selectHistoryItem(item, customization)"
              >
                <div class="history-text-container">
                  <span class="history-text">{{ item }}</span>
                </div>
                <button
                  class="history-delete"
                  @mousedown.stop.prevent
                  @click.stop="deleteHistoryItem(index)"
                >
                  ×
                </button>
              </div>
            </div>
          </transition>
        </section>
      </div>
      <div class="container modify-scroll-bar">
        <draggable
          v-model="customization.webList"
          item-key="webList1"
          class="grid-list"
          animation="300"
          ghost-class="ghost"
        >
          <template #item="{ element, index }" :key="element">
            <a :href="element.url">
              <CardView
                :element="element"
                :index="index"
                class="box_bg"
                @click="goWebsite"
                @delete="
                  openDeleteConfirm(index);
                  showModal_delete = true;
                "
                @edit="
                  openEdit($event, index);
                  showModal_edit = true;
                "
              />
            </a>
          </template>
        </draggable>
      </div>
    </main>
    <footer class="foot">
      <div class="setting-list">
        <button
          class="add-url box_bg"
          title="添加常用URL"
          @click="showModal_add = true"
        >
          <add />
        </button>
        <button
          class="settings box_bg"
          title="设置"
          @click="showModal_setting = true"
        >
          <settings />
        </button>
      </div>
    </footer>
  </section>

  <!-- 设置弹窗 -->
  <Modal :show="showModal_setting" @close="closeModal_setting" width="35%">
    <SettingsModal
      :customization="customization"
      :backgroundImageBase64="backgroundImageBase64"
      :systemFonts="systemFonts"
      @uploadBackground="uploadBackground"
      @restoreImg="restoreImg"
      @changeRedirectMode="(mode) => changeRedirectMode(mode, customization)"
      @changeColorScheme="(mode) => changeColorScheme(mode, customization)"
      @changeBlurValue="onChangeBlur"
      @changeBgOpacity="onChangeBgOpacity"
      @selectFont="(font) => selectFont(font, customization)"
      @exportConfig="exportConfig(customization)"
      @openImport="openImportModal"
    />
  </Modal>

  <!-- 添加常用URL弹窗 -->
  <Modal
    :show="showModal_add"
    :confirm="true"
    :disabled="!isAddLegal"
    width="30%"
    minHeight="300px"
    minWidth="300px"
    :doConfirm="
      () => {
        addConfirm(customization);
        showModal_add = false;
      }
    "
    @close="showModal_add = false"
  >
    <WebsiteFormModal v-model="addWebsite" title="添加常用URL" />
  </Modal>

  <!-- 编辑弹窗 -->
  <Modal
    :show="showModal_edit"
    :confirm="true"
    :disabled="!isEditLegal"
    width="30%"
    minHeight="300px"
    minWidth="300px"
    :doConfirm="
      () => {
        editConfirm(customization);
        showModal_edit = false;
      }
    "
    @close="showModal_edit = false"
  >
    <WebsiteFormModal v-model="editWebsite" title="编辑" />
  </Modal>

  <!-- 删除确认弹窗 -->
  <Modal
    :show="showModal_delete"
    :confirm="true"
    width="25%"
    minWidth="280px"
    minHeight="160px"
    :doConfirm="
      () => {
        deleteConfirm(customization);
        showModal_delete = false;
      }
    "
    @close="showModal_delete = false"
  >
    <div class="delete-container delete-text">
      <h1>确认删除</h1>
      <p>确定要删除吗？此操作不可撤销。</p>
    </div>
  </Modal>

  <!-- 导入配置弹窗 -->
  <Modal
    :show="showModal_import"
    :confirm="true"
    :disabled="!importJsonValid"
    width="35%"
    minHeight="320px"
    minWidth="300px"
    :doConfirm="
      () => {
        importConfirm(initAll);
        showModal_import = false;
      }
    "
    disable
    @close="showModal_import = false"
  >
    <ImportModal
      :importJsonText="importJsonText"
      :importFileName="importFileName"
      :importErrorMessage="importErrorMessage"
      @update:importJsonText="importJsonText = $event"
      @onImportFile="onImportFileSelected"
    />
  </Modal>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { dayToChineseDay } from "../../tools/timeTools";

import draggable from "vuedraggable";
import search_logo from "../assets/magnifier-search.svg";
import settings from "../assets/settings.svg";
import add from "../assets/add.svg";

import { EnginConfig } from "../config/searchConfig";
import type { userCustomization } from "../types/types";
import { addToLocalStorage, setEngine } from "../../tools/useCache";
import Modal from "./Modal.vue";
import CardView from "./CardView.vue";
import DropDown from "./DropDown.vue";
import SettingsModal from "./SettingsModal.vue";
import WebsiteFormModal from "./WebsiteFormModal.vue";
import ImportModal from "./ImportModal.vue";

import { useTime } from "../composables/useTime";
import { useSearch } from "../composables/useSearch";
import { useBackground } from "../composables/useBackground";
import { useSettings } from "../composables/useSettings";
import { useWebList } from "../composables/useWebList";
import { useImportExport } from "../composables/useImportExport";

let appNode: HTMLDivElement | undefined;

const { time, timeString, startClock,stopClock } = useTime();

const {
  inputText,
  showHistory,
  isOpen,
  filteredHistory,
  loadSearchHistory,
  loadSearchEngine,
  selectOption,
  doSearch,
  onEnterPress,
  selectHistoryItem,
  deleteHistoryItem,
  hideHistoryDelayed,
} = useSearch();

const { backgroundImageBase64, loadBackground, uploadBackground, restoreImg } =
  useBackground();

const {
  systemFonts,
  loadSettings,
  selectFont,
  changeRedirectMode,
  changeColorScheme,
  changeBlur,
  changeBgOpacity,
  loadSystemFonts,
} = useSettings();

const {
  addWebsite,
  editWebsite,
  isAddLegal,
  isEditLegal,
  loadWebList,
  addConfirm,
  editConfirm,
  openEdit,
  openDeleteConfirm,
  deleteConfirm,
  resetAddWebsite,
  resetEditWebsite,
} = useWebList();

const {
  importJsonText,
  importFileName,
  importErrorMessage,
  importJsonValid,
  exportConfig,
  resetImport,
  onImportFileSelected,
  importConfirm,
} = useImportExport();

const showModal_setting = ref(false);
const showModal_add = ref(false);
const showModal_edit = ref(false);
const showModal_delete = ref(false);
const showModal_import = ref(false);

const customization = reactive<userCustomization>({
  webList: [],
  engine: EnginConfig[0],
  redirectMode: { value: 0, modeName: "直接跳转" },
  colorScheme: { value: 0, modeName: "跟随系统" },
  blurValue: 6,
  bgOpacity: 0.5,
  fontFamily: "system-ui",
});

function initAll() {
  loadSearchHistory();
  loadSearchEngine(customization);
  loadBackground();
  loadWebList(customization);
  loadSettings(customization);
}

function onChangeBlur(value: number) {
  customization.blurValue = value;
  changeBlur(customization);
}

function onChangeBgOpacity(value: number) {
  customization.bgOpacity = value;
  changeBgOpacity(customization);
}

function goWebsite(url: string) {
  switch (customization.redirectMode.value) {
    case 0:
      window.location.href = url;
      break;
    case 1:
      window.open(url);
      break;
  }
}

function closeModal_setting() {
  showModal_setting.value = false;
}

function openImportModal() {
  resetImport();
  showModal_import.value = true;
}

initAll();
startClock();

onMounted(() => {
  appNode = document.querySelector("#app") as HTMLDivElement;
  if (backgroundImageBase64.value && backgroundImageBase64.value.length > 0)
    appNode.style.backgroundImage = `url(${backgroundImageBase64.value})`;
});

onUnmounted(() => {
  stopClock();
});

watch(
  () => customization.engine,
  () => {
    setEngine(customization.engine);
  },
);

watch(
  backgroundImageBase64,
  (newUrl) => {
    if (appNode) appNode.style.backgroundImage = `url(${newUrl})`;
  },
  { immediate: true },
);

watch(showModal_add, () => {
  resetAddWebsite();
});

watch(showModal_edit, (newValue) => {
  if (!newValue) resetEditWebsite();
});

watch(
  () => customization.webList,
  () => {
    addToLocalStorage("webList", customization.webList);
  },
  { deep: true },
);

watch(showModal_setting, (newVal) => {
  if (newVal) loadSystemFonts();
});
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
    margin: 0 0 3% 0;
  }

  .main {
    flex: 10;
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
        position: relative;

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
            flex: 8;
            padding: 0 0.3rem;
            background: none;
            border: none;
            outline: none;
            font-size: 3rem;
            font-family: var(--sans);
            height: 100%;
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
    margin: 3% 0 0 0;
  }
}

/* ============================================================
   2. 搜索引擎选项框
   ============================================================ */
.options-box {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 100%;
  z-index: 100;
  color: var(--text);
  border-radius: 6px;
  background: var(--bg_selection);
  border: 1px solid rgba(255, 255, 255, 0.3);
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

/* 搜索历史 */
.history-box {
  position: absolute;
  top: 115px;
  left: 1rem;
  right: 1rem;
  z-index: 100;
  color: var(--text);
  border-radius: 6px;
  background: var(--bg_selection);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 48vh;
  overflow-y: auto;

  .history-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
    font-size: clamp(1.5rem, 1.2vw, 2.25rem);
    transition: background 0.2s;
    height: clamp(2.5rem, 3.5vh, 5rem);

    &:hover {
      background: var(--bg_selection_hover);
    }

    .history-text-container {
      display: flex;
      align-items: center;
      flex: 1;
      height: 100%;

      .history-text {
        height: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: flex;
        align-items: center;
      }
    }

    .history-delete {
      background: none;
      border: none;
      color: var(--text);
      cursor: pointer;
      padding: 2px 6px;
      font-size: 1.2em;
      opacity: 0.5;
      flex-shrink: 0;

      &:hover {
        opacity: 1;
        color: var(--color_mizuki);
      }
    }
  }
}

/* ============================================================
   3. 过渡动画
   ============================================================ */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
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
   5. 删除确认弹窗
   ============================================================ */
.delete-text {
  h1 {
    font-size: clamp(2rem, 2vw, 4rem);
  }

  p {
    margin-top: 3rem;
    font-size: clamp(1.5rem, 1.5vw, 2rem);
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
}

.grid-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
  border-radius: 2rem;
}

/* ============================================================
   7. 移动端适配 (max-width: 600px)
   ============================================================ */
@media screen and (max-width: 600px) {
  #app {
    min-height: 100vh;
  }

  .home {
    .main {
      gap: 1rem;

      &-box {
        width: 95%;
        min-width: unset;
        height: 30%;
        gap: 1rem;
        padding: 1.5rem 0 0 0;

        .show-time {
          width: 90%;
          padding: 0.5rem;
          flex-direction: column;
          gap: 0.5rem;

          .time {
            flex: unset;
            font-size: clamp(2.5rem, 14vw, 5rem);
          }

          .date {
            flex: unset;
            flex-direction: row;
            gap: 1rem;

            div {
              font-size: clamp(1rem, 5vw, 2rem);
            }
          }
        }

        .search {
          width: 90%;
          height: auto;
          padding: 0.5rem;

          &-box {
            height: 5rem;
            border-radius: 3rem;
            padding: 0 0.5rem 0 0.5rem;

            input[type="text"] {
              font-size: 1.6rem;
            }

            .select {
              flex: none;
              width: 5rem;
            }

            .do-search {
              max-width: 4rem;
            }
          }
        }
      }
    }

    .logo svg {
      height: 3.2rem;
      width: 3.2rem;
    }
  }

  .container {
    width: 95%;
    min-width: unset;
    max-height: 280px;
  }

  .grid-list {
    grid-template-columns: repeat(auto-fill, minmax(85px, 1fr));
    gap: 8px;
  }

  .setting-list {
    right: 2vw;
    bottom: 3vh;
    gap: 0.6rem;

    .settings,
    .add-url {
      height: 4rem;
      width: 4rem;
      padding: 0.8rem;
    }
  }

  .history-box {
    top: 60px;
    left: 0.3rem;
    right: 0.3rem;

    .history-item {
      padding: 6px 10px;
      font-size: clamp(1.3rem, 4vw, 1.8rem);
      height: clamp(2.2rem, 6vh, 4rem);
    }
  }

  .options-box .option-item {
    padding: 4px 2px;
    gap: 3px;
    font-size: clamp(0.8rem, 3vw, 1.2rem);
    height: clamp(1.8rem, 5vh, 3.5rem);
  }
}
</style>
