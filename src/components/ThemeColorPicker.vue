<template>
  <div class="theme-color-picker">
    <div class="picker-preview" :style="{ backgroundColor: color }">
      <span class="preview-text">示例文字</span>
    </div>

    <div class="picker-row">
      <label class="native-picker" :style="{ backgroundColor: color }" title="选择颜色">
        <input type="color" :value="color" @input="onNativeInput" />
      </label>
      <input
        class="hex-input"
        type="text"
        :value="hexText"
        maxlength="7"
        spellcheck="false"
        placeholder="#RRGGBB"
        @focus="onHexFocus"
        @input="onHexInput"
        @blur="onHexBlur"
      />
    </div>

    <div class="preset-list">
      <button
        v-for="preset in presets"
        :key="preset"
        class="preset"
        :class="{ active: preset === color }"
        :style="{ backgroundColor: preset }"
        :title="preset"
        @click="selectPreset(preset)"
      ></button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { normalizeHex, tryNormalizeHex } from "../../tools/colorTools";

const props = defineProps<{ modelValue: string }>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const presets = [
  "#ddaacc",
  "#e8a2b8",
  "#ef9a72",
  "#f2d06b",
  "#8fce9b",
  "#7ac7c4",
  "#7fb3e8",
  "#b39ddb",
];

const color = computed(() => normalizeHex(props.modelValue));
const hexText = ref(color.value);

// 输入框聚焦期间不回写文本，避免自动补全/打断用户输入
let isEditing = false;

watch(color, (value) => {
  if (!isEditing) hexText.value = value;
});

function onHexFocus() {
  isEditing = true;
}

function onNativeInput(e: Event) {
  emit("update:modelValue", (e.target as HTMLInputElement).value);
}

// 输入过程中只识别、不回写：合法颜色实时应用，文本保持用户输入的内容
function onHexInput(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  hexText.value = value;
  const normalized = tryNormalizeHex(value);
  if (normalized) emit("update:modelValue", normalized);
}

// 失焦后：非法内容恢复为当前生效颜色，合法内容保持用户输入原样
function onHexBlur() {
  isEditing = false;
  if (!tryNormalizeHex(hexText.value)) hexText.value = color.value;
}

function selectPreset(preset: string) {
  emit("update:modelValue", preset);
}
</script>

<style scoped lang="scss">
.theme-color-picker {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 0.5rem 0;
}

.picker-preview {
  width: 100%;
  height: 8rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.15);

  .preview-text {
    font-size: clamp(1.8rem, 1.8vw, 2.6rem);
    color: #fff;
    font-weight: 600;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
  }
}

.picker-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.native-picker {
  position: relative;
  width: 4rem;
  height: 4rem;
  flex-shrink: 0;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid var(--border);
  overflow: hidden;

  input[type="color"] {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    padding: 0;
    border: none;
    background: none;
    opacity: 0;
    cursor: pointer;
  }
}

.hex-input {
  flex: 1;
  height: 4rem;
  padding: 0 0.8rem;
  box-sizing: border-box;
  font-size: clamp(1.3rem, 1.3vw, 1.8rem);
  font-family: var(--mono);
  color: var(--text);
  border-radius: 8px;
  border: 1px solid var(--bg_selection_hover);
  background: var(--bg_search);
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: var(--color_theme);
  }
}

.preset-list {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;

  .preset {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid transparent;
    box-shadow: 0 0 0 1px var(--border);
    transition:
      transform 0.2s ease,
      border-color 0.2s ease;

    &:hover {
      transform: scale(1.1);
    }

    &.active {
      border-color: var(--text-h);
    }
  }
}

@media screen and (max-width: 600px) {
  .picker-preview {
    height: 6rem;
  }
}
</style>
