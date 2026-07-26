<template>
  <div class="settings-content">
    <!-- 背景图片 -->
    <div class="set-background-img">
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
            <images />
            <input
              type="file"
              accept="image/png,image/jpg,image/jpeg"
              @change="$emit('uploadBackground', $event)"
            />
          </label>
          <div class="mask-divider"></div>
          <button
            class="mask-action"
            title="恢复默认"
            @click="$emit('restoreImg')"
          >
            <refresh />
          </button>
        </div>
      </div>
    </div>

    <!-- 页面跳转 -->
    <div class="page-redirect">
      <div>页面跳转:</div>
      <div
        v-for="item in RedirectModeConfig"
        class="page-redirect-option"
        @click="$emit('changeRedirectMode', item)"
      >
        <input
          type="radio"
          name="mode-redirect"
          :id="`${item.value}/${item.modeName}`"
          :value="item.value"
          :checked="customization.redirectMode.value === item.value"
          @change="$emit('changeRedirectMode', item)"
        /><label :for="`${item.value}/${item.modeName}`">{{
          item.modeName
        }}</label>
      </div>
    </div>

    <!-- 颜色主题 -->
    <div class="page-redirect">
      <div>颜色主题:</div>
      <div
        v-for="item in ColorSchemeConfig"
        :key="item.value"
        class="page-redirect-option"
        @click="$emit('changeColorScheme', item)"
      >
        <input
          type="radio"
          name="mode-color-scheme"
          :id="`color-${item.value}`"
          :value="item.value"
          :checked="customization.colorScheme.value === item.value"
          @change="$emit('changeColorScheme', item)"
        /><label :for="`color-${item.value}`">{{ item.modeName }}</label>
      </div>
    </div>

    <!-- 页面字体 -->
    <div class="page-redirect font-setting">
      <div>页面字体:</div>
      <DropDown v-model="fontDropdownOpen" style="flex: 1">
        <template #trigger>
          <div class="font-select">
            <span>{{
              customization.fontFamily === "system-ui"
                ? "系统默认"
                : customization.fontFamily
            }}</span>
            <span class="font-select-arrow">▾</span>
          </div>
        </template>
        <div ref="fontDropdownBox" class="font-dropdown-box modify-scroll-bar">
          <div
            class="font-dropdown-item"
            :class="{ active: customization.fontFamily === 'system-ui' }"
            @click="$emit('selectFont', 'system-ui')"
          >
            系统默认
          </div>
          <div
            v-for="font in systemFonts"
            :key="font"
            class="font-dropdown-item"
            :class="{ active: customization.fontFamily === font }"
            :style="{ fontFamily: font }"
            @click="$emit('selectFont', font)"
          >
            {{ font }}
          </div>
        </div>
      </DropDown>
      <span
        class="font-preview"
        :style="{
          fontFamily:
            customization.fontFamily !== 'system-ui'
              ? customization.fontFamily + ', sans-serif'
              : undefined,
        }"
        >Aa</span
      >
    </div>

    <!-- 高斯模糊 -->
    <div class="page-redirect blur-setting">
      <div>高斯模糊:</div>
      <input
        type="range"
        min="0"
        max="30"
        step="1"
        :value="customization.blurValue"
        @input="
          $emit(
            'changeBlurValue',
            ($event.target as HTMLInputElement).valueAsNumber,
          )
        "
      />
      <span class="blur-value">{{ customization.blurValue }}px</span>
    </div>

    <!-- 背景透明 -->
    <div class="page-redirect blur-setting">
      <div>背景透明:</div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        :value="customization.bgOpacity"
        @input="
          $emit(
            'changeBgOpacity',
            ($event.target as HTMLInputElement).valueAsNumber,
          )
        "
      />
      <span class="blur-value">{{ customization.bgOpacity.toFixed(2) }}</span>
    </div>

    <!-- 导入/导出 -->
    <div class="config-import-export">
      <button class="btn-export" @click="$emit('exportConfig')">
        导出配置
      </button>
      <button class="btn-import" @click="$emit('openImport')">导入配置</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import images from "../assets/images.svg";
import refresh from "../assets/refresh.svg";
import DropDown from "./DropDown.vue";
import type {
  userCustomization,
  RedirectMode,
  ColorSchemeMode,
} from "../types/types";
import RedirectModeConfig from "../config/redirectModeConfig";
import ColorSchemeConfig from "../config/colorSchemeConfig";

const props = defineProps<{
  customization: userCustomization;
  backgroundImageBase64: string | null;
  systemFonts: string[];
}>();

const emit = defineEmits<{
  close: [];
  uploadBackground: [e: Event];
  restoreImg: [];
  changeRedirectMode: [mode: RedirectMode];
  changeColorScheme: [mode: ColorSchemeMode];
  changeBlurValue: [value: number];
  changeBgOpacity: [value: number];
  selectFont: [font: string];
  exportConfig: [];
  openImport: [];
}>();

const fontDropdownOpen = ref(false);
const fontDropdownBox = ref<HTMLDivElement | null>(null);

watch(fontDropdownOpen, (val) => {
  if (val) {
    nextTick(() => {
      const active = fontDropdownBox.value?.querySelector(".active");
      active?.scrollIntoView({ block: "nearest" });
    });
  }
});

watch(
  () => props.systemFonts,
  () => {
    if (fontDropdownOpen.value) {
      nextTick(() => {
        const active = fontDropdownBox.value?.querySelector(".active");
        active?.scrollIntoView({ block: "nearest" });
      });
    }
  },
);
</script>

<style scoped lang="scss">
.set-background-img {
  width: 100%;

  .bg-preview {
    display: block;
    position: relative;
    width: 80%;
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

.font-setting {
  position: relative;

  .font-select {
    height: 2rem;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    font-size: clamp(1.3rem, 1.3vw, 1.8rem);
    padding: 0.3rem 0.5rem;
    border-radius: 4px;
    border: 1px solid var(--bg_selection_hover);
    background: var(--bg_search);
    color: var(--text);
    user-select: none;
    transition: border 0.3s ease;

    .font-select-arrow {
      font-size: 1.2rem;
      margin-left: 0.5rem;
      opacity: 0.6;
    }

    &:hover {
      border-color: var(--color_mizuki);
    }
  }

  .font-dropdown-box {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    z-index: 200;
    max-height: 10vh;
    overflow-y: auto;
    border-radius: 6px;
    background: var(--bg_selection);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    .font-dropdown-item {
      padding: 6px 8px;
      cursor: pointer;
      font-size: clamp(1.2rem, 1.2vw, 1.6rem);
      transition: background 0.2s;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      &.active {
        color: var(--color_mizuki);
      }

      &:hover {
        background: var(--bg_selection_hover);
      }
    }
  }

  .font-preview {
    min-width: 3rem;
    text-align: right;
    font-size: clamp(1.5rem, 1.5vw, 2rem);
  }
}

.config-import-export {
  display: flex;
  gap: 1rem;
  margin: 2rem 0 0 0;
  justify-content: flex-start;

  .btn-export,
  .btn-import {
    padding: 6px 16px;
    cursor: pointer;
    border-radius: 6px;
    border: 1px solid var(--text-h);
    font-size: clamp(1.2rem, 1.2vw, 1.6rem);
    background: none;
    color: var(--text);
    transition: all 0.3s ease;

    &:hover {
      border-color: var(--color_mizuki);
      color: var(--color_mizuki);
    }

    &:active {
      transform: scale(0.95);
    }
  }
}

h1 {
  font-size: clamp(2rem, 2vw, 4rem);
}

@media screen and (max-width: 600px) {
  .page-redirect {
    flex-wrap: wrap;
    font-size: clamp(1.2rem, 4vw, 1.8rem);
    gap: 0.5rem;
  }

  .font-setting {
    .font-dropdown-box {
      max-height: 25vh;

      .font-dropdown-item {
        font-size: clamp(1rem, 3.5vw, 1.3rem);
      }
    }
  }

  .config-import-export {
    flex-wrap: wrap;
    gap: 0.5rem;

    .btn-export,
    .btn-import {
      flex: 1;
      min-width: 80px;
      text-align: center;
    }
  }

  .set-background-img .bg-preview {
    width: 100%;
  }
}
</style>
